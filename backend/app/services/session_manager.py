import time
import re
import cv2
import base64
import numpy as np
import logging
from typing import Dict, List, Optional, Tuple
from app.services.anpr_engine import anpr_engine

class ANPRSessionManager:
    """
    In-Memory Backend Session Manager for Vehicle Intelligence (v5.0, v5.1 & v5.2).
    Single Source of Truth for live vehicle monitoring session data.
    0 PostgreSQL database writes; session resets completely on clear or server restart.
    """
    def __init__(self):
        self.session_id: str = str(int(time.time()))
        self.start_time: float = time.time()
        self.tracks: Dict[str, Dict] = {} # track_key -> vehicle dict
        self.ocr_cache: Dict[str, Dict] = {} # track_key -> cached OCR dict
        
    def reset_session(self):
        self.session_id = str(int(time.time()))
        self.start_time = time.time()
        self.tracks.clear()
        self.ocr_cache.clear()
        return {"status": "cleared", "session_id": self.session_id}

    def _crop_to_base64(self, crop_bgr: np.ndarray) -> str:
        try:
            if crop_bgr is None or crop_bgr.size == 0:
                return "/static/snapshots/placeholder.jpg"
            ret, buffer = cv2.imencode('.jpg', crop_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            if ret:
                b64 = base64.b64encode(buffer).decode('utf-8')
                return f"data:image/jpeg;base64,{b64}"
        except Exception as e:
            logging.error(f"Failed to encode crop to Base64: {e}")
        return "/static/snapshots/placeholder.jpg"

    def process_vehicle_track(
        self, 
        frame: np.ndarray, 
        track_id: int, 
        vehicle_type: str, 
        bbox: List[int],
        camera_id: str = "Live City Camera 01"
    ) -> Dict:
        now_str = time.strftime("%H:%M:%S")
        track_key = f"TRK-{track_id}"
        
        # 1. Dedicated Plate ROI Crop & Vehicle Crop Extraction
        veh_crop, plate_crop = anpr_engine.detect_plate_roi(frame, bbox)
        
        # 2. Check OCR Cache
        cached = self.ocr_cache.get(track_key)
        
        if cached and cached.get("license_plate") != "Reading Plate...":
            plate = cached["license_plate"]
            conf = cached["ocr_confidence"]
            plate_crop = cached.get("plate_crop_bgr", plate_crop)
            plate_b64 = cached.get("plate_b64")
            veh_b64 = cached.get("veh_b64")
        else:
            # 3. Perform Real OCR on cropped plate ROI
            ocr_text, ocr_conf = anpr_engine.perform_ocr(plate_crop)
            plate = ocr_text
            conf = ocr_conf
            
            plate_b64 = self._crop_to_base64(plate_crop)
            veh_b64 = self._crop_to_base64(veh_crop)
            
            self.ocr_cache[track_key] = {
                "license_plate": plate,
                "ocr_confidence": conf,
                "plate_crop_bgr": plate_crop,
                "plate_b64": plate_b64,
                "veh_b64": veh_b64
            }

        # 4. Maintain Strictly ONE record per track_id
        if track_key not in self.tracks:
            first_seen_ts = time.time()
            self.tracks[track_key] = {
                "id": track_key,
                "track_id": track_id,
                "vehicle_type": vehicle_type.capitalize(),
                "license_plate": plate,
                "ocr_confidence": conf,
                "camera_id": camera_id,
                "first_seen": now_str,
                "last_seen": now_str,
                "first_seen_ts": first_seen_ts,
                "last_seen_ts": time.time(),
                "status": "NEW",
                "duration": "1s",
                "vehicle_snapshot": veh_b64,
                "plate_snapshot": plate_b64,
                "plate_crop_bgr": plate_crop
            }
        else:
            v = self.tracks[track_key]
            v["last_seen"] = now_str
            v["last_seen_ts"] = time.time()
            v["status"] = "ACTIVE"
            v["license_plate"] = plate
            v["ocr_confidence"] = max(v["ocr_confidence"], conf)
            v["plate_snapshot"] = plate_b64
            v["vehicle_snapshot"] = veh_b64
            v["plate_crop_bgr"] = plate_crop
            
            elapsed_sec = max(1, int(v["last_seen_ts"] - v["first_seen_ts"]))
            if elapsed_sec < 60:
                v["duration"] = f"{elapsed_sec}s"
            else:
                v["duration"] = f"{elapsed_sec // 60}m {elapsed_sec % 60}s"
                
        return self.tracks[track_key]

    def mark_left_cameras(self, active_track_ids: List[int], timeout_sec: float = 4.0):
        now = time.time()
        active_keys = {f"TRK-{tid}" for tid in active_track_ids}
        for k, v in self.tracks.items():
            if k not in active_keys and now - v.get("last_seen_ts", now) > timeout_sec:
                v["status"] = "LEFT CAMERA"

    def get_session_data(self) -> Dict:
        now = time.time()
        session_elapsed = max(1, int(now - self.start_time))
        dur_str = f"{session_elapsed // 60}m {session_elapsed % 60}s" if session_elapsed >= 60 else f"{session_elapsed}s"
        
        vehicles_list = []
        for v in self.tracks.values():
            clean_v = {k: val for k, val in v.items() if k != "plate_crop_bgr"}
            vehicles_list.append(clean_v)
            
        vehicles_list.sort(key=lambda x: x.get("last_seen_ts", 0), reverse=True)
        
        # Count unique VALIDATED plates only
        valid_plates = {v["license_plate"] for v in vehicles_list if v["license_plate"] and v["license_plate"] != "Reading Plate..."}
        unique_plates = len(valid_plates)
        
        car_cnt = len([v for v in vehicles_list if v["vehicle_type"].lower() == "car"])
        truck_cnt = len([v for v in vehicles_list if v["vehicle_type"].lower() == "truck"])
        bus_cnt = len([v for v in vehicles_list if v["vehicle_type"].lower() == "bus"])
        bike_cnt = len([v for v in vehicles_list if v["vehicle_type"].lower() in ["motorcycle", "bike"]])
        
        conf_list = [v["ocr_confidence"] for v in vehicles_list if v["ocr_confidence"] > 0]
        avg_conf = round(sum(conf_list) / len(conf_list), 1) if conf_list else 0.0
        
        return {
            "session_id": self.session_id,
            "session_duration": dur_str,
            "metrics": {
                "vehicles_seen": len(vehicles_list),
                "unique_plates": unique_plates,
                "cars": car_cnt,
                "trucks": truck_cnt,
                "buses": bus_cnt,
                "motorcycles": bike_cnt,
                "avg_ocr_confidence": avg_conf,
                "current_fps": 30.0,
                "camera_status": "Connected"
            },
            "vehicles": vehicles_list
        }

# Singleton Instance
anpr_session_manager = ANPRSessionManager()
