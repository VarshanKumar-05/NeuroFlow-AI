from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.models.incident import Incident
from app.schemas.incident import IncidentResponse
from .base import BaseRepository

class IncidentRepository(BaseRepository[Incident, IncidentResponse, IncidentResponse]):
    async def get_incidents_with_cameras(self, db: AsyncSession, status: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Incident]:
        query = select(Incident).options(selectinload(Incident.camera)) # wait, I need to add camera relationship to Incident model!
        if status:
            query = query.filter(Incident.status == status)
        query = query.order_by(Incident.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

incident_repo = IncidentRepository(Incident)
