from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy import Uuid as UUID
from app.core.database import Base, TimestampMixin
import uuid

class Notification(Base, TimestampMixin):
    __tablename__ = 'notifications'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    incident_id = Column(UUID(as_uuid=True), ForeignKey('incidents.id', ondelete='CASCADE'), nullable=True)
    title = Column(String(200), nullable=False)
    message = Column(String, nullable=False)
    type = Column(String(30), nullable=False)
    is_read = Column(Boolean, default=False)
