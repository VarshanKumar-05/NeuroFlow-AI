from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    incident_id: Optional[UUID] = None
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationList(BaseModel):
    items: List[NotificationResponse]
    total: int
    unread_count: int
