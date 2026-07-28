from typing import Dict, Any, Tuple
from app.incident_engine.collision import CollisionCandidate

class ConfidenceFusionEngine:
    """
    Weighted Confidence Fusion Engine for Incident Detection.
    Combines spatial, motion, trajectory, persistence, and post-impact signals into a single score.
    """
    def __init__(self, threshold: float = 85.0):
        self.threshold = threshold
        # Weights matrix (Sum = 1.0)
        self.weight_bbox_intersection = 0.20
        self.weight_speed_drop = 0.30
        self.weight_trajectory_intersection = 0.25
        self.weight_persistent_overlap = 0.15
        self.weight_vehicle_stopped = 0.10

    def compute_confidence(
        self,
        candidate: CollisionCandidate,
        verification_metrics: Dict[str, Any]
    ) -> Tuple[float, bool]:
        """
        Computes weighted confidence score (0 - 100%). Returns (final_score, passes_threshold).
        """
        # 1. Bounding Box Intersection Score (0 - 1)
        intersection_score = min(1.0, candidate.iou * 2.5 + candidate.iob * 1.5)

        # 2. Sudden Speed Drop Score (0 - 1)
        decel = min(verification_metrics.get("accel1", 0.0), verification_metrics.get("accel2", 0.0))
        speed_drop_score = min(1.0, abs(min(0.0, decel)) / 15.0)

        # 3. Trajectory Intersection Score (0 or 1)
        traj_score = 1.0 if candidate.trajectory_intersection else 0.0

        # 4. Persistent Overlap Score (0 - 1)
        frames = verification_metrics.get("consecutive_frames", 1)
        persistence_score = min(1.0, frames / 6.0)

        # 5. Vehicle Stopped Score (0 or 1)
        stopped_score = 1.0 if verification_metrics.get("one_or_both_stopped", False) else 0.0

        # Weighted Sum
        fused_raw = (
            self.weight_bbox_intersection * intersection_score +
            self.weight_speed_drop * speed_drop_score +
            self.weight_trajectory_intersection * traj_score +
            self.weight_persistent_overlap * persistence_score +
            self.weight_vehicle_stopped * stopped_score
        )

        final_score = round(fused_raw * 100.0, 1)
        # Cap range
        final_score = max(0.0, min(99.9, final_score))
        passes_threshold = (final_score >= self.threshold)

        return final_score, passes_threshold


class Tuple_Confidence_Result(tuple):
    pass
