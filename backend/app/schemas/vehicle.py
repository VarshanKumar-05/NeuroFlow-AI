from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID
from .common import PaginatedResponse

class VehicleResponse(BaseModel):
    id: UUID
    track_id: int
    vehicle_type: str
    first_seen: datetime
    last_seen: datetime
    avg_speed: Optional[float] = None
    camera_id: UUID

    class Config:
        from_attributes = True

class VehicleDetail(VehicleResponse):
    detections: List[Any] = [] # Simplified for now

class VehicleList(PaginatedResponse[VehicleResponse]):
    pass
