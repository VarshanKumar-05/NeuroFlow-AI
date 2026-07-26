"""
Prediction service — forecast retrieval and generation (placeholder).
"""

import random
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.prediction_repo import PredictionRepository
from app.schemas.prediction import PredictionList, PredictionRequest, PredictionResponse


class PredictionService:
    """Business logic for AI-generated traffic forecasts."""

    def __init__(self, db: AsyncSession) -> None:
        self._repo = PredictionRepository(db)

    async def get_latest(
        self, camera_id: UUID, horizon: int | None = None
    ) -> PredictionResponse | None:
        """Return the latest prediction for a camera."""
        prediction = await self._repo.get_latest(camera_id, horizon)
        if prediction is None:
            return None
        return PredictionResponse.model_validate(prediction)

    async def get_forecast(
        self, camera_id: UUID, start: datetime, end: datetime
    ) -> PredictionList:
        """Return predictions for a camera in a time range."""
        predictions = await self._repo.get_range(camera_id, start, end)
        return PredictionList(
            items=[PredictionResponse.model_validate(p) for p in predictions],
            total=len(predictions),
        )

    async def generate(self, request: PredictionRequest) -> PredictionList:
        """Generate predictions for each requested horizon.

        This is a **placeholder** — in production the actual ML model
        (XGBoost / LSTM) would be invoked here. Currently returns
        synthetic predictions to validate the API contract.
        """
        results: list[PredictionResponse] = []
        now = datetime.now(timezone.utc)

        for horizon in request.horizons:
            prediction = await self._repo.create(
                {
                    "camera_id": request.camera_id,
                    "forecast_minutes": horizon,
                    "predicted_count": random.randint(5, 120),
                    "predicted_congestion": round(random.uniform(0.1, 0.95), 2),
                    "confidence": round(random.uniform(0.70, 0.98), 2),
                    "model_version": "placeholder-v0.1",
                    "generated_at": now,
                }
            )
            results.append(PredictionResponse.model_validate(prediction))

        return PredictionList(items=results, total=len(results))
