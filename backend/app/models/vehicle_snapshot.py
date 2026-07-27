from sqlalchemy import Column, String, ForeignKey
from sqlalchemy import Uuid as UUID
from app.core.database import Base, TimestampMixin
import uuid

class VehicleSnapshot(Base, TimestampMixin):
    __tablename__ = 'vehicle_snapshots'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey('vehicles.id'), nullable=False, index=True)
    image_path = Column(String(255), nullable=False)
