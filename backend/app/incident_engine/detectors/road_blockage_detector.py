from typing import Dict, List, Any
from app.incident_engine.motion import MotionAnalyzer

class RoadBlockageDetector:
    """
    Detects road blockage when multiple vehicles are halted simultaneously in active lanes.
    """
    def __init__(self, min_stopped_vehicles: int = 3):
        self.min_stopped_vehicles = min_stopped_vehicles

    def detect_road_blockage(
        self,
        stabilized_objects: List[Dict[str, Any]],
        motion_analyzer: MotionAnalyzer
    ) -> List[Dict[str, Any]]:
        stopped_count = 0
        stopped_ids = []
        union_boxes = []

        for obj in stabilized_objects:
            t_id = obj.get("track_id")
            bbox = obj.get("bbox")
            if t_id is not None and t_id in motion_analyzer.tracks:
                motion = motion_analyzer.tracks[t_id]
                _, _, speed = motion.get_velocity()
                if speed < 2.0 and len(motion.history) >= 12:
                    stopped_count += 1
                    stopped_ids.append(f"TRK-{t_id}")
                    if bbox:
                        union_boxes.append(bbox)

        if stopped_count >= self.min_stopped_vehicles:
            min_x = min(b[0] for b in union_boxes)
            min_y = min(b[1] for b in union_boxes)
            max_x = max(b[2] for b in union_boxes)
            max_y = max(b[3] for b in union_boxes)

            return [{
                "incident_type": "Road Blockage",
                "severity": "HIGH",
                "priority": "P2",
                "confidence": 94.0,
                "track_ids": ", ".join(stopped_ids[:4]),
                "vehicles_involved": f"{stopped_count} Vehicles Stopped",
                "bbox_union": [min_x, min_y, max_x, max_y],
                "description": f"Road blockage detected with {stopped_count} stationary vehicles blocking traffic flow."
            }]

        return []
