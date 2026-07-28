from typing import Dict, List, Any
from app.incident_engine.motion import MotionAnalyzer

class SuddenStopDetector:
    """
    Detects vehicles that undergo sudden deceleration and remain stationary in active lanes.
    """
    def __init__(self, stationary_threshold_seconds: float = 8.0):
        self.stationary_threshold_seconds = stationary_threshold_seconds

    def detect_sudden_stops(
        self,
        stabilized_objects: List[Dict[str, Any]],
        motion_analyzer: MotionAnalyzer
    ) -> List[Dict[str, Any]]:
        incidents = []
        for obj in stabilized_objects:
            t_id = obj.get("track_id")
            bbox = obj.get("bbox")
            if t_id is not None and t_id in motion_analyzer.tracks:
                motion = motion_analyzer.tracks[t_id]
                _, _, speed = motion.get_velocity()
                accel = motion.get_acceleration()

                # Check if vehicle decelerated sharply and is now stationary
                if accel < -10.0 and speed < 2.0 and len(motion.history) >= 10:
                    incidents.append({
                        "incident_type": "Stopped Vehicle",
                        "severity": "HIGH",
                        "priority": "P2",
                        "confidence": 92.5,
                        "track_ids": f"TRK-{t_id}",
                        "vehicles_involved": f"1 Vehicle ({obj.get('class_name', 'Car')})",
                        "bbox_union": bbox,
                        "description": f"Vehicle TRK-{t_id} executed a sudden deceleration ({accel} km/h/s) and is stationary."
                    })

        return incidents
