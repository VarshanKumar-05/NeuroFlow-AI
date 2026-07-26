"""
Traffic service — live metrics, summaries, historical data, KPI aggregation.
"""

from datetime import datetime, timezone
from typing import Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.traffic_repo import TrafficMetricRepository
from app.schemas.traffic import TrafficMetricList, TrafficMetricResponse, TrafficSummary


class TrafficService:
    """Business logic for traffic metrics and dashboard KPIs."""

    def __init__(self, db: AsyncSession) -> None:
        self._repo = TrafficMetricRepository(db)

    async def get_live_metrics(self, camera_id: UUID) -> TrafficMetricResponse | None:
        """Return the latest metric snapshot for a camera."""
        metric = await self._repo.get_latest(camera_id)
        if metric is None:
            return None
        return TrafficMetricResponse.model_validate(metric)

    async def get_summary(self) -> TrafficSummary:
        """Compute platform-wide traffic summary for the dashboard."""
        data = await self._repo.get_summary()
        return TrafficSummary(
            **data,
            timestamp=datetime.now(timezone.utc),
        )

    async def get_historical(
        self,
        camera_id: UUID,
        start: datetime,
        end: datetime,
        page: int = 1,
        size: int = 100,
    ) -> TrafficMetricList:
        """Return paginated historical metrics for a camera in a time range."""
        metrics = await self._repo.get_range(camera_id, start, end, limit=size)
        total = len(metrics)
        return TrafficMetricList(
            items=[TrafficMetricResponse.model_validate(m) for m in metrics],
            total=total,
            page=page,
            size=size,
        )

    async def aggregate_kpis(
        self, camera_id: UUID, start: datetime, end: datetime
    ) -> dict:
        """Compute aggregated KPIs over a time range for a camera."""
        metrics = await self._repo.get_range(camera_id, start, end)
        if not metrics:
            return {
                "camera_id": str(camera_id),
                "period_start": start.isoformat(),
                "period_end": end.isoformat(),
                "avg_vehicle_count": 0,
                "avg_speed": 0.0,
                "avg_congestion": 0.0,
                "max_queue_length": 0,
                "data_points": 0,
            }

        counts = [m.vehicle_count for m in metrics]
        speeds = [m.avg_speed for m in metrics]
        congestions = [m.congestion_score for m in metrics]
        queues = [m.queue_length for m in metrics]

        return {
            "camera_id": str(camera_id),
            "period_start": start.isoformat(),
            "period_end": end.isoformat(),
            "avg_vehicle_count": round(sum(counts) / len(counts), 1),
            "avg_speed": round(sum(speeds) / len(speeds), 1),
            "avg_congestion": round(sum(congestions) / len(congestions), 2),
            "max_queue_length": max(queues),
            "data_points": len(metrics),
        }
