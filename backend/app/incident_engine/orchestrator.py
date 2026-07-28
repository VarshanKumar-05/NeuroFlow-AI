import time
import asyncio
import numpy as np
import logging
from typing import Dict, List, Any, Optional

from app.incident_engine.motion import MotionAnalyzer
from app.incident_engine.detectors.collision_detector import CollisionDetector
from app.incident_engine.detectors.sudden_stop_detector import SuddenStopDetector
from app.incident_engine.detectors.wrong_way_detector import WrongWayDetector
from app.incident_engine.detectors.road_blockage_detector import RoadBlockageDetector
from app.incident_engine.evidence import EvidenceGenerationEngine
from app.incident_engine.notifier import AlertEngineNotifier

logger = logging.getLogger(__name__)

class IncidentEngineOrchestrator:
    """
    Unified Multi-Factor Incident Detection Engine Orchestrator.
    Integrates Motion Analysis, Collision Detection, Sudden Stops, Wrong Way, Road Blockage, Evidence Packaging, and Notifier.
    """
    def __init__(self, cooldown_seconds: float = 15.0):
        self.motion_analyzer = MotionAnalyzer()
        self.collision_detector = CollisionDetector()
        self.sudden_stop_detector = SuddenStopDetector()
        self.wrong_way_detector = WrongWayDetector()
        self.road_blockage_detector = RoadBlockageDetector()
        
        self.evidence_engine = EvidenceGenerationEngine()
        self.notifier = AlertEngineNotifier()

        self.cooldown_seconds = cooldown_seconds
        self.last_incident_time: Dict[str, float] = {}

    def process_frame(
        self,
        frame: Optional[np.ndarray],
        stabilized_objects: List[Dict[str, Any]],
        camera_id: str = "Live City Camera 01"
    ) -> List[Dict[str, Any]]:
        """
        Executes multi-factor detection pipeline per frame (< 2ms execution time).
        """
        if frame is not None:
            self.evidence_engine.add_frame(frame)

        # Update motion history vectors
        self.motion_analyzer.update_tracks(stabilized_objects)

        # Run multi-factor specialized detectors
        incidents = []

        # 1. Collision Detector
        cols = self.collision_detector.detect_collisions(stabilized_objects, self.motion_analyzer)
        incidents.extend(cols)

        # 2. Sudden Stop Detector
        stops = self.sudden_stop_detector.detect_sudden_stops(stabilized_objects, self.motion_analyzer)
        incidents.extend(stops)

        # 3. Wrong-Way Detector
        ww = self.wrong_way_detector.detect_wrong_way(stabilized_objects, self.motion_analyzer)
        incidents.extend(ww)

        # 4. Road Blockage Detector
        block = self.road_blockage_detector.detect_road_blockage(stabilized_objects, self.motion_analyzer)
        incidents.extend(block)

        # Filter duplicates and check cooldown per incident category
        confirmed_dispatched = []
        now = time.time()

        for inc in incidents:
            inc_type = inc.get("incident_type")
            last_time = self.last_incident_time.get(inc_type, 0.0)

            if (now - last_time) >= self.cooldown_seconds:
                self.last_incident_time[inc_type] = now
                inc_id = f"inc_{int(now * 1000)}"
                
                # Package evidence snapshot & 10-15s clip
                evidence_pack = self.evidence_engine.generate_evidence_pack(
                    incident_id=inc_id,
                    current_frame=frame,
                    incident_info=inc
                )

                # Dispatch DB persistence, Telegram alert & WebSockets broadcast asynchronously
                try:
                    loop = asyncio.get_running_loop()
                    loop.create_task(self.notifier.dispatch_incident(inc, evidence_pack, camera_id=camera_id))
                except RuntimeError:
                    # Fallback for synchronous execution context
                    asyncio.run(self.notifier.dispatch_incident(inc, evidence_pack, camera_id=camera_id))

                confirmed_dispatched.append(inc)

        return confirmed_dispatched

# Singleton Orchestrator Instance
incident_orchestrator = IncidentEngineOrchestrator()
