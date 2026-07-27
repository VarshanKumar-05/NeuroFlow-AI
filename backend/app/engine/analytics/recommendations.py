import uuid

class RecommendationEngine:
    def __init__(self):
        pass
        
    def generate(self, congestion_score, active_vehicles, avg_speed, incidents):
        recommendations = []
        
        if congestion_score > 75:
            recommendations.append({
                "id": str(uuid.uuid4()),
                "title": "Severe Congestion",
                "desc": "Traffic density is critically high. Increase green light duration on main corridor.",
                "impact": "High",
                "icon": "AlertTriangle",
                "color": "#EF4444"
            })
        elif congestion_score > 50:
            recommendations.append({
                "id": str(uuid.uuid4()),
                "title": "Moderate Congestion",
                "desc": "Traffic is building up. Sync adjacent traffic lights to improve flow.",
                "impact": "Medium",
                "icon": "Activity",
                "color": "#F59E0B"
            })
            
        if active_vehicles > 0 and avg_speed > 60:
            recommendations.append({
                "id": str(uuid.uuid4()),
                "title": "Speeding Detected",
                "desc": "Average speed exceeds limit. Enable speed warning signs.",
                "impact": "Low",
                "icon": "Zap",
                "color": "#3B82F6"
            })
            
        if len(incidents) > 0:
            recommendations.append({
                "id": str(uuid.uuid4()),
                "title": "Active Incident",
                "desc": "Stopped vehicle detected. Dispatch patrol and route traffic to alternate lanes.",
                "impact": "Critical",
                "icon": "AlertOctagon",
                "color": "#EF4444"
            })
            
        # Default recommendation if everything is fine
        if not recommendations:
            recommendations.append({
                "id": str(uuid.uuid4()),
                "title": "Optimal Flow",
                "desc": "Traffic is flowing smoothly. No immediate action required.",
                "impact": "Low",
                "icon": "CheckCircle",
                "color": "#10B981"
            })
            
        return recommendations[:3] # Return top 3
