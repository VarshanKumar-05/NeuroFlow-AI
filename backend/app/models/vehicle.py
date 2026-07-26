from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy import Uuid as UUID
from app.core.database import Base, TimestampMixin
import uuid

class Vehicle(Base, TimestampMixin):
    __tablename__ = 'vehicles'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    track_id = Column(Integer, index=True, nullable=False)
    vehicle_type = Column(String(30), nullable=False)
    first_seen = Column(DateTime, nullable=False)
    last_seen = Column(DateTime, nullable=False)
    avg_speed = Column(Float, nullable=True)
    camera_id = Column(UUID(as_uuid=True), ForeignKey('cameras.id'), nullable=False)
    
    from sqlalchemy.orm import relationship
    camera = relationship("Camera", backref="vehicles")
