from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship
from app.core.database import Base, TimestampMixin
import uuid

class Plate(Base, TimestampMixin):
    __tablename__ = 'plates'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey('vehicles.id'), nullable=False, index=True)
    plate_number = Column(String(50), index=True, nullable=False)
    raw_ocr = Column(String(50), nullable=False)
    corrected_plate = Column(String(50), nullable=False)
    canonical_plate = Column(String(50), index=True, nullable=False) # e.g. AP39AB1234
    ocr_confidence = Column(Float, nullable=False, default=0.0)
    verified = Column(Boolean, default=True)
    regex_valid = Column(Boolean, default=True)
    timestamp = Column(DateTime, nullable=False)

    snapshots = relationship("PlateSnapshot", backref="plate", cascade="all, delete-orphan")
