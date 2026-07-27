import collections
import logging
from typing import Dict, List, Any

class TrackState:
    def __init__(self, track_id: int):
        self.track_id = track_id
        
        # Classification Stabilization
        self.class_votes: Dict[int, float] = collections.defaultdict(float)
        self.stable_class: int = -1
        self.is_class_locked: bool = False
        
        # History
        self.position_history: List[tuple] = []
        self.velocity_history: List[tuple] = []
        
        # State
        self.lifetime: int = 0
        self.lost_frames: int = 0
        self.has_crossed: bool = False
        self.counted_flag: bool = False
        
        self.last_bbox = None
        
    def add_vote(self, class_id: int, confidence: float):
        if not self.is_class_locked:
            self.class_votes[class_id] += confidence
            self.lifetime += 1
            
            # Lock threshold: accumulated confidence > 3.0
            if self.class_votes[class_id] >= 3.0:
                self.stable_class = class_id
                self.is_class_locked = True
                print(f"[CLASS_LOCKED] Track ID={self.track_id} LOCKED to Class={self.stable_class} (Total Conf={self.class_votes[class_id]:.2f})", flush=True)
                logging.info(f"[CLASS_LOCKED] Track ID={self.track_id} LOCKED to Class={self.stable_class} (Total Conf={self.class_votes[class_id]:.2f})")
                
        # If not locked yet, pick the highest weighted class temporarily
        if not self.is_class_locked and len(self.class_votes) > 0:
            self.stable_class = max(self.class_votes.items(), key=lambda x: x[1])[0]

class ObjectStateManager:
    """
    Maintains the state of all tracked objects across frames.
    Implements confidence-weighted majority voting to eliminate class flickering.
    """
    def __init__(self):
        self.tracks: Dict[int, TrackState] = {}
        self.max_track_id: int = 0
        self.all_seen_track_ids: set = set()
        
    def update(self, bytetrack_results) -> List[Dict[str, Any]]:
        """
        Takes raw results from ByteTrack, updates internal state,
        and returns a stabilized list of objects.
        """
        active_ids = set()
        stabilized_objects = []
        
        if bytetrack_results and bytetrack_results.boxes:
            for box in bytetrack_results.boxes:
                if box.id is None:
                    continue
                    
                track_id = int(box.id[0].item())
                class_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                bbox = box.xyxy[0].cpu().numpy()
                
                active_ids.add(track_id)
                self.all_seen_track_ids.add(track_id)
                if track_id > self.max_track_id:
                    self.max_track_id = track_id
                
                if track_id not in self.tracks:
                    self.tracks[track_id] = TrackState(track_id)
                    logging.info(f"[NEW_TRACK_INITIALIZED] Track ID={track_id} | Initial Class={class_id} | Conf={conf:.2f}")
                    
                track = self.tracks[track_id]
                prev_class = track.stable_class
                track.add_vote(class_id, conf)
                track.last_bbox = bbox
                track.lost_frames = 0
                cx, cy = (bbox[0] + bbox[2])/2, (bbox[1] + bbox[3])/2
                track.position_history.append((cx, cy))
                if len(track.position_history) > 30:
                    track.position_history.pop(0)
                    
                print(f"[TRACKER_UPDATE] Track ID={track_id} | YOLO_Class={class_id} | Stable_Class={track.stable_class} | Locked={track.is_class_locked} | Conf={conf:.2f} | Pos=({cx:.1f},{cy:.1f})", flush=True)
                
                stabilized_objects.append({
                    "track_id": track.track_id,
                    "class_id": track.stable_class,
                    "bbox": bbox,
                    "confidence": conf,
                    "counted": track.counted_flag
                })
                
        # Cleanup lost tracks
        lost_ids = set(self.tracks.keys()) - active_ids
        for tid in list(lost_ids):
            self.tracks[tid].lost_frames += 1
            if self.tracks[tid].lost_frames > 60: # 2 seconds at 30fps
                logging.info(f"[TRACK_EXPIRED] Track ID={tid} deleted after 60 lost frames.")
                del self.tracks[tid]
                
        return stabilized_objects
        
    def get_track(self, track_id: int) -> TrackState:
        return self.tracks.get(track_id)
        
    def reset(self):
        self.tracks.clear()
        self.max_track_id = 0
        self.all_seen_track_ids.clear()

state_manager = ObjectStateManager()

