from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/flow")
async def get_traffic_flow(lat: float, lon: float):
    # Returning 503 to trigger frontend fallback logic because no API key is provided
    raise HTTPException(status_code=503, detail="Live traffic data unavailable")

@router.get("/incidents")
async def get_traffic_incidents(lat: float, lon: float):
    # Returning 503 to trigger frontend fallback logic because no API key is provided
    raise HTTPException(status_code=503, detail="Live traffic data unavailable")

@router.get("/live")
async def get_live_traffic():
    return {"message": "Get live traffic"}
