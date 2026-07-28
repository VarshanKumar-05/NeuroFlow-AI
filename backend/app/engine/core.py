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
    Publishes the latest processed frame and delegates analytics to the centralized AnalyticsEngine.
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
        self.latest_annotated_frame = None
        self.inference_fps = 0
        self.streaming_fps = 0
        self.needs_reset = False
        self.debug_mode = False # Set to False in production

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
            self.latest_annotated_frame = None
            self.analytics.reset()

    async def stream_video(self):
        """
        Asynchronous MJPEG Stream Generator for FastAPI.
        Yields non-blocking frames with low latency for the dashboard.
        """
        last_frame_ref = None
        loop = asyncio.get_event_loop()
        import concurrent.futures
        pool = concurrent.futures.ThreadPoolExecutor(max_workers=2)
        
        def encode_frame(f):
            encode_w, encode_h = 1280, 720
            if f.shape[1] > encode_w:
                f = cv2.resize(f, (encode_w, encode_h))
            ret, buffer = cv2.imencode('.jpg', f, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
            if ret:
                return buffer.tobytes()
            return None

        stream_frames = 0
        stream_start_time = time.time()

        while True:
            with self.lock:
                frame_arr = self.latest_annotated_frame
            
            # Use id() to ensure we only process genuinely new frames, dropping stales
            current_ref = id(frame_arr)
            if frame_arr is None or current_ref == last_frame_ref:
                await asyncio.sleep(0.016) # 60Hz polling
                continue
                
            last_frame_ref = current_ref
            
            # Asynchronously encode outside the YOLO loop and outside the main AsyncIO event loop!
            jpg_bytes = await loop.run_in_executor(pool, encode_frame, frame_arr)
            
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
            2: (255, 229, 0),    # Car: Cyan-ish -> BGR: (255, 229, 0) Wait, RGB Cyan is (0,229,255). BGR: (255, 229, 0)
            3: (129, 185, 16),   # Motorcycle/Bike: Green -> BGR: (129, 185, 16)
            5: (246, 130, 59),   # Bus: Blue -> BGR: (246, 130, 59)
            7: (11, 158, 245)    # Truck: Amber -> BGR: (11, 158, 245)
        }
        return colors.get(cls_id, (255, 255, 255))
        
    def _get_class_name(self, cls_id):
        names = {2: "CAR", 3: "BIKE", 5: "BUS", 7: "TRUCK"}
        return names.get(cls_id, "VEH")

    def _render_overlay(self, frame, stabilized_objects):
        height, width = frame.shape[:2]
        
        if self.debug_mode:
            line_y = int(height * self.analytics.counter.roi_line_y_ratio)
            cv2.line(frame, (0, line_y), (width, line_y), (0, 0, 255), 2)
        
        if stabilized_objects:
            for obj in stabilized_objects:
                x1, y1, x2, y2 = map(int, obj["bbox"])
                orig_id = obj["track_id"]
                cls_id = obj["class_id"]
                
                color = self._get_class_color(cls_id)
                name = self._get_class_name(cls_id)
                
                # Draw Bounding Box (2px thick)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)
                
                # Minimal Label
                label = f"{name} {orig_id}"
                (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(frame, (x1, y1 - h - 10), (x1 + w, y1), color, -1, cv2.LINE_AA)
                cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
                    
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
                
                with self.lock:
                    self.analytics.process_frame(
                        frame_width=frame.shape[1],
                        frame_height=frame.shape[0],
                        stabilized_objects=stabilized_objects,
                        inference_fps=self.inference_fps,
                        streaming_fps=self.streaming_fps
                    )
                
                # Render using zero-copy input (frame is mutated directly)
                annotated_frame = self._render_overlay(frame, stabilized_objects)
                
                with self.lock:
                    # Store a fast copy of the annotated numpy array to completely free the inference loop
                    self.latest_annotated_frame = annotated_frame.copy()
                        
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
