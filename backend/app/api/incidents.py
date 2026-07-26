from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.incident_repo import incident_repo

router = APIRouter(tags=["incidents"])

class IncidentFrontendResponse(BaseModel):
    id: str
    type: str
    severity: str
    location: str
    timestamp: str
    status: str

@router.get("/", response_model=List[IncidentFrontendResponse])
async def get_incidents(status: Optional[str] = None, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    db_incidents = await incident_repo.get_incidents_with_cameras(db, status=status, skip=skip, limit=limit)
    
    results = []
    for inc in db_incidents:
        results.append(IncidentFrontendResponse(
            id=f"INC-{str(inc.id)[:8].upper()}",
            type=inc.type,
            severity=inc.severity,
            location=inc.camera.name if inc.camera else "Unknown Location",
            timestamp=inc.created_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
            status=inc.status
        ))
        
    return results
