from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from .common import PaginatedResponse

class CameraBase(BaseModel):
    name: str
    location: str
    rtsp_url: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class CameraCreate(CameraBase):
    pass

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    rtsp_url: Optional[str] = None
    status: Optional[str] = None
    fps: Optional[int] = None

class CameraResponse(CameraBase):
    id: UUID
    status: str
    fps: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CameraListResponse(PaginatedResponse[CameraResponse]):
    pass
