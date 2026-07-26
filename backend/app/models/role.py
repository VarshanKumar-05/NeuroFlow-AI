from sqlalchemy import Column, String
from sqlalchemy import Uuid as UUID
from app.core.database import Base, TimestampMixin
import uuid

class Role(Base, TimestampMixin):
    __tablename__ = 'roles'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String, nullable=True)
