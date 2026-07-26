"""
Traffic metric repository with time-range and summary queries.
"""

from datetime import datetime
from typing import Any, Sequence
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.traffic_metric import TrafficMetric
from app.models.camera import Camera
from app.models.incident import Incident
from app.repositories.base import BaseRepository


class TrafficMetricRepository(BaseRepository[TrafficMetric]):
    """Data access layer for TrafficMetric entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(TrafficMetric, db)

    async def get_latest(self, camera_id: UUID) -> TrafficMetric | None:
        """Return the most recent metric for a camera."""
        result = await self._db.execute(
            select(TrafficMetric)
            .where(TrafficMetric.camera_id == camera_id)
            .order_by(TrafficMetric.recorded_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_range(
        self,
        camera_id: UUID,
        start: datetime,
        end: datetime,
        limit: int = 500,
    ) -> Sequence[TrafficMetric]:
        """Return metrics for a camera within a time range."""
        result = await self._db.execute(
            select(TrafficMetric)
            .where(
                TrafficMetric.camera_id == camera_id,
                TrafficMetric.recorded_at >= start,
                TrafficMetric.recorded_at <= end,
            )
            .order_by(TrafficMetric.recorded_at.asc())
            .limit(limit)
        )
        return result.scalars().all()

    async def get_summary(self) -> dict[str, Any]:
        """Compute a platform-wide traffic summary."""
        # Total vehicles across latest metrics
        total_vehicles_q = await self._db.execute(
            select(func.coalesce(func.sum(TrafficMetric.vehicle_count), 0))
        )
        total_vehicles: int = total_vehicles_q.scalar_one()

        # Average speed
        avg_speed_q = await self._db.execute(
            select(func.coalesce(func.avg(TrafficMetric.avg_speed), 0.0))
        )
        avg_speed: float = float(avg_speed_q.scalar_one())

        # Average congestion score
        congestion_q = await self._db.execute(
            select(func.coalesce(func.avg(TrafficMetric.congestion_score), 0.0))
        )
        avg_congestion: float = float(congestion_q.scalar_one())

        # Active cameras
        active_cam_q = await self._db.execute(
            select(func.count()).select_from(Camera).where(Camera.status == "online")
        )
        active_cameras: int = active_cam_q.scalar_one()

        # Active incidents
        active_inc_q = await self._db.execute(
            select(func.count())
            .select_from(Incident)
            .where(Incident.status == "open")
        )
        active_incidents: int = active_inc_q.scalar_one()

        # Determine congestion level label
        if avg_congestion < 0.3:
            congestion_level = "low"
        elif avg_congestion < 0.6:
            congestion_level = "moderate"
        elif avg_congestion < 0.8:
            congestion_level = "high"
        else:
            congestion_level = "critical"

        return {
            "total_vehicles": total_vehicles,
            "avg_speed": round(avg_speed, 1),
            "congestion_level": congestion_level,
            "active_cameras": active_cameras,
            "active_incidents": active_incidents,
        }
