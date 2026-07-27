import time

class PredictionEngine:
    def __init__(self):
        self.history = [] # list of (timestamp, congestion_score)
        
    def update(self, congestion_score):
        now = time.time()
        self.history.append((now, congestion_score))
        
        # Keep 10 minutes of history
        cutoff = now - 600
        self.history = [h for h in self.history if h[0] > cutoff]
        
    def get_prediction(self):
        # We need at least 60 seconds of data to make a reliable prediction
        if not self.history or (self.history[-1][0] - self.history[0][0]) < 60:
            return {
                "congestionForecast": "Insufficient History",
                "congestionValue": 0,
                "confidence": 0,
                "futureCount": 0,
                "recommendedAction": "Collecting Traffic Data..."
            }
            
        current = self.history[-1][1]
        oldest = self.history[0][1]
        
        trend = current - oldest
        
        predicted_score = current + (trend * 0.5) # simple linear extrapolation
        predicted_score = max(0, min(100, predicted_score))
        
        forecast = "Stable"
        if trend > 10:
            forecast = "Worsening"
        elif trend < -10:
            forecast = "Improving"
            
        return {
            "congestionForecast": forecast,
            "congestionValue": int(predicted_score),
            "confidence": min(95, int((len(self.history) / 600) * 100)), # Max confidence if we have full 10 mins
            "futureCount": 0, # Not strictly needed or can be extrapolated from VPH
            "recommendedAction": "Monitor" if forecast == "Stable" else "Adjust Timing"
        }
