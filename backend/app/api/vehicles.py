from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.vehicle_repo import vehicle_repo

router = APIRouter(tags=["vehicles"])

class VehicleFrontendResponse(BaseModel):
    id: str
    type: str
    timestamp: str
    speed: str
    location: str
    status: str

@router.get("/", response_model=List[VehicleFrontendResponse])
async def get_vehicles(type: Optional[str] = None, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    db_vehicles = await vehicle_repo.get_vehicles_with_cameras(db, v_type=type, skip=skip, limit=limit)
    
    results = []
    for v in db_vehicles:
        # Check if 10 minutes have passed since last seen
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        is_lost = (now - v.last_seen).total_seconds() > 600
        
        results.append(VehicleFrontendResponse(
            id=f"TRK-{v.track_id}",
            type=v.vehicle_type,
            timestamp=v.last_seen.strftime("%Y-%m-%d %H:%M:%S"),
            speed=f"{int(v.avg_speed)} mph" if v.avg_speed else "Unknown",
            location=v.camera.name if v.camera else "Unknown",
            status="Lost" if is_lost else "Tracked"
        ))
        
    return results
