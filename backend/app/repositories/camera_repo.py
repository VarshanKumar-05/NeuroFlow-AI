from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.camera import Camera
from app.schemas.camera import CameraCreate, CameraUpdate
from .base import BaseRepository

class CameraRepository(BaseRepository[Camera, CameraCreate, CameraUpdate]):
    async def get_active_cameras(self, db: AsyncSession):
        result = await db.execute(select(Camera).filter(Camera.status != 'offline'))
        return result.scalars().all()

camera_repo = CameraRepository(Camera)
