import torch
import numpy as np
from ultralytics import YOLO

class VehicleDetector:
    """
    Clean, highly-optimized wrapper for YOLOv11 and ByteTrack.
    Built for maximum FPS and stable tracking.
    """
    def __init__(self, model_path: str = "yolo11n.pt"):
        # Optimal thresholds for fast, clean detection without ghosting
        self.conf_thresh = 0.35 
        self.iou_thresh = 0.45
        
        # Use CUDA if available, fallback to CPU
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.fp16 = self.device == "cuda"  # Enable FP16 on GPU for massive speedup
        
        print(f"Loading YOLOv11 on {self.device} (FP16: {self.fp16})...")
        self.model = YOLO(model_path)
        
        # 2: car, 3: motorcycle, 5: bus, 7: truck
        self.target_classes = [2, 3, 5, 7]
        
        # Warmup the model with a dummy frame to fuse layers and initialize CUDA memory
        dummy_frame = np.zeros((640, 640, 3), dtype=np.uint8)
        self.model(dummy_frame, device=self.device, half=self.fp16, verbose=False)

    def track(self, frame: np.ndarray):
        """
        Runs detection and ByteTrack tracking on a single frame.
        Returns the raw Ultralytics Results object for custom rendering.
        """
        # imgz=640 is the sweet spot for 1080p surveillance video
        results = self.model.track(
            frame,
            device=self.device,
            half=self.fp16,
            persist=True,
            tracker="bytetrack.yaml",
            conf=self.conf_thresh,
            iou=self.iou_thresh,
            classes=self.target_classes,
            imgsz=640,
            verbose=False
        )
        
        return results[0] if len(results) > 0 else None
