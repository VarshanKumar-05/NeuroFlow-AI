from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy import Uuid as UUID
from app.core.database import Base, TimestampMixin
import uuid

class Vehicle(Base, TimestampMixin):
    __tablename__ = 'vehicles'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    track_id = Column(Integer, index=True, nullable=False)
    vehicle_type = Column(String(30), nullable=False)
    confidence = Column(Float, default=0.90)
    direction = Column(String(20), default="Northbound")
    first_seen = Column(DateTime, nullable=False)
    last_seen = Column(DateTime, nullable=False)
    avg_speed = Column(Float, nullable=True)
    camera_id = Column(String(100), nullable=False, default="Live City Camera 01")
    status = Column(String(30), default="ACTIVE", index=True) # NEW, ACTIVE, EXITED, VERIFIED, LOW CONFIDENCE, ARCHIVED
    color = Column(String(30), nullable=True) # Future extensibility
    make = Column(String(50), nullable=True)  # Future extensibility
    model = Column(String(50), nullable=True) # Future extensibility
    
    from sqlalchemy.orm import relationship
    plates = relationship("Plate", backref="vehicle", cascade="all, delete-orphan")
    snapshots = relationship("VehicleSnapshot", backref="vehicle", cascade="all, delete-orphan")
    history = relationship("VehicleHistory", backref="vehicle", cascade="all, delete-orphan")
