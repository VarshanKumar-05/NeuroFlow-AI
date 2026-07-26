from sqlalchemy import Column, String, ForeignKey
from sqlalchemy import Uuid as UUID, JSON as JSONB
from app.core.database import Base, TimestampMixin
import uuid

class Report(Base, TimestampMixin):
    __tablename__ = 'reports'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)
    file_url = Column(String, nullable=False)
    format = Column(String(10), default='pdf')
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    parameters = Column(JSONB, nullable=True)
