from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from .common import PaginatedResponse

class TrafficMetricResponse(BaseModel):
    id: UUID
    camera_id: UUID
    vehicle_count: int
    avg_speed: float
    queue_length: int
    congestion_score: float
    lane_occupancy: Optional[Dict[str, Any]] = None
    recorded_at: datetime

    class Config:
        from_attributes = True

class TrafficSummary(BaseModel):
    total_vehicles: int
    avg_speed: float
    congestion_level: str
    active_cameras: int
    active_incidents: int
    timestamp: datetime

class TrafficMetricList(PaginatedResponse[TrafficMetricResponse]):
    pass
