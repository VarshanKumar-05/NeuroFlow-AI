from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from .common import PaginatedResponse

class IncidentBase(BaseModel):
    camera_id: UUID
    type: str
    severity: str
    description: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[UUID] = None
    description: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: UUID
    status: str
    snapshot_url: Optional[str] = None
    video_clip_url: Optional[str] = None
    vehicle_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class IncidentList(PaginatedResponse[IncidentResponse]):
    pass
