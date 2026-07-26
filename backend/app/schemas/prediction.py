from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class PredictionResponse(BaseModel):
    id: UUID
    camera_id: UUID
    forecast_minutes: int
    predicted_count: int
    predicted_congestion: Optional[float] = None
    confidence: float
    model_version: Optional[str] = None
    generated_at: datetime

    class Config:
        from_attributes = True

class PredictionRequest(BaseModel):
    camera_id: UUID
    horizons: List[int]

class PredictionList(BaseModel):
    items: List[PredictionResponse]
    total: int
