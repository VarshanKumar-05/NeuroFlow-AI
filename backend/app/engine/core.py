import asyncio
import torch
import numpy as np
import cv2
import threading
import time
import logging
from ultralytics import YOLO
from app.engine.frame_manager import frame_manager
from app.engine.state_manager import state_manager
from app.engine.analytics import AnalyticsEngine

class DetectionEngine:
    """
    Unified Computer Vision Engine.
    Runs a single instance of YOLO and ByteTrack in a background thread.
    Publishes raw & annotated frames with channel-aware overlay rendering.
    """
    def __init__(self, model_path: str = "yolo11n.pt"):
        self.model_path = model_path
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.fp16 = self.device == "cuda"
        
        logging.info(f"[Engine] Booting YOLOv11 on {self.device} (FP16: {self.fp16})")
        self.model = YOLO(model_path)
        
        self.conf_thresh = 0.25
        self.iou_thresh = 0.45
        self.target_classes = [2, 3, 5, 7] # car, motorcycle, bus, truck
        self.imgsz = 480 if self.device == "cpu" else 640
        
        # Centralized Analytics Engine
        self.analytics = AnalyticsEngine()
        
        # Threading state
        self.is_running = False
        self.thread = None
        self.lock = threading.Lock()
        
        # Shared data
        self.latest_raw_frame = None
        self.latest_stabilized_objects = []
        self.inference_fps = 0
        self.streaming_fps = 0
        self.needs_reset = False
        self.debug_mode = False

        # Warmup
        dummy = np.zeros((640, 640, 3), dtype=np.uint8)
        self.model(dummy, device=self.device, half=self.fp16, verbose=False)

    @property
    def latest_metrics(self):
        with self.lock:
            return self.analytics.latest_metrics.copy()

    def start(self):
        if not self.is_running:
            self.is_running = True
            self.thread = threading.Thread(target=self._run_loop, daemon=True)
            self.thread.start()
            logging.info("[Engine] Detection loop started.")

    def stop(self):
        self.is_running = False
        if self.thread:
            self.thread.join()

    def reset(self):
        with self.lock:
            self.needs_reset = True
            self.latest_raw_frame = None
            self.latest_stabilized_objects = []
            self.analytics.reset()

    async def stream_video(self, channel: str = "dashboard"):
        """
        Asynchronous MJPEG Stream Generator for FastAPI.
        Yields non-blocking frames rendered strictly according to the channel specification.
        """
        last_frame_ref = None
        loop = asyncio.get_event_loop()
        import concurrent.futures
        pool = concurrent.futures.ThreadPoolExecutor(max_workers=2)
        
        def encode_frame(raw_f, objs):
            if raw_f is None:
                return None
            f = raw_f.copy()
            rendered = self._render_overlay(f, objs, channel=channel)
            encode_w, encode_h = 1280, 720
            if rendered.shape[1] > encode_w:
                rendered = cv2.resize(rendered, (encode_w, encode_h))
            ret, buffer = cv2.imencode('.jpg', rendered, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
            if ret:
                return buffer.tobytes()
            return None

        stream_frames = 0
        stream_start_time = time.time()

        while True:
            with self.lock:
                frame_arr = self.latest_raw_frame
                objs = list(self.latest_stabilized_objects) if self.latest_stabilized_objects else []
            
            current_ref = id(frame_arr)
            if frame_arr is None or current_ref == last_frame_ref:
                await asyncio.sleep(0.016) # 60Hz polling
                continue
                
            last_frame_ref = current_ref
            
            jpg_bytes = await loop.run_in_executor(pool, encode_frame, frame_arr, objs)
            
            if jpg_bytes:
                stream_frames += 1
                now = time.time()
                elapsed = now - stream_start_time
                if elapsed > 1.0:
                    with self.lock:
                        self.streaming_fps = round(stream_frames / elapsed, 1)
                    stream_frames = 0
                    stream_start_time = now
                    
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + jpg_bytes + b'\r\n')
                   
    def _get_class_color(self, cls_id):
        colors = {
            2: (0, 229, 255),    # Car: Cyan
            3: (129, 185, 16),   # Motorcycle/Bike: Green
            5: (246, 130, 59),   # Bus: Blue
            7: (11, 158, 245)    # Truck: Amber
        }
        return colors.get(cls_id, (255, 255, 255))
        
    def _get_class_name(self, cls_id):
        names = {2: "CAR", 3: "BIKE", 5: "BUS", 7: "TRUCK"}
        return names.get(cls_id, "VEH")

    def _render_overlay(self, frame, stabilized_objects, channel: str = "dashboard"):
        height, width = frame.shape[:2]
        
        if self.debug_mode:
            line_y = int(height * self.analytics.counter.roi_line_y_ratio)
            cv2.line(frame, (0, line_y), (width, line_y), (0, 0, 255), 2)
        
        if not stabilized_objects:
            return frame

        # Feed Model 1 tracked vehicle ROIs to Model 2 (ANPRSessionManager)
        from app.services.session_manager import anpr_session_manager
        active_ids = [obj["track_id"] for obj in stabilized_objects]
        anpr_session_manager.mark_left_cameras(active_ids)

        for obj in stabilized_objects:
            x1, y1, x2, y2 = map(int, obj["bbox"])
            orig_id = obj["track_id"]
            cls_id = obj["class_id"]
            name = self._get_class_name(cls_id)
            anpr_session_manager.process_vehicle_track(
                frame=frame,
                track_id=orig_id,
                vehicle_type=name,
                bbox=[x1, y1, x2, y2]
            )

        # STRICT MODULE BOUNDARY: Live Vision / Dashboard / Incidents display ONLY standard YOLO bounding boxes
        if channel != "vehicles":
            for obj in stabilized_objects:
                x1, y1, x2, y2 = map(int, obj["bbox"])
                orig_id = obj["track_id"]
                cls_id = obj["class_id"]
                
                color = self._get_class_color(cls_id)
                name = self._get_class_name(cls_id)
                
                # Standard clean bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)
                
                # Clean vehicle class tag
                label = f"{name} #{orig_id}"
                (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
                cv2.rectangle(frame, (x1, y1 - h - 8), (x1 + w + 6, y1), color, -1, cv2.LINE_AA)
                cv2.putText(frame, label, (x1 + 3, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 1, cv2.LINE_AA)
            return frame

        # VEHICLE INTELLIGENCE CHANNEL: Full ANPR Floating Plate Crop Previews
        sorted_objs = sorted(stabilized_objects, key=lambda o: o["bbox"][1])
        placed_previews = []

        for obj in sorted_objs:
            x1, y1, x2, y2 = map(int, obj["bbox"])
            orig_id = obj["track_id"]
            cls_id = obj["class_id"]
            name = self._get_class_name(cls_id)
            
            # Fetch track session data from ANPRSessionManager
            session_rec = anpr_session_manager.process_vehicle_track(
                frame=frame,
                track_id=orig_id,
                vehicle_type=name,
                bbox=[x1, y1, x2, y2]
            )
            
            plate_text = session_rec["license_plate"]
            ocr_conf = session_rec["ocr_confidence"]
            plate_crop_bgr = session_rec.get("plate_crop_bgr")
            
            # 1. Draw Vehicle Bounding Box (2px thick green/cyan)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 229, 255), 2, cv2.LINE_AA)
            
            # 2. Vehicle Class Tag below box
            cv2.putText(frame, name, (x1 + 4, y1 - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 229, 255), 1, cv2.LINE_AA)
            
            # 3. Calculate Floating Plate Preview Box position with Overlap Prevention
            box_w, box_h = 165, 52
            target_y = y1 - 65
            target_x = max(5, min(width - box_w - 5, x1))
            
            for prev_x, prev_y in placed_previews:
                if abs(target_x - prev_x) < 140 and abs(target_y - prev_y) < 45:
                    target_y -= 45
                    
            target_y = max(5, target_y)
            placed_previews.append((target_x, target_y))

            # 4. Outer Floating Plate Container Box
            sub_y2 = min(height, target_y + box_h)
            sub_x2 = min(width, target_x + box_w)
            
            if target_y < height and target_x < width and sub_y2 > target_y and sub_x2 > target_x:
                overlay_roi = frame[target_y:sub_y2, target_x:sub_x2]
                dark_bg = np.zeros_like(overlay_roi)
                cv2.addWeighted(overlay_roi, 0.25, dark_bg, 0.75, 0, overlay_roi)
                
                # Green border for validated plate, amber for "Reading Plate..."
                border_color = (52, 211, 153) if plate_text != "Reading Plate..." else (0, 165, 255)
                cv2.rectangle(frame, (target_x, target_y), (target_x + box_w, target_y + box_h), border_color, 1, cv2.LINE_AA)
                
                # 5. Insert Resized Plate Crop Image inside container
                if plate_crop_bgr is not None and plate_crop_bgr.size > 0:
                    try:
                        resized_crop = cv2.resize(plate_crop_bgr, (70, 28))
                        crop_h, crop_w = resized_crop.shape[:2]
                        c_y1, c_x1 = target_y + 4, target_x + 4
                        c_y2, c_x2 = c_y1 + crop_h, c_x1 + crop_w
                        if c_y2 <= height and c_x2 <= width:
                            frame[c_y1:c_y2, c_x1:c_x2] = resized_crop
                            cv2.rectangle(frame, (c_x1, c_y1), (c_x2, c_y2), (255, 255, 255), 1)
                    except Exception:
                        pass
                        
                # 6. Render Plate Text & Confidence Badge (NO HARDCODED VALUES)
                plate_str = f"{plate_text}"
                conf_str = f"{ocr_conf}%" if ocr_conf > 0 else "SCANNING"
                
                font_scale = 0.4 if plate_text == "Reading Plate..." else 0.45
                text_color = (0, 255, 255) if plate_text != "Reading Plate..." else (200, 200, 200)
                
                cv2.putText(frame, plate_str, (target_x + 78, target_y + 18), cv2.FONT_HERSHEY_SIMPLEX, font_scale, text_color, 1, cv2.LINE_AA)
                cv2.putText(frame, conf_str, (target_x + 78, target_y + 36), cv2.FONT_HERSHEY_SIMPLEX, 0.4, border_color, 1, cv2.LINE_AA)
                
        return frame

    def _run_loop(self):
        frame_count = 0
        start_time = time.time()
        
        while self.is_running:
            try:
                if self.needs_reset:
                    logging.info("[Engine] Resetting YOLO tracker state...")
                    self.model = YOLO(self.model_path)
                    dummy = np.zeros((640, 640, 3), dtype=np.uint8)
                    self.model(dummy, device=self.device, half=self.fp16, verbose=False)
                    state_manager.reset()
                    self.needs_reset = False
                    
                frame = frame_manager.read_frame()
                if frame is None:
                    time.sleep(0.016)
                    continue
                    
                # High-speed inference & tracking
                results = self.model.track(
                    frame,
                    device=self.device,
                    half=self.fp16,
                    persist=True,
                    tracker="bytetrack.yaml",
                    conf=self.conf_thresh,
                    iou=self.iou_thresh,
                    classes=self.target_classes,
                    imgsz=self.imgsz,
                    verbose=False
                )
                
                result = results[0] if len(results) > 0 else None
                stabilized_objects = state_manager.update(result)

                if stabilized_objects:
                    try:
                        from app.services.session_manager import anpr_session_manager
                        active_ids = [obj["track_id"] for obj in stabilized_objects]
                        anpr_session_manager.mark_left_cameras(active_ids)
                        for obj in stabilized_objects:
                            x1, y1, x2, y2 = map(int, obj["bbox"])
                            orig_id = obj["track_id"]
                            cls_id = obj["class_id"]
                            name = self._get_class_name(cls_id)
                            anpr_session_manager.process_vehicle_track(
                                frame=frame,
                                track_id=orig_id,
                                vehicle_type=name,
                                bbox=[x1, y1, x2, y2]
                            )
                    except Exception as e:
                        logging.error(f"[Engine] ANPR feed error in run_loop: {e}")
                
                with self.lock:
                    self.analytics.process_frame(
                        frame_width=frame.shape[1],
                        frame_height=frame.shape[0],
                        stabilized_objects=stabilized_objects,
                        inference_fps=self.inference_fps,
                        streaming_fps=self.streaming_fps
                    )
                    self.latest_raw_frame = frame.copy()
                    self.latest_stabilized_objects = stabilized_objects
                        
                frame_count += 1
                elapsed = time.time() - start_time
                if elapsed > 1.0:
                    self.inference_fps = round(frame_count / elapsed, 1)
                    frame_count = 0
                    start_time = time.time()
                            
            except Exception as e:
                logging.error(f"[Engine] Crash in run loop: {e}", exc_info=True)
                time.sleep(1)

# Singleton instance
detection_engine = DetectionEngine()
