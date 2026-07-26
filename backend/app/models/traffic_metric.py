from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Index
from sqlalchemy import Uuid as UUID, JSON as JSONB
from app.core.database import Base, TimestampMixin
import uuid

class TrafficMetric(Base, TimestampMixin):
    __tablename__ = 'traffic_metrics'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camera_id = Column(UUID(as_uuid=True), ForeignKey('cameras.id', ondelete='CASCADE'), nullable=False)
    vehicle_count = Column(Integer, nullable=False)
    avg_speed = Column(Float, nullable=False)
    queue_length = Column(Integer, nullable=False)
    congestion_score = Column(Float, nullable=False)
    lane_occupancy = Column(JSONB, nullable=True)
    recorded_at = Column(DateTime, nullable=False)

    __table_args__ = (
        Index('ix_traffic_metrics_camera_time', 'camera_id', 'recorded_at'),
    )
