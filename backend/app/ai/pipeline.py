import cv2
import time
from typing import Generator
from app.ai.detector import VehicleDetector
from app.services.video_source import video_managers

class VisionPipeline:
    """
    On-Demand MJPEG Streaming Engine.
    Only processes frames when a client is actively streaming.
    """
    def __init__(self, channel: str):
        self.channel = channel
        self.detector = VehicleDetector()

    def stream_video(self) -> Generator[bytes, None, None]:
        """
        Tight, synchronous loop that reads frames from the manager, 
        detects vehicles, renders clean boxes, and yields MJPEG frames.
        """
        video_manager = video_managers.get_manager(self.channel)
        
        # Color palette for bounding boxes (Cyan to look professional)
        box_color = (255, 255, 0) # BGR format
        
        while True:
            # 1. Fetch latest raw frame from video source
            frame = video_manager.get_current_frame()
            if frame is None:
                # Slight throttle if source is lagging, to prevent CPU spin
                time.sleep(0.016)
                continue
                
            # 2. Track objects
            result = self.detector.track(frame)
            annotated_frame = frame.copy()
            
            # 3. Render clean, minimal bounding boxes
            if result is not None and result.boxes is not None:
                for box in result.boxes:
                    if box.id is not None:
                        # Extract coordinates and track ID
                        x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                        track_id = int(box.id[0].cpu().numpy())
                        
                        # Draw minimal bounding box
                        cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), box_color, 2)
                        
                        # Draw Track ID (e.g., #1) above the box
                        label = f"#{track_id}"
                        
                        # Add a small semi-transparent background for text legibility
                        (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                        cv2.rectangle(annotated_frame, (x1, y1 - h - 10), (x1 + w, y1), box_color, -1)
                        cv2.putText(annotated_frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
            
            # 4. Fast JPEG Encoding
            ret, buffer = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
            if ret:
                # 5. Yield MJPEG boundary
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
