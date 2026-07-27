import psutil
import time

class SystemHealthAnalyzer:
    def __init__(self):
        self.last_check = 0
        self.metrics = []

    def get_health(self, inference_fps, streaming_fps):
        now = time.time()
        # Throttle heavy psutil calls to once every 2 seconds
        if now - self.last_check > 2.0 or not self.metrics:
            cpu = psutil.cpu_percent(interval=None)
            mem = psutil.virtual_memory().percent
            
            self.metrics = [
                {"label": "CPU Usage", "value": int(cpu), "color": "#00E5FF"},
                {"label": "Memory", "value": int(mem), "color": "#3B82F6"},
                {"label": "Inference FPS", "value": int(inference_fps), "color": "#F59E0B"},
                {"label": "Stream FPS", "value": int(streaming_fps), "color": "#10B981"},
            ]
            self.last_check = now
            
        return self.metrics
