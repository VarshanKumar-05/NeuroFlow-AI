from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy import Uuid as UUID
from app.core.database import Base, TimestampMixin
import uuid

class Prediction(Base, TimestampMixin):
    __tablename__ = 'predictions'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camera_id = Column(UUID(as_uuid=True), ForeignKey('cameras.id', ondelete='CASCADE'), nullable=False)
    forecast_minutes = Column(Integer, nullable=False)
    predicted_count = Column(Integer, nullable=False)
    predicted_congestion = Column(Float, nullable=True)
    confidence = Column(Float, nullable=False)
    model_version = Column(String(50), nullable=True)
    generated_at = Column(DateTime, index=True, nullable=False)
