import os
import cv2
import threading
import time
import logging
import queue

def extract_youtube_stream_url(youtube_url: str) -> str:
    import yt_dlp
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True,
        'extractor_args': {'youtube': {'player_client': ['android', 'ios', 'web']}}
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        return info.get('url') or info.get('manifest_url')

class FrameManager:
    """
    Lock-free Video Frame Manager.
    Decouples blocking I/O (cv2.VideoCapture.read) from the main inference thread.
    """
    def __init__(self):
        self.cap = None
        self.source_info = {
            "type": "none",
            "url": "",
            "name": "No Source",
            "id": "none"
        }
        self.fps = 0
        
        # Lock-free frame passing using a queue of size 1
        self.frame_queue = queue.Queue(maxsize=1)
        self.is_running = False
        self.read_thread = None
        
        # Latency tracking
        self.latency = 0
        self._last_read_time = time.time()
        
    def set_source(self, config: dict) -> bool:
        self.stop()
        
        source_url = config.get("url")
        source_type = config.get("type", "").lower()
        
        if source_type == "youtube" or "youtube.com" in str(source_url) or "youtu.be" in str(source_url):
            try:
                logging.info(f"Extracting live stream URL for YouTube link: {source_url}")
                extracted_url = extract_youtube_stream_url(str(source_url))
                if extracted_url:
                    source_url = extracted_url
                else:
                    logging.error("Failed to extract stream URL from YouTube link.")
                    return False
            except Exception as e:
                logging.error(f"YouTube stream extraction failed: {e}")
                return False
            
        # Automatic path translation for local datasets in Docker
        if "Dataset.mp4" in str(source_url) and not os.path.exists(str(source_url)):
            if os.path.exists("/app/Dataset.mp4"):
                source_url = "/app/Dataset.mp4"
                
        if "Dataset_annotated.mp4" in str(source_url) and not os.path.exists(str(source_url)):
            if os.path.exists("/app/Dataset_annotated.mp4"):
                source_url = "/app/Dataset_annotated.mp4"
            elif os.path.exists("/app/datasets/accident/Dataset_annotated.mp4"):
                source_url = "/app/datasets/accident/Dataset_annotated.mp4"

        try:
            if str(source_url).isdigit():
                source_url = int(source_url)
        except Exception:
            pass
            
        self.cap = cv2.VideoCapture(source_url)
        if not self.cap.isOpened():
            logging.error(f"Failed to open source: {source_url}")
            return False
            
        self.source_info = config
        self.fps = self.cap.get(cv2.CAP_PROP_FPS) or 30.0
        self._last_read_time = time.time()
        logging.info(f"Successfully opened source: {self.source_info['name']}")
        
        # Reset YOLO tracking state
        try:
            from app.engine.core import detection_engine
            detection_engine.reset()
        except ImportError:
            pass
            
        self.is_running = True
        self.read_thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.read_thread.start()
        
        return True

    def stop(self):
        self.is_running = False
        if self.read_thread:
            self.read_thread.join(timeout=1.0)
        if self.cap:
            self.cap.release()
            
        # Empty queue
        try:
            while not self.frame_queue.empty():
                self.frame_queue.get_nowait()
        except Exception:
            pass

    def _capture_loop(self):
        # Read frames synced to 0.75x of original FPS for smooth, natural playback pacing
        start_time = time.time()
        frames_read = 0
        pacing_fps = self.fps * 0.75 if self.fps > 0 else 22.5
        
        while self.is_running:
            if not self.cap or not self.cap.isOpened():
                time.sleep(0.1)
                start_time = time.time()
                frames_read = 0
                continue
                
            # Calculate exactly which frame we SHOULD be on based on real time
            expected_idx = int((time.time() - start_time) * pacing_fps)
            
            # If we haven't reached the expected frame yet, read the next one
            if frames_read <= expected_idx:
                ret, frame = self.cap.read()
                if not ret:
                    # Loop MP4s
                    if self.source_info.get("type") in ["mp4", "accident_demo"]:
                        self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        start_time = time.time()
                        frames_read = 0
                        continue
                    else:
                        time.sleep(0.1)
                        continue
                        
                frames_read += 1
                
                # If queue is full, drop the stale frame
                if self.frame_queue.full():
                    try:
                        self.frame_queue.get_nowait()
                    except queue.Empty:
                        pass
                
                # Put the freshest frame
                self.frame_queue.put_nowait(frame)
            else:
                # We are reading faster than the target video pacing, so wait.
                time.sleep(0.01)

    def read_frame(self):
        """
        Non-blocking read for the inference thread.
        Returns the newest frame, or None if no new frame is available.
        """
        try:
            frame = self.frame_queue.get_nowait()
            now = time.time()
            self.latency = int((now - self._last_read_time) * 1000)
            self._last_read_time = now
            # Cap latency visuals
            if self.latency > 999: self.latency = 999
            if self.latency < 5: self.latency = 24
            return frame
        except queue.Empty:
            return None
            
    def get_status(self):
        is_connected = self.cap is not None and self.cap.isOpened()
        resolution = "0x0"
        if is_connected:
            width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            resolution = f"{width}x{height}"
            
        return {
            "status": "Connected" if is_connected else "Disconnected",
            "name": self.source_info.get("name", "-"),
            "type": self.source_info.get("type", "-"),
            "fps": round(self.fps, 1),
            "resolution": resolution,
            "latency": self.latency,
            "connected": is_connected,
            "url": self.source_info.get("url", "")
        }

# Singleton instance
frame_manager = FrameManager()
