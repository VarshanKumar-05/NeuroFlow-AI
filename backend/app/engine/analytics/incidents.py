import time
import uuid

class IncidentEngine:
    def __init__(self):
        self.active_incidents = {} # track_id -> Incident dict
        
    def check_incidents(self, tracks_history, current_frame_tracks):
        now = time.time()
        
        # Check for stopped vehicles (speed < 5 km/h for > 10 frames)
        for track_id, data in current_frame_tracks.items():
            speed_kmh = data.get('speed_kmh', 0)
            history = tracks_history.get(track_id, [])
            
            if speed_kmh < 2.0 and len(history) >= 15:
                # Vehicle is stopped
                if track_id not in self.active_incidents:
                    self.active_incidents[track_id] = {
                        "id": str(uuid.uuid4()),
                        "type": "Stopped Vehicle",
                        "severity": "medium",
                        "location": f"Lane {int(data['cx'] / 426) + 1}", # Approximate for 1280 width
                        "time": time.strftime("%H:%M:%S"),
                        "status": "active"
                    }
            else:
                # Vehicle moved, resolve incident
                if track_id in self.active_incidents:
                    self.active_incidents[track_id]['status'] = "resolved"
                    
        # Clean up stale incidents for tracks that vanished
        for track_id in list(self.active_incidents.keys()):
            if track_id not in current_frame_tracks:
                self.active_incidents[track_id]['status'] = "resolved"
                
    def get_incidents_list(self):
        # Remove excess resolved incidents (keep only the 10 most recent)
        resolved_keys = [k for k, v in self.active_incidents.items() if v['status'] == 'resolved']
        # We can sort by time, but dict insertion order is preserved in modern Python
        if len(resolved_keys) > 10:
            excess = len(resolved_keys) - 10
            for k in resolved_keys[:excess]:
                del self.active_incidents[k]
                
        # Return all incidents, we let the frontend filter or we filter here
        return list(self.active_incidents.values())
