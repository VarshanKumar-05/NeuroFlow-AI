"""
Prediction repository with latest and time-range queries.
"""

from datetime import datetime
from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prediction import Prediction
from app.repositories.base import BaseRepository


class PredictionRepository(BaseRepository[Prediction]):
    """Data access layer for Prediction entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Prediction, db)

    async def get_latest(
        self, camera_id: UUID, horizon: int | None = None
    ) -> Prediction | None:
        """Return the most recent prediction for a camera, optionally filtered by horizon."""
        stmt = (
            select(Prediction)
            .where(Prediction.camera_id == camera_id)
            .order_by(Prediction.generated_at.desc())
        )
        if horizon is not None:
            stmt = stmt.where(Prediction.forecast_minutes == horizon)
        stmt = stmt.limit(1)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_range(
        self,
        camera_id: UUID,
        start: datetime,
        end: datetime,
        limit: int = 200,
    ) -> Sequence[Prediction]:
        """Return predictions for a camera within a time range."""
        result = await self._db.execute(
            select(Prediction)
            .where(
                Prediction.camera_id == camera_id,
                Prediction.generated_at >= start,
                Prediction.generated_at <= end,
            )
            .order_by(Prediction.generated_at.asc())
            .limit(limit)
        )
        return result.scalars().all()
