from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from .common import PaginatedResponse

class ReportCreate(BaseModel):
    title: str
    type: str
    parameters: Optional[Dict[str, Any]] = None

class ReportResponse(BaseModel):
    id: UUID
    title: str
    type: str
    file_url: str
    format: str
    created_by: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReportList(PaginatedResponse[ReportResponse]):
    pass
