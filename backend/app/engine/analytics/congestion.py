class CongestionAnalyzer:
    def __init__(self):
        pass

    def calculate(self, active_vehicles, avg_speed, stopped_vehicles, lane_occupancy_ratio):
        # Weighted Congestion:
        # Density (assume 20 vehicles is heavy) -> 30%
        # Speed factor (<10kmh is bad, >40 is good) -> 30%
        # Stopped vehicles -> 20%
        # Lane occupancy -> 20%
        
        density_factor = min(1.0, active_vehicles / 20.0)
        
        speed_factor = 0.0
        if active_vehicles > 0:
            if avg_speed < 10:
                speed_factor = 1.0
            elif avg_speed < 40:
                speed_factor = 1.0 - ((avg_speed - 10) / 30.0)
                
        stopped_factor = min(1.0, stopped_vehicles / 5.0)
        
        congestion_score = (density_factor * 0.3) + (speed_factor * 0.3) + (stopped_factor * 0.2) + (lane_occupancy_ratio * 0.2)
        congestion_pct = int(min(100, max(0, congestion_score * 100)))
        
        return congestion_pct
