"""
Vehicle service — search, profile, history, camera-scoped lookups.
"""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app.models.vehicle import Vehicle
from app.repositories.vehicle_repo import VehicleRepository
from app.schemas.vehicle import VehicleDetail, VehicleList, VehicleResponse


class VehicleService:
    """Business logic for vehicle tracking and querying."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = VehicleRepository(db)

    async def search(
        self,
        track_id: int | None = None,
        vehicle_type: str | None = None,
        page: int = 1,
        size: int = 20,
    ) -> VehicleList:
        """Search vehicles by track_id and/or type."""
        filters = []
        if track_id is not None:
            filters.append(Vehicle.track_id == track_id)
        if vehicle_type is not None:
            filters.append(Vehicle.vehicle_type == vehicle_type)

        skip = (page - 1) * size
        vehicles = await self._repo.get_multi(skip=skip, limit=size, filters=filters)
        total = await self._repo.count(filters=filters)
        return VehicleList(
            items=[VehicleResponse.model_validate(v) for v in vehicles],
            total=total,
            page=page,
            size=size,
        )

    async def get_profile(self, vehicle_id: UUID) -> VehicleDetail:
        """Return full vehicle profile with detections."""
        result = await self._db.execute(
            select(Vehicle)
            .options(selectinload(Vehicle.detections))
            .where(Vehicle.id == vehicle_id)
        )
        vehicle = result.scalar_one_or_none()
        if vehicle is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found",
            )
        return VehicleDetail.model_validate(vehicle)

    async def get_history(self, vehicle_id: UUID) -> VehicleDetail:
        """Alias for get_profile — returns vehicle with detection history."""
        return await self.get_profile(vehicle_id)

    async def get_by_camera(
        self, camera_id: UUID, page: int = 1, size: int = 20
    ) -> VehicleList:
        """Return vehicles detected by a specific camera."""
        skip = (page - 1) * size
        vehicles = await self._repo.get_by_camera(camera_id, skip=skip, limit=size)
        total = await self._repo.count(filters=[Vehicle.camera_id == camera_id])
        return VehicleList(
            items=[VehicleResponse.model_validate(v) for v in vehicles],
            total=total,
            page=page,
            size=size,
        )
