from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy import Uuid as UUID
from app.core.database import Base, TimestampMixin
import uuid

class Incident(Base, TimestampMixin):
    __tablename__ = 'incidents'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camera_id = Column(UUID(as_uuid=True), ForeignKey('cameras.id', ondelete='CASCADE'), nullable=False)
    type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    status = Column(String(20), default='open')
    description = Column(String, nullable=True)
    snapshot_url = Column(String, nullable=True)
    video_clip_url = Column(String, nullable=True)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey('vehicles.id'), nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index('ix_incidents_status_severity', 'status', 'severity'),
    )

    from sqlalchemy.orm import relationship
    camera = relationship("Camera", backref="incidents")
    vehicle = relationship("Vehicle", backref="incidents")
    assignee = relationship("User", backref="assigned_incidents")
