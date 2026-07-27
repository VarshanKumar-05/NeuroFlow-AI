from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy import Uuid as UUID
from app.core.database import Base, TimestampMixin
import uuid
import datetime

class AuditLog(Base, TimestampMixin):
    __tablename__ = 'audit_logs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action = Column(String(100), nullable=False, index=True) # Vehicle Created, OCR Updated, Plate Verified, Status Changed, Export Generated
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.now, nullable=False)
