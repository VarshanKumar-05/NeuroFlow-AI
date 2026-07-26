import cv2
import asyncio
import time
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any

class BaseVideoAdapter(ABC):
    def __init__(self, source_id: str, name: str, url: str):
        self.source_id = source_id
        self.name = name
        self.url = url
        self.is_connected = False
        self._fps = 0.0
        self._resolution = (0, 0)
        self._last_frame_time = time.time()
        self.latency = 0

    @abstractmethod
    def connect(self) -> bool:
        pass

    @abstractmethod
    def disconnect(self):
        pass

    @abstractmethod
    def getFrame(self) -> Optional[Any]:
        pass

    def getStatus(self) -> dict:
        return {
            "status": "Connected" if self.is_connected else "Disconnected",
            "name": self.name,
            "type": self.__class__.__name__.replace('Adapter', '').lower(),
            "fps": round(self.getFPS(), 1),
            "resolution": f"{self.getResolution()[0]}x{self.getResolution()[1]}",
            "latency": self.latency,
            "connected": self.is_connected,
            "url": self.url
        }

    def getFPS(self) -> float:
        return self._fps

    def getResolution(self) -> tuple:
        return self._resolution

    def _update_latency(self):
        now = time.time()
        self.latency = int((now - self._last_frame_time) * 1000)
        self._last_frame_time = now
        if self.latency > 999: self.latency = 999
        if self.latency < 5: self.latency = 24

class OpenCVAdapter(BaseVideoAdapter):
    """Base class for adapters that use OpenCV's VideoCapture"""
    def __init__(self, source_id: str, name: str, url: str):
        super().__init__(source_id, name, url)
        self.cap: Optional[cv2.VideoCapture] = None

    def _get_target(self):
        return self.url

    def connect(self) -> bool:
        try:
            self.cap = cv2.VideoCapture(self._get_target())
            if self.cap.isOpened():
                self.is_connected = True
                self._fps = self.cap.get(cv2.CAP_PROP_FPS) or 30.0
                width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                self._resolution = (width, height)
                return True
            else:
                self.is_connected = False
                raise ValueError(f"cv2.VideoCapture failed to open target: {self._get_target()}")
        except Exception:
            self.is_connected = False
            return False

    def disconnect(self):
        self.is_connected = False
        if self.cap:
            try:
                self.cap.release()
            except:
                pass
            self.cap = None

    def getFrame(self) -> Optional[Any]:
        if not self.is_connected or not self.cap:
            return None
        try:
            ret, frame = self.cap.read()
            if not ret:
                self.is_connected = False
                return None
            self._update_latency()
            return frame
        except Exception:
            self.is_connected = False
            return None

class MP4Adapter(OpenCVAdapter):
    def getFrame(self) -> Optional[Any]:
        if not self.is_connected or not self.cap:
            return None
        try:
            ret, frame = self.cap.read()
            if not ret:
                # Loop automatically if MP4 ends
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = self.cap.read()
                if not ret:
                    self.is_connected = False
                    return None
            self._update_latency()
            return frame
        except Exception:
            self.is_connected = False
            return None

class RTSPAdapter(OpenCVAdapter):
    pass

class IPCameraAdapter(OpenCVAdapter):
    pass

class WebcamAdapter(OpenCVAdapter):
    def _get_target(self):
        try:
            return int(self.url)
        except ValueError:
            return self.url

class HLSAdapter(OpenCVAdapter):
    pass

class YouTubeAdapter(OpenCVAdapter):
    def connect(self) -> bool:
        try:
            import yt_dlp
            ydl_opts = {'format': 'best'}
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(self.url, download=False)
                stream_url = info.get('url', self.url)
            self.cap = cv2.VideoCapture(stream_url)
            if self.cap.isOpened():
                self.is_connected = True
                self._fps = self.cap.get(cv2.CAP_PROP_FPS) or 30.0
                width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                self._resolution = (width, height)
                return True
            else:
                self.is_connected = False
                return False
        except Exception as e:
            print(f"YouTubeAdapter error: {e}")
            self.is_connected = False
            return False

class VideoManager:
    def __init__(self):
        self.active_adapter: Optional[BaseVideoAdapter] = None
        self.current_config = {}
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 5
        self._last_reconnect_time = 0

    def set_source(self, source_config: dict) -> bool:
        if self.active_adapter:
            self.active_adapter.disconnect()
            
        self.current_config = source_config
        self.reconnect_attempts = 0
        s_type = source_config.get('type', 'mp4').lower()
        url = source_config.get('url', '')
        name = source_config.get('name', 'Unknown Camera')
        s_id = source_config.get('id', 'cam-1')
        
        if s_type == 'rtsp':
            self.active_adapter = RTSPAdapter(s_id, name, url)
        elif s_type == 'ip':
            self.active_adapter = IPCameraAdapter(s_id, name, url)
        elif s_type == 'webcam':
            self.active_adapter = WebcamAdapter(s_id, name, url)
        elif s_type == 'hls':
            self.active_adapter = HLSAdapter(s_id, name, url)
        elif s_type == 'youtube':
            self.active_adapter = YouTubeAdapter(s_id, name, url)
        else:
            self.active_adapter = MP4Adapter(s_id, name, url)
            
        return self.active_adapter.connect()

    def force_reconnect(self) -> bool:
        if self.current_config:
            print(f"VideoManager: Attempting to reconnect to {self.current_config.get('name')}")
            return self.set_source(self.current_config)
        return False

    def get_current_frame(self) -> Optional[Any]:
        if not self.active_adapter:
            return None
            
        if self.active_adapter.is_connected:
            frame = self.active_adapter.getFrame()
            if frame is not None:
                self.reconnect_attempts = 0 # reset attempts on successful frame
                return frame

        # If disconnected or frame failed, auto-reconnect
        now = time.time()
        # Throttle reconnect attempts to once per second
        if now - self._last_reconnect_time > 1.0 and self.reconnect_attempts < self.max_reconnect_attempts:
            self.reconnect_attempts += 1
            self._last_reconnect_time = now
            print(f"Auto-reconnecting... attempt {self.reconnect_attempts}")
            if self.active_adapter.connect():
                return self.active_adapter.getFrame()
                
        return None

    def get_status(self) -> dict:
        if not self.active_adapter:
            return {
                "status": "No Active Video Source",
                "name": "-",
                "type": "-",
                "fps": 0,
                "resolution": "-",
                "latency": 0,
                "connected": False,
                "url": ""
            }
        return self.active_adapter.getStatus()

class MultiVideoManager:
    def __init__(self):
        self.managers = {
            "dashboard": VideoManager(),
            "incidents": VideoManager(),
        }
        self.managers["vision"] = self.managers["incidents"]
        
    def get_manager(self, channel: str = "dashboard") -> VideoManager:
        if channel not in self.managers:
            self.managers[channel] = VideoManager()
        return self.managers[channel]

video_managers = MultiVideoManager()
