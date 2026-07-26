from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.prediction_engine import prediction_engine

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.get("/forecast", response_model=List[Dict[str, Any]])
async def get_traffic_forecast(hours: int = 24):
    """Returns a time-series forecast of predicted traffic volumes"""
    return prediction_engine.generate_forecast(hours_ahead=hours)

@router.get("/recommendations", response_model=List[Dict[str, str]])
async def get_decisions():
    """Returns Explainable AI decision recommendations based on current analytics"""
    return prediction_engine.get_decision_recommendations()
