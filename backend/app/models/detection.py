from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy import Uuid as UUID, JSON as JSONB
from app.core.database import Base, TimestampMixin
import uuid

class Detection(Base, TimestampMixin):
    __tablename__ = 'detections'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey('vehicles.id', ondelete='CASCADE'), nullable=False)
    camera_id = Column(UUID(as_uuid=True), ForeignKey('cameras.id', ondelete='CASCADE'), nullable=False)
    frame_number = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=False)
    bounding_box = Column(JSONB, nullable=False)
    lane = Column(Integer, nullable=True)
    timestamp = Column(DateTime, index=True, nullable=False)
