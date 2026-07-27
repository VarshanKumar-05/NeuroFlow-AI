import time
import math
import logging

class VehicleCounter:
    """
    Production-grade Vehicle Counter.
    Implements ROI line crossing (X and Y axis for horizontal/vertical flow),
    track deduplication (spatial/temporal), and ghost track filtering.
    """
    def __init__(self, roi_line_y_ratio=0.5, roi_line_x_ratio=0.5):
        self.roi_line_y_ratio = roi_line_y_ratio
        self.roi_line_x_ratio = roi_line_x_ratio
        
        # State
        self.counted_ids = set()
        self.total_unique_vehicles = 0
        self.class_counts = {2: 0, 3: 0, 5: 0, 7: 0, 0: 0} # 2: Car, 3: Motorcycle, 5: Bus, 7: Truck, 0: Emergency
        self.flow_history = []
        self.event_callback = None
        
        # De-duplication tracking: store recent counted track states to match fragmented tracks
        # Format: [ (track_id, class_id, cx, cy, timestamp) ]
        self.recent_counted_tracks = []
        
        # Spatial-temporal thresholds for deduplication
        self.MAX_MERGE_DISTANCE_PX = 180
        self.MAX_MERGE_TIME_SEC = 3.0

    def _is_duplicate(self, cx, cy, cls_id, now):
        """
        Checks if a 'new' track crossing the ROI is actually a fragment of a recently counted vehicle.
        Matches based on spatial distance, time threshold, and class similarity.
        """
        for entry in self.recent_counted_tracks:
            _, old_cls, old_cx, old_cy, old_ts = entry
            
            time_diff = now - old_ts
            if time_diff > self.MAX_MERGE_TIME_SEC:
                continue
                
            dist = math.hypot(cx - old_cx, cy - old_cy)
            if dist < self.MAX_MERGE_DISTANCE_PX:
                return True
                
        return False

    def update(self, frame_width, frame_height, tracks_history, current_frame_tracks):
        line_y = int(frame_height * self.roi_line_y_ratio)
        line_x = int(frame_width * self.roi_line_x_ratio)
        now = time.time()
        
        for track_id, data in current_frame_tracks.items():
            if track_id in self.counted_ids:
                # Keep updating its position in the deduplication memory
                for i, entry in enumerate(self.recent_counted_tracks):
                    if entry[0] == track_id:
                        self.recent_counted_tracks[i] = (track_id, data['class_id'], data['cx'], data['cy'], now)
                        break
                continue
                
            history = tracks_history.get(track_id, [])
            # Require at least 2 frames of trajectory history
            if len(history) < 2:
                continue
                
            cls_id = data['class_id']
            cx, cy = data['cx'], data['cy']
            conf = data.get('confidence', 0.0)
            
            # --- ROI Crossing Validation (Check both X and Y axis for diagonal/horizontal movement) ---
            prev_cx, prev_cy = history[-2][0], history[-2][1]
            
            crossed_y = (prev_cy < line_y <= cy) or (prev_cy > line_y >= cy)
            crossed_x = (prev_cx < line_x <= cx) or (prev_cx > line_x >= cx)
            has_crossed_roi = crossed_y or crossed_x
            
            if not has_crossed_roi:
                continue
                
            logging.info(f"[ROI_CROSSING] Track ID={track_id} crossed ROI (prev=({prev_cx:.1f},{prev_cy:.1f}) -> curr=({cx:.1f},{cy:.1f}), LineX={line_x}, LineY={line_y})")
            
            # Check for track fragmentation deduplication
            if self._is_duplicate(cx, cy, cls_id, now):
                logging.info(f"[COUNT_SKIPPED_DUPLICATE] Track ID={track_id} matched recently counted vehicle fragment within {self.MAX_MERGE_DISTANCE_PX}px.")
                self.counted_ids.add(track_id)
                continue
                
            # Not a duplicate. Count it!
            self.counted_ids.add(track_id)
            self.total_unique_vehicles += 1
            if cls_id in self.class_counts:
                self.class_counts[cls_id] += 1
            self.flow_history.append(now)
            
            self.recent_counted_tracks.append((track_id, cls_id, cx, cy, now))
            
            # Trigger ANPR Vehicle Crop & OCR Database Persistence
            try:
                from app.engine.anpr_processor import trigger_anpr_processing
                bbox = data.get('bbox', [cx - 50, cy - 50, cx + 50, cy + 50])
                trigger_anpr_processing(track_id, cls_id, conf, frame_arr if 'frame_arr' in locals() else None, bbox)
            except Exception as e:
                pass

            class_names = {2: "CAR", 3: "BIKE", 5: "BUS", 7: "TRUCK"}
            cls_name = class_names.get(cls_id, f"CLASS_{cls_id}")
            
            print(f"\n==================== [COUNT_INCREMENT] ====================")
            print(f"  Track ID:           {track_id}")
            print(f"  Class:              {cls_name} (ID: {cls_id})")
            print(f"  Confidence:         {conf:.2f}")
            print(f"  Position:           ({cx:.1f}, {cy:.1f})")
            print(f"  Timestamp:          {now:.3f}")
            print(f"  Reason for counting: ROI Crossing (prev=({prev_cx:.1f},{prev_cy:.1f}) -> curr=({cx:.1f},{cy:.1f}))")
            print(f"  Total Unique Count: {self.total_unique_vehicles}")
            print(f"===========================================================\n", flush=True)
            logging.info(f"[COUNT_INCREMENT] Track ID={track_id} | Class={cls_name} ({cls_id}) | Conf={conf:.2f} | Pos=({cx:.1f},{cy:.1f}) | Total={self.total_unique_vehicles}")
                    
        # Cleanup
        cutoff = now - 300
        self.flow_history = [t for t in self.flow_history if t > cutoff]
        
        recent_cutoff = now - self.MAX_MERGE_TIME_SEC
        self.recent_counted_tracks = [t for t in self.recent_counted_tracks if t[4] > recent_cutoff]

    def get_vph(self):
        if not self.flow_history:
            return 0
        now = time.time()
        oldest = self.flow_history[0]
        window = now - oldest
        if window < 10:
            return 0
        return int((len(self.flow_history) / window) * 3600)
        
    def get_flow_rate_per_min(self):
        if not self.flow_history:
            return 0
        now = time.time()
        recent = [t for t in self.flow_history if now - t <= 60]
        return len(recent)

    def get_class_distribution(self):
        total = sum(self.class_counts.values())
        if total == 0:
            return [
                {"name": "Cars", "value": 0, "count": 0, "color": "#00E5FF", "icon": "Car"},
                {"name": "Trucks", "value": 0, "count": 0, "color": "#F59E0B", "icon": "Truck"},
                {"name": "Buses", "value": 0, "count": 0, "color": "#3B82F6", "icon": "Bus"},
                {"name": "Motorcycles", "value": 0, "count": 0, "color": "#10B981", "icon": "Bike"},
                {"name": "Emergency Vehicles", "value": 0, "count": 0, "color": "#EF4444", "icon": "Siren"},
            ]
        
        return [
            {"name": "Cars", "value": round((self.class_counts.get(2, 0) / total) * 100, 1), "count": self.class_counts.get(2, 0), "color": "#00E5FF", "icon": "Car"},
            {"name": "Trucks", "value": round((self.class_counts.get(7, 0) / total) * 100, 1), "count": self.class_counts.get(7, 0), "color": "#F59E0B", "icon": "Truck"},
            {"name": "Buses", "value": round((self.class_counts.get(5, 0) / total) * 100, 1), "count": self.class_counts.get(5, 0), "color": "#3B82F6", "icon": "Bus"},
            {"name": "Motorcycles", "value": round((self.class_counts.get(3, 0) / total) * 100, 1), "count": self.class_counts.get(3, 0), "color": "#10B981", "icon": "Bike"},
            {"name": "Emergency Vehicles", "value": round((self.class_counts.get(0, 0) / total) * 100, 1), "count": self.class_counts.get(0, 0), "color": "#EF4444", "icon": "Siren"},
        ]


