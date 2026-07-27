class OccupancyAnalyzer:
    def __init__(self, lanes=3):
        self.lanes = lanes

    def calculate(self, frame_width, current_frame_tracks):
        lane_width = frame_width / float(self.lanes)
        lane_counts = [0] * self.lanes
        
        for track_id, data in current_frame_tracks.items():
            cx = data['cx']
            lane_idx = min(self.lanes - 1, max(0, int(cx / lane_width)))
            lane_counts[lane_idx] += 1
            
        occupied_lanes = sum(1 for c in lane_counts if c > 0)
        lane_occupancy_ratio = occupied_lanes / float(self.lanes)
        
        return lane_occupancy_ratio, lane_counts
