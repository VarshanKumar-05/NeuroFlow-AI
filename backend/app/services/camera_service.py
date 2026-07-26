"""
Camera service — CRUD operations and status queries.
"""

from typing import Sequence
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.camera import Camera
from app.repositories.camera_repo import CameraRepository
from app.schemas.camera import CameraCreate, CameraListResponse, CameraResponse, CameraUpdate


class CameraService:
    """Business logic for camera management."""

    def __init__(self, db: AsyncSession) -> None:
        self._repo = CameraRepository(db)

    async def get_all(
        self, page: int = 1, size: int = 20
    ) -> CameraListResponse:
        """Return a paginated list of all cameras."""
        skip = (page - 1) * size
        cameras = await self._repo.get_multi(skip=skip, limit=size)
        total = await self._repo.count()
        return CameraListResponse(
            items=[CameraResponse.model_validate(c) for c in cameras],
            total=total,
            page=page,
            size=size,
        )

    async def get_by_id(self, camera_id: UUID) -> CameraResponse:
        """Return a single camera by ID or 404."""
        camera = await self._repo.get(camera_id)
        if camera is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Camera not found",
            )
        return CameraResponse.model_validate(camera)

    async def create(self, data: CameraCreate) -> CameraResponse:
        """Register a new camera."""
        camera = await self._repo.create(data.model_dump())
        return CameraResponse.model_validate(camera)

    async def update(self, camera_id: UUID, data: CameraUpdate) -> CameraResponse:
        """Update camera fields."""
        camera = await self._repo.update(
            camera_id, data.model_dump(exclude_unset=True)
        )
        if camera is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Camera not found",
            )
        return CameraResponse.model_validate(camera)

    async def delete(self, camera_id: UUID) -> bool:
        """Remove a camera. Returns True if deleted."""
        deleted = await self._repo.delete(camera_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Camera not found",
            )
        return True

    async def get_all_active(self) -> list[CameraResponse]:
        """Return only cameras with status='online'."""
        cameras = await self._repo.get_active_cameras()
        return [CameraResponse.model_validate(c) for c in cameras]

    async def health_check(self, camera_id: UUID) -> dict[str, str]:
        """Placeholder camera connectivity health check."""
        camera = await self._repo.get(camera_id)
        if camera is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Camera not found",
            )
        # In production this would probe the RTSP stream
        return {
            "camera_id": str(camera.id),
            "status": camera.status,
            "message": "Health check placeholder — RTSP probe not implemented",
        }
