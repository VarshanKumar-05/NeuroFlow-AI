import math
from typing import Dict, List, Tuple, Any, Optional
from app.incident_engine.motion import MotionAnalyzer, TrackMotionHistory

class CollisionCandidate:
    """
    Represents a candidate collision pair between two tracked vehicles.
    """
    def __init__(
        self,
        track_id_1: int,
        track_id_2: int,
        iou: float,
        iob: float,
        closing_speed_kmh: float,
        trajectory_intersection: bool,
        decending_accel: float,
        bbox_union: List[float]
    ):
        self.track_id_1 = track_id_1
        self.track_id_2 = track_id_2
        self.iou = iou
        self.iob = iob
        self.closing_speed_kmh = closing_speed_kmh
        self.trajectory_intersection = trajectory_intersection
        self.decending_accel = decending_accel
        self.bbox_union = bbox_union


def calculate_iou_and_iob(boxA: List[float], boxB: List[float]) -> Tuple[float, float]:
    """Calculates Intersection-over-Union (IoU) and Intersection-over-Box (IoB)."""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA) * max(0, yB - yA)
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

    unionArea = float(boxAArea + boxBArea - interArea)
    if unionArea <= 0:
        return 0.0, 0.0

    iou = interArea / unionArea
    iob = interArea / float(min(boxAArea, boxBArea)) if min(boxAArea, boxBArea) > 0 else 0.0

    return round(iou, 3), round(iob, 3)


def get_bounding_box_union(boxA: List[float], boxB: List[float]) -> List[float]:
    """Returns union bounding box covering both objects."""
    return [
        min(boxA[0], boxB[0]),
        min(boxA[1], boxB[1]),
        max(boxA[2], boxB[2]),
        max(boxA[3], boxB[3])
    ]


def check_trajectory_intersection(
    motion1: TrackMotionHistory,
    motion2: TrackMotionHistory,
    threshold_distance: float = 40.0
) -> bool:
    """Checks if projected future trajectories of two vehicles intersect within threshold_distance."""
    traj1 = motion1.project_trajectory(lookahead_seconds=2.0)
    traj2 = motion2.project_trajectory(lookahead_seconds=2.0)

    for p1 in traj1:
        for p2 in traj2:
            dist = math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)
            if dist < threshold_distance:
                return True
    return False


class CollisionCandidateGenerator:
    """
    Analyzes active tracks to identify potential collision candidates.
    """
    def __init__(self):
        pass

    def find_candidates(
        self,
        stabilized_objects: List[Dict[str, Any]],
        motion_analyzer: MotionAnalyzer
    ) -> List[CollisionCandidate]:
        candidates = []
        num_objects = len(stabilized_objects)

        for i in range(num_objects):
            for j in range(i + 1, num_objects):
                obj1 = stabilized_objects[i]
                obj2 = stabilized_objects[j]

                t1_id = obj1.get("track_id")
                t2_id = obj2.get("track_id")
                box1 = obj1.get("bbox")
                box2 = obj2.get("bbox")

                if t1_id is None or t2_id is None or not box1 or not box2:
                    continue

                iou, iob = calculate_iou_and_iob(box1, box2)

                motion1 = motion_analyzer.tracks.get(t1_id)
                motion2 = motion_analyzer.tracks.get(t2_id)

                closing_speed = 0.0
                traj_intersect = False
                max_decel = 0.0

                if motion1 and motion2:
                    vx1, vy1, sp1 = motion1.get_velocity()
                    vx2, vy2, sp2 = motion2.get_velocity()
                    
                    # Relative closing speed
                    rel_vx = vx1 - vx2
                    rel_vy = vy1 - vy2
                    closing_speed = round(math.sqrt(rel_vx**2 + rel_vy**2) * 0.25, 1)

                    traj_intersect = check_trajectory_intersection(motion1, motion2)
                    max_decel = min(motion1.get_acceleration(), motion2.get_acceleration())

                # A candidate is generated if boxes overlap OR trajectories intersect with rapid approach
                if iou > 0.05 or iob > 0.15 or (traj_intersect and closing_speed > 15.0):
                    bbox_union = get_bounding_box_union(box1, box2)
                    candidate = CollisionCandidate(
                        track_id_1=t1_id,
                        track_id_2=t2_id,
                        iou=iou,
                        iob=iob,
                        closing_speed_kmh=closing_speed,
                        trajectory_intersection=traj_intersect,
                        decending_accel=max_decel,
                        bbox_union=bbox_union
                    )
                    candidates.append(candidate)

        return candidates
