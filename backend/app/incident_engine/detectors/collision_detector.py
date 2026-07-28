from typing import Dict, List, Any, Optional
from app.incident_engine.motion import MotionAnalyzer
from app.incident_engine.collision import CollisionCandidateGenerator
from app.incident_engine.verifier import IncidentVerifierLayer
from app.incident_engine.confidence import ConfidenceFusionEngine

class CollisionDetector:
    """
    Specialized Vehicle Collision AI Detector.
    Runs candidate generation, verification, and confidence fusion.
    """
    def __init__(self):
        self.generator = CollisionCandidateGenerator()
        self.verifier = IncidentVerifierLayer(min_consecutive_frames=4)
        self.fusion_engine = ConfidenceFusionEngine(threshold=85.0)

    def detect_collisions(
        self,
        stabilized_objects: List[Dict[str, Any]],
        motion_analyzer: MotionAnalyzer
    ) -> List[Dict[str, Any]]:
        candidates = self.generator.find_candidates(stabilized_objects, motion_analyzer)
        self.verifier.cleanup_stale(candidates)

        detected_incidents = []
        for candidate in candidates:
            is_verified, metrics = self.verifier.verify_candidate(candidate, motion_analyzer)
            if is_verified:
                score, passes = self.fusion_engine.compute_confidence(candidate, metrics)
                if passes:
                    detected_incidents.append({
                        "incident_type": "Vehicle Collision",
                        "severity": "CRITICAL" if score >= 90.0 else "HIGH",
                        "priority": "P1" if score >= 90.0 else "P2",
                        "confidence": score,
                        "track_ids": f"TRK-{candidate.track_id_1}, TRK-{candidate.track_id_2}",
                        "vehicles_involved": "2 Vehicles",
                        "bbox_union": candidate.bbox_union,
                        "description": f"Collision candidate verified between TRK-{candidate.track_id_1} and TRK-{candidate.track_id_2} with {score}% confidence."
                    })

        return detected_incidents
