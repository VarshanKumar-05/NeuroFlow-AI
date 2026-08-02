import time
import re
import cv2
import base64
import numpy as np
import logging
from typing import Dict, List, Optional, Tuple

class ANPRSessionManager:
    """
    In-Memory Backend Session Manager for Vehicle Intelligence (v5.0 & v5.1).
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

    def validate_and_normalize_plate(self, raw_ocr: str, conf: float) -> Optional[str]:
        if not raw_ocr or conf < 55.0:
            return None
            
        clean = re.sub(r'[^A-Z0-9]', '', raw_ocr.upper())
        if len(clean) < 4 or len(clean) > 12:
            return None
            
        # Character disambiguation / normalization (e.g. AP39AB1234 format)
        normalized = clean
        if len(normalized) >= 8:
            prefix = normalized[:2]
            suffix = normalized[-4:]
            middle = normalized[2:-4]
            
            # Normalize state prefix letters (e.g. 0P -> OP, A1 -> AI)
            prefix = prefix.replace('0', 'O').replace('1', 'I')
            # Normalize numeric suffix digits (e.g. O -> 0, I -> 1)
            suffix = suffix.replace('O', '0').replace('I', '1').replace('Z', '2')
            normalized = f"{prefix}{middle}{suffix}"
            
        return normalized

    def _crop_to_base64(self, crop_bgr: np.ndarray) -> str:
        try:
            if crop_bgr is None or crop_bgr.size == 0:
                return "/static/snapshots/placeholder.jpg"
            ret, buffer = cv2.imencode('.jpg', crop_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
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
        raw_ocr: Optional[str] = None, 
        ocr_conf: float = 0.0,
        camera_id: str = "Live City Camera 01"
    ) -> Dict:
        now_str = time.strftime("%H:%M:%S")
        track_key = f"TRK-{track_id}"
        x1, y1, x2, y2 = map(int, bbox)
        h, w = frame.shape[:2]
        
        # Clamp bounding box coordinates
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        
        # Vehicle Crop & Plate ROI Crop
        veh_crop = frame[y1:y2, x1:x2] if (y2 > y1 and x2 > x1) else None
        plate_y1 = int(y1 + (y2 - y1) * 0.55)
        plate_y2 = min(y2, int(y1 + (y2 - y1) * 0.95))
        plate_crop = frame[plate_y1:plate_y2, x1:x2] if (plate_y2 > plate_y1 and x2 > x1) else veh_crop
        
        # Validate OCR & lookup cache (NO HARDCODED PLACEHOLDERS)
        cached = self.ocr_cache.get(track_key)
        valid_plate = self.validate_and_normalize_plate(raw_ocr or "", ocr_conf)
        
        if cached:
            if valid_plate and ocr_conf > cached["ocr_confidence"] + 10.0:
                plate = valid_plate
                conf = round(ocr_conf, 1)
                plate_b64 = self._crop_to_base64(plate_crop)
                self.ocr_cache[track_key] = {
                    "license_plate": plate, 
                    "ocr_confidence": conf, 
                    "plate_crop": plate_crop,
                    "plate_b64": plate_b64
                }
            else:
                plate = cached["license_plate"]
                conf = cached["ocr_confidence"]
                plate_crop = cached.get("plate_crop", plate_crop)
                plate_b64 = cached.get("plate_b64", self._crop_to_base64(plate_crop))
        else:
            if valid_plate:
                plate = valid_plate
                conf = round(ocr_conf, 1)
            else:
                plate = "Reading Plate..."
                conf = 0.0
            plate_b64 = self._crop_to_base64(plate_crop)
            self.ocr_cache[track_key] = {
                "license_plate": plate, 
                "ocr_confidence": conf, 
                "plate_crop": plate_crop,
                "plate_b64": plate_b64
            }
            
        veh_b64 = self._crop_to_base64(veh_crop) if (cached is None or "veh_b64" not in cached) else cached.get("veh_b64", self._crop_to_base64(veh_crop))
        if cached and "veh_b64" not in cached:
            cached["veh_b64"] = veh_b64

        # Strictly ONE record per track_id
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
