from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy import Uuid as UUID
from app.core.database import Base, TimestampMixin
import uuid

class IncidentHistory(Base, TimestampMixin):
    __tablename__ = 'incident_history'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey('incidents.id'), nullable=False, index=True)
    event = Column(String(255), nullable=False)
    operator = Column(String(100), nullable=True, default='System AI')
    timestamp = Column(DateTime, nullable=False)
