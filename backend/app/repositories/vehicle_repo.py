from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.models.vehicle import Vehicle
from app.models.camera import Camera
from app.schemas.vehicle import VehicleResponse
from .base import BaseRepository

class VehicleRepository(BaseRepository[Vehicle, VehicleResponse, VehicleResponse]):
    async def get_vehicles_with_cameras(self, db: AsyncSession, v_type: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Vehicle]:
        query = select(Vehicle).options(selectinload(Vehicle.camera))
        if v_type:
            query = query.filter(Vehicle.vehicle_type == v_type)
        query = query.order_by(Vehicle.last_seen.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

vehicle_repo = VehicleRepository(Vehicle)
