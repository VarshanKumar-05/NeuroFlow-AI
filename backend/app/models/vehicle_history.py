from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy import Uuid as UUID
from app.core.database import Base, TimestampMixin
import uuid

class VehicleHistory(Base, TimestampMixin):
    __tablename__ = 'vehicle_history'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey('vehicles.id'), nullable=False, index=True)
    event = Column(String(255), nullable=False)
    camera_id = Column(String(100), nullable=True)
    timestamp = Column(DateTime, nullable=False)
