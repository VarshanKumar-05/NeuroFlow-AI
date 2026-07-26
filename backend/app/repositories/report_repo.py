"""
Report repository with user and type queries.
"""

from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import Report
from app.repositories.base import BaseRepository


class ReportRepository(BaseRepository[Report]):
    """Data access layer for Report entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Report, db)

    async def get_by_user(
        self, user_id: UUID, skip: int = 0, limit: int = 20
    ) -> Sequence[Report]:
        """Return reports created by a specific user."""
        result = await self._db.execute(
            select(Report)
            .where(Report.created_by == user_id)
            .order_by(Report.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_by_type(
        self, report_type: str, skip: int = 0, limit: int = 20
    ) -> Sequence[Report]:
        """Return reports filtered by type."""
        result = await self._db.execute(
            select(Report)
            .where(Report.type == report_type)
            .order_by(Report.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
