from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.schemas.camera import CameraCreate, CameraUpdate, CameraResponse
from app.repositories import camera_repo

router = APIRouter(tags=["cameras"])

@router.get("/", response_model=List[CameraResponse])
async def get_cameras(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await camera_repo.get_multi(db, skip=skip, limit=limit)

@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(camera_id: UUID, db: AsyncSession = Depends(get_db)):
    camera = await camera_repo.get(db, id=camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera

@router.post("/", response_model=CameraResponse, status_code=status.HTTP_201_CREATED)
async def create_camera(camera_in: CameraCreate, db: AsyncSession = Depends(get_db)):
    return await camera_repo.create(db, obj_in=camera_in)

@router.put("/{camera_id}", response_model=CameraResponse)
async def update_camera(camera_id: UUID, camera_in: CameraUpdate, db: AsyncSession = Depends(get_db)):
    camera = await camera_repo.get(db, id=camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return await camera_repo.update(db, db_obj=camera, obj_in=camera_in)

@router.delete("/{camera_id}", response_model=CameraResponse)
async def delete_camera(camera_id: UUID, db: AsyncSession = Depends(get_db)):
    camera = await camera_repo.get(db, id=camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return await camera_repo.delete(db, id=camera_id)
