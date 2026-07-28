from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy import Uuid as UUID
from app.core.database import Base, TimestampMixin
import uuid

class IncidentEvidence(Base, TimestampMixin):
    __tablename__ = 'incident_evidence'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey('incidents.id'), nullable=False, index=True)
    snapshot_path = Column(String(255), nullable=False)
    video_clip_path = Column(String(255), nullable=True)
    bounding_boxes_json = Column(Text, nullable=True)
