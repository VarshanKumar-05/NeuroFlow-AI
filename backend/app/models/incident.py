from sqlalchemy import Column, String, Float, DateTime, Text, Index
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship
from app.core.database import Base, TimestampMixin
import uuid

class Incident(Base, TimestampMixin):
    __tablename__ = 'incidents'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_type = Column(String(50), nullable=False, index=True) # Vehicle Collision, Stopped Vehicle, Wrong Way Driving, Road Blockage, Emergency Vehicle Detected, Heavy Congestion, Camera Offline, System Failure
    severity = Column(String(20), nullable=False, default='HIGH')  # CRITICAL, HIGH, MEDIUM, LOW
    priority = Column(String(10), nullable=False, default='P1')    # P1, P2, P3, P4
    confidence = Column(Float, nullable=False, default=95.0)
    camera_id = Column(String(100), nullable=False, default='Live City Camera 01')
    timestamp = Column(DateTime, nullable=False)
    status = Column(String(30), default='OPEN', index=True)        # OPEN, ACKNOWLEDGED, INVESTIGATING, RESOLVED, CLOSED, ARCHIVED
    description = Column(Text, nullable=True)
    operator_notes = Column(Text, nullable=True)
    assigned_operator = Column(String(100), default='Operator Alpha')
    vehicles_involved = Column(String(255), default='2 Vehicles')
    track_ids = Column(String(100), default='TRK-101, TRK-102')

    evidence = relationship("IncidentEvidence", backref="incident", cascade="all, delete-orphan")
    history = relationship("IncidentHistory", backref="incident", cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_incidents_status_severity_priority', 'status', 'severity', 'priority'),
    )
