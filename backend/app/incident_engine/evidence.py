import os
import cv2
import time
import numpy as np
import collections
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class EvidenceGenerationEngine:
    """
    Evidence Generation Engine: Captures high-res JPEG snapshots and buffers 10-15 second video clips.
    """
    def __init__(self, storage_dir: str = "/app/static/evidence", buffer_seconds: int = 12, fps: int = 25):
        self.storage_dir = storage_dir
        self.buffer_size = buffer_seconds * fps
        self.frame_ring_buffer = collections.deque(maxlen=self.buffer_size)
        
        # Ensure static evidence directory exists
        os.makedirs(self.storage_dir, exist_ok=True)

    def add_frame(self, frame: np.ndarray):
        """Appends annotated/raw frame to rolling ring buffer."""
        if frame is not None:
            self.frame_ring_buffer.append(frame.copy())

    def generate_evidence_pack(
        self,
        incident_id: str,
        current_frame: np.ndarray,
        incident_info: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Saves JPEG snapshot and compiles MP4 video clip. Returns dict of saved file paths.
        """
        snapshot_filename = f"snapshot_{incident_id[:8]}.jpg"
        video_filename = f"clip_{incident_id[:8]}.mp4"

        snapshot_abs_path = os.path.join(self.storage_dir, snapshot_filename)
        video_abs_path = os.path.join(self.storage_dir, video_filename)

        # 1. Save High-Res JPEG Snapshot
        if current_frame is not None:
            try:
                cv2.imwrite(snapshot_abs_path, current_frame)
            except Exception as e:
                logger.error(f"[EVIDENCE_ENGINE] Failed to write snapshot: {e}")

        # 2. Write 10-15 Second Video Clip
        if len(self.frame_ring_buffer) > 0:
            try:
                h, w, _ = self.frame_ring_buffer[0].shape
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                writer = cv2.VideoWriter(video_abs_path, fourcc, 25.0, (w, h))
                for f in self.frame_ring_buffer:
                    writer.write(f)
                writer.release()
            except Exception as e:
                logger.error(f"[EVIDENCE_ENGINE] Failed to write video clip: {e}")

        snapshot_rel_url = f"/static/evidence/{snapshot_filename}"
        video_rel_url = f"/static/evidence/{video_filename}"

        return {
            "snapshot_path": snapshot_rel_url,
            "video_clip_path": video_rel_url
        }
