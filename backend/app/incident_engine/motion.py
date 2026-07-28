import time
import math
import numpy as np
from typing import Dict, List, Tuple, Any, Optional

class TrackMotionHistory:
    """
    Stores 2-5 second position history and computes motion vectors for a single tracked vehicle.
    """
    def __init__(self, track_id: int, max_history_seconds: float = 3.0):
        self.track_id = track_id
        self.max_history_seconds = max_history_seconds
        # List of (timestamp, centroid_x, centroid_y, bbox_width, bbox_height)
        self.history: List[Tuple[float, float, float, float, float]] = []

    def update(self, bbox: List[float], timestamp: Optional[float] = None):
        if timestamp is None:
            timestamp = time.time()
        
        x1, y1, x2, y2 = bbox
        cx = (x1 + x2) / 2.0
        cy = (y1 + y2) / 2.0
        w = abs(x2 - x1)
        h = abs(y2 - y1)

        self.history.append((timestamp, cx, cy, w, h))

        # Prune records older than max_history_seconds
        cutoff = timestamp - self.max_history_seconds
        self.history = [h_item for h_item in self.history if h_item[0] >= cutoff]

    def get_velocity(self, window_seconds: float = 1.0) -> Tuple[float, float, float]:
        """
        Returns (vx_px_per_sec, vy_px_per_sec, estimated_speed_kmh) over recent window_seconds.
        """
        if len(self.history) < 2:
            return 0.0, 0.0, 0.0

        t_last, x_last, y_last, _, _ = self.history[-1]
        cutoff = t_last - window_seconds

        # Filter history within window
        window_history = [h for h in self.history if h[0] >= cutoff]
        if len(window_history) < 2:
            window_history = self.history[-2:]

        t_first, x_first, y_first, _, _ = window_history[0]

        dt = t_last - t_first
        if dt <= 0.001:
            return 0.0, 0.0, 0.0

        vx = (x_last - x_first) / dt
        vy = (y_last - y_first) / dt

        # Convert pixel speed to estimated km/h scale (calibration factor ~ 0.25)
        pixel_speed = math.sqrt(vx * vx + vy * vy)
        estimated_speed_kmh = round(pixel_speed * 0.25, 1)

        return vx, vy, estimated_speed_kmh

    def get_acceleration(self) -> float:
        """
        Returns acceleration in km/h/s (negative indicates deceleration).
        """
        if len(self.history) < 4:
            return 0.0

        mid_point = len(self.history) // 2
        
        # Velocity first half
        t1, x1, y1, _, _ = self.history[0]
        t2, x2, y2, _, _ = self.history[mid_point]
        dt1 = t2 - t1
        speed1 = (math.sqrt((x2 - x1)**2 + (y2 - y1)**2) / dt1 * 0.25) if dt1 > 0.001 else 0.0

        # Velocity second half
        t3, x3, y3, _, _ = self.history[mid_point]
        t4, x4, y4, _, _ = self.history[-1]
        dt2 = t4 - t3
        speed2 = (math.sqrt((x4 - x3)**2 + (y4 - y3)**2) / dt2 * 0.25) if dt2 > 0.001 else 0.0

        dt_total = t4 - t2
        if dt_total <= 0.001:
            return 0.0

        accel = (speed2 - speed1) / dt_total
        return round(accel, 2)

    def get_heading(self) -> Tuple[float, Tuple[float, float]]:
        """
        Returns (heading_angle_degrees, (unit_dx, unit_dy)).
        """
        vx, vy, speed = self.get_velocity()
        if speed < 1.0:
            return 0.0, (0.0, 0.0)

        angle = math.degrees(math.atan2(vy, vx))
        norm = math.sqrt(vx * vx + vy * vy)
        unit_vector = (vx / norm, vy / norm) if norm > 0 else (0.0, 0.0)
        return round(angle, 1), unit_vector

    def project_trajectory(self, lookahead_seconds: float = 2.0) -> List[Tuple[float, float]]:
        """
        Projects future positions over lookahead_seconds based on current velocity.
        """
        if not self.history:
            return []

        vx, vy, _ = self.get_velocity()
        _, last_x, last_y, _, _ = self.history[-1]

        points = []
        for step in range(1, 6):
            t_offset = (lookahead_seconds / 5.0) * step
            proj_x = last_x + vx * t_offset
            proj_y = last_y + vy * t_offset
            points.append((proj_x, proj_y))

        return points


class MotionAnalyzer:
    """
    Manages motion history for all active vehicle tracks in a camera stream.
    """
    def __init__(self):
        self.tracks: Dict[int, TrackMotionHistory] = {}

    def update_tracks(self, stabilized_objects: List[Dict[str, Any]], timestamp: Optional[float] = None):
        current_ids = set()
        for obj in stabilized_objects:
            t_id = obj.get("track_id")
            bbox = obj.get("bbox")
            if t_id is not None and bbox:
                current_ids.add(t_id)
                if t_id not in self.tracks:
                    self.tracks[t_id] = TrackMotionHistory(track_id=t_id)
                self.tracks[t_id].update(bbox, timestamp=timestamp)

        # Cleanup stale tracks no longer active
        stale_ids = [t_id for t_id in self.tracks if t_id not in current_ids]
        for t_id in stale_ids:
            # Retain up to 2 seconds for post-impact analysis before deletion
            if len(self.tracks[t_id].history) > 0:
                last_seen = self.tracks[t_id].history[-1][0]
                if (time.time() - last_seen) > 3.0:
                    del self.tracks[t_id]
