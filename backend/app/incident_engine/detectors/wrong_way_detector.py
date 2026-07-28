from typing import Dict, List, Any, Tuple
from app.incident_engine.motion import MotionAnalyzer

class WrongWayDetector:
    """
    Detects vehicles moving against the dominant flow direction of traffic.
    """
    def __init__(self, expected_heading_range: Tuple[float, float] = (0.0, 180.0)):
        self.expected_min = expected_heading_range[0]
        self.expected_max = expected_heading_range[1]

    def detect_wrong_way(
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
                angle, (ux, uy) = motion.get_heading()
                _, _, speed = motion.get_velocity()

                # Wrong-way driving check: speed > 10 km/h with negative vertical flow (uy < -0.6)
                if speed > 10.0 and uy < -0.6 and len(motion.history) >= 8:
                    incidents.append({
                        "incident_type": "Wrong Way Driving",
                        "severity": "CRITICAL",
                        "priority": "P1",
                        "confidence": 97.0,
                        "track_ids": f"TRK-{t_id}",
                        "vehicles_involved": f"1 Vehicle ({obj.get('class_name', 'Car')})",
                        "bbox_union": bbox,
                        "description": f"Vehicle TRK-{t_id} moving against traffic flow direction ({speed} km/h, heading {angle}°)."
                    })

        return incidents

class Tuple_Heading(tuple):
    pass
