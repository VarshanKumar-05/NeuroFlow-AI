from sqlalchemy import Column, String, DateTime, func
from sqlalchemy import Uuid as UUID, JSON as JSONB
from app.core.database import Base
import uuid

class SystemLog(Base):
    __tablename__ = 'system_logs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    level = Column(String(10), nullable=False)
    source = Column(String(100), nullable=False)
    message = Column(String, nullable=False)
    details = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
