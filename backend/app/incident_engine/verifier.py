import time
from typing import Dict, List, Tuple, Any, Optional
from app.incident_engine.collision import CollisionCandidate
from app.incident_engine.motion import MotionAnalyzer, TrackMotionHistory

class CandidatePersistenceTrack:
    """Tracks persistence of candidate collision pairs across frames."""
    def __init__(self, candidate_key: Tuple[int, int]):
        self.candidate_key = candidate_key
        self.consecutive_frames = 0
        self.first_detected = time.time()
        self.last_updated = time.time()

    def update(self):
        self.consecutive_frames += 1
        self.last_updated = time.time()


class IncidentVerifierLayer:
    """
    Multi-factor verification layer to eliminate false positive collision alerts.
    """
    def __init__(self, min_consecutive_frames: int = 4):
        self.min_consecutive_frames = min_consecutive_frames
        self.persistence_map: Dict[Tuple[int, int], CandidatePersistenceTrack] = {}

    def verify_candidate(
        self,
        candidate: CollisionCandidate,
        motion_analyzer: MotionAnalyzer
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Executes verification checks. Returns (is_verified, verification_metrics).
        """
        key = (min(candidate.track_id_1, candidate.track_id_2), max(candidate.track_id_1, candidate.track_id_2))
        
        # Track persistence
        if key not in self.persistence_map:
            self.persistence_map[key] = CandidatePersistenceTrack(key)
        
        p_track = self.persistence_map[key]
        p_track.update()

        motion1 = motion_analyzer.tracks.get(candidate.track_id_1)
        motion2 = motion_analyzer.tracks.get(candidate.track_id_2)

        # Check 1: Relative Speed Check (Ignore if both were static before candidate event)
        init_sp1 = motion1.get_velocity(window_seconds=3.0)[2] if motion1 else 0.0
        init_sp2 = motion2.get_velocity(window_seconds=3.0)[2] if motion2 else 0.0
        were_static_before = (init_sp1 < 2.0 and init_sp2 < 2.0)

        curr_sp1 = motion1.get_velocity(window_seconds=0.5)[2] if motion1 else 0.0
        curr_sp2 = motion2.get_velocity(window_seconds=0.5)[2] if motion2 else 0.0

        # Check 2: Sudden Deceleration Check
        accel1 = motion1.get_acceleration() if motion1 else 0.0
        accel2 = motion2.get_acceleration() if motion2 else 0.0
        sudden_deceleration = (accel1 < -8.0 or accel2 < -8.0)

        # Check 3: Persistent Overlap
        is_persistent = (p_track.consecutive_frames >= self.min_consecutive_frames)

        # Check 4: Post-Impact Vehicle Stopped Check
        one_or_both_stopped = (curr_sp1 < 3.0 or curr_sp2 < 3.0)

        # Overall Verification Rule
        is_verified = (is_persistent or sudden_deceleration) and not were_static_before and one_or_both_stopped

        verification_metrics = {
            "consecutive_frames": p_track.consecutive_frames,
            "both_static": were_static_before,
            "sudden_deceleration": sudden_deceleration,
            "is_persistent": is_persistent,
            "one_or_both_stopped": one_or_both_stopped,
            "speed1_kmh": curr_sp1,
            "speed2_kmh": curr_sp2,
            "accel1": accel1,
            "accel2": accel2
        }

        return is_verified, verification_metrics

    def cleanup_stale(self, active_candidates: List[CollisionCandidate]):
        active_keys = {
            (min(c.track_id_1, c.track_id_2), max(c.track_id_1, c.track_id_2))
            for c in active_candidates
        }
        stale_keys = [k for k in self.persistence_map if k not in active_keys]
        for k in stale_keys:
            if (time.time() - self.persistence_map[k].last_updated) > 2.0:
                del self.persistence_map[k]
