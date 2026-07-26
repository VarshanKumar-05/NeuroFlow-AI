from sqlalchemy import Column, String, Float, Integer
from sqlalchemy import Uuid as UUID
from app.core.database import Base, TimestampMixin
import uuid

class Camera(Base, TimestampMixin):
    __tablename__ = 'cameras'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    location = Column(String(255), nullable=False)
    rtsp_url = Column(String, nullable=True)
    status = Column(String(20), default='offline')
    fps = Column(Integer, default=0)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
