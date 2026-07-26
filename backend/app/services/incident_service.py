"""
Incident service — CRUD, status transitions, assignment, resolution, stats.
"""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.incident import Incident
from app.repositories.incident_repo import IncidentRepository
from app.schemas.incident import (
    IncidentCreate,
    IncidentList,
    IncidentResponse,
    IncidentUpdate,
)


class IncidentService:
    """Business logic for incident management and workflow."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = IncidentRepository(db)

    async def create(self, data: IncidentCreate) -> IncidentResponse:
        """Record a new incident."""
        incident = await self._repo.create(data.model_dump())
        return IncidentResponse.model_validate(incident)

    async def update_status(
        self, incident_id: UUID, data: IncidentUpdate
    ) -> IncidentResponse:
        """Update incident fields (status, assigned_to, description)."""
        incident = await self._repo.update(
            incident_id, data.model_dump(exclude_unset=True)
        )
        if incident is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found",
            )
        return IncidentResponse.model_validate(incident)

    async def assign(self, incident_id: UUID, user_id: UUID) -> IncidentResponse:
        """Assign an incident to a user and move status to 'assigned'."""
        incident = await self._repo.update(
            incident_id, {"assigned_to": user_id, "status": "assigned"}
        )
        if incident is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found",
            )
        return IncidentResponse.model_validate(incident)

    async def resolve(self, incident_id: UUID) -> IncidentResponse:
        """Mark an incident as resolved."""
        incident = await self._repo.update(
            incident_id,
            {"status": "resolved", "resolved_at": datetime.now(timezone.utc)},
        )
        if incident is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found",
            )
        return IncidentResponse.model_validate(incident)

    async def get_active(self, page: int = 1, size: int = 20) -> IncidentList:
        """Return all non-resolved incidents."""
        skip = (page - 1) * size
        incidents = await self._repo.get_active(skip=skip, limit=size)
        total = await self._repo.count(
            filters=[Incident.status != "resolved"]
        )
        return IncidentList(
            items=[IncidentResponse.model_validate(i) for i in incidents],
            total=total,
            page=page,
            size=size,
        )

    async def get_by_id(self, incident_id: UUID) -> IncidentResponse:
        """Fetch a single incident by ID or raise 404."""
        incident = await self._repo.get(incident_id)
        if incident is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found",
            )
        return IncidentResponse.model_validate(incident)

    async def get_all(self, page: int = 1, size: int = 20) -> IncidentList:
        """Return paginated incident list."""
        skip = (page - 1) * size
        incidents = await self._repo.get_multi(skip=skip, limit=size)
        total = await self._repo.count()
        return IncidentList(
            items=[IncidentResponse.model_validate(i) for i in incidents],
            total=total,
            page=page,
            size=size,
        )

    async def get_stats(self) -> dict:
        """Aggregate incident counts by status and severity."""
        # By status
        status_q = await self._db.execute(
            select(Incident.status, func.count())
            .group_by(Incident.status)
        )
        by_status = {row[0]: row[1] for row in status_q.all()}

        # By severity
        severity_q = await self._db.execute(
            select(Incident.severity, func.count())
            .group_by(Incident.severity)
        )
        by_severity = {row[0]: row[1] for row in severity_q.all()}

        total = sum(by_status.values())
        return {
            "total": total,
            "by_status": by_status,
            "by_severity": by_severity,
        }
