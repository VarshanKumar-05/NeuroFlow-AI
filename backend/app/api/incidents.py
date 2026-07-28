from fastapi import APIRouter, Depends, Query, HTTPException, Response
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.incident_service import IncidentService
from app.services.export_service import export_service
from app.core.websocket_manager import manager

router = APIRouter(tags=["incidents"])

class OperatorActionRequest(BaseModel):
    operator: Optional[str] = "Operator Alpha"
    notes: Optional[str] = None

# Static routes first!

@router.get("/stats")
async def get_incident_summary_stats(db: AsyncSession = Depends(get_db)):
    """Emergency Summary Cards Statistics."""
    service = IncidentService(db)
    return await service.get_summary_stats()

@router.get("/export/csv")
async def export_incidents_csv(db: AsyncSession = Depends(get_db)):
    """Export incident evidence records as CSV."""
    service = IncidentService(db)
    data = await service.search_incidents(page=1, size=500)
    csv_content = export_service.generate_incident_csv(data.get("items", []))
    await service.log_audit("Export Generated", "User exported emergency incident records as CSV")
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=emergency_incidents_export.csv"}
    )

@router.get("/export/pdf")
async def export_incidents_pdf(db: AsyncSession = Depends(get_db)):
    """Export incident evidence report as PDF."""
    service = IncidentService(db)
    data = await service.search_incidents(page=1, size=500)
    pdf_bytes = export_service.generate_incident_pdf(data.get("items", []))
    await service.log_audit("Export Generated", "User exported emergency incident report as PDF")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=emergency_incidents_report.pdf"}
    )

@router.get("/")
async def get_incidents(
    query: Optional[str] = Query(None, description="Search by Type, Camera, or Description"),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    camera_id: Optional[str] = Query(None),
    incident_type: Optional[str] = Query(None),
    date_filter: Optional[str] = Query(None),
    unresolved_only: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """List & Search Incidents with Multi-Filter Controls."""
    service = IncidentService(db)
    return await service.search_incidents(
        query=query,
        status=status,
        severity=severity,
        priority=priority,
        camera_id=camera_id,
        incident_type=incident_type,
        date_filter=date_filter,
        unresolved_only=unresolved_only,
        page=page,
        size=size
    )

# State Transition Action Routes

@router.post("/{incident_id}/acknowledge")
async def acknowledge_incident(incident_id: str, data: Optional[OperatorActionRequest] = None, db: AsyncSession = Depends(get_db)):
    """Transition status: OPEN -> ACKNOWLEDGED."""
    service = IncidentService(db)
    try:
        u_id = UUID(incident_id)
    except ValueError:
        res = await service.search_incidents(query=incident_id, page=1, size=1)
        if not res.get("items"):
            raise HTTPException(status_code=404, detail="Incident not found")
        u_id = UUID(res["items"][0]["id"])

    req_data = data or OperatorActionRequest()
    updated = await service.transition_status(u_id, "ACKNOWLEDGED", operator_notes=req_data.notes, operator=req_data.operator)
    
    # Broadcast WebSocket update
    await manager.broadcast({"type": "INCIDENT_ACKNOWLEDGED", "payload": updated}, topic="incidents")
    return updated

@router.post("/{incident_id}/investigate")
async def investigate_incident(incident_id: str, data: Optional[OperatorActionRequest] = None, db: AsyncSession = Depends(get_db)):
    """Transition status -> INVESTIGATING."""
    service = IncidentService(db)
    try:
        u_id = UUID(incident_id)
    except ValueError:
        res = await service.search_incidents(query=incident_id, page=1, size=1)
        if not res.get("items"):
            raise HTTPException(status_code=404, detail="Incident not found")
        u_id = UUID(res["items"][0]["id"])

    req_data = data or OperatorActionRequest()
    updated = await service.transition_status(u_id, "INVESTIGATING", operator_notes=req_data.notes, operator=req_data.operator)
    
    await manager.broadcast({"type": "INCIDENT_UPDATED", "payload": updated}, topic="incidents")
    return updated

@router.post("/{incident_id}/resolve")
async def resolve_incident(incident_id: str, data: Optional[OperatorActionRequest] = None, db: AsyncSession = Depends(get_db)):
    """Transition status -> RESOLVED."""
    service = IncidentService(db)
    try:
        u_id = UUID(incident_id)
    except ValueError:
        res = await service.search_incidents(query=incident_id, page=1, size=1)
        if not res.get("items"):
            raise HTTPException(status_code=404, detail="Incident not found")
        u_id = UUID(res["items"][0]["id"])

    req_data = data or OperatorActionRequest()
    updated = await service.transition_status(u_id, "RESOLVED", operator_notes=req_data.notes, operator=req_data.operator)
    
    await manager.broadcast({"type": "INCIDENT_RESOLVED", "payload": updated}, topic="incidents")
    return updated

@router.post("/{incident_id}/close")
async def close_incident(incident_id: str, data: Optional[OperatorActionRequest] = None, db: AsyncSession = Depends(get_db)):
    """Transition status -> CLOSED."""
    service = IncidentService(db)
    try:
        u_id = UUID(incident_id)
    except ValueError:
        res = await service.search_incidents(query=incident_id, page=1, size=1)
        if not res.get("items"):
            raise HTTPException(status_code=404, detail="Incident not found")
        u_id = UUID(res["items"][0]["id"])

    req_data = data or OperatorActionRequest()
    updated = await service.transition_status(u_id, "CLOSED", operator_notes=req_data.notes, operator=req_data.operator)
    
    await manager.broadcast({"type": "INCIDENT_CLOSED", "payload": updated}, topic="incidents")
    return updated

@router.post("/{incident_id}/archive")
async def archive_incident(incident_id: str, data: Optional[OperatorActionRequest] = None, db: AsyncSession = Depends(get_db)):
    """Transition status -> ARCHIVED."""
    service = IncidentService(db)
    try:
        u_id = UUID(incident_id)
    except ValueError:
        res = await service.search_incidents(query=incident_id, page=1, size=1)
        if not res.get("items"):
            raise HTTPException(status_code=404, detail="Incident not found")
        u_id = UUID(res["items"][0]["id"])

    req_data = data or OperatorActionRequest()
    updated = await service.transition_status(u_id, "ARCHIVED", operator_notes=req_data.notes, operator=req_data.operator)
    return updated

# Parameterized Route (MUST BE LAST)

@router.get("/{incident_id}")
async def get_incident_profile(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Full Detailed Incident Profile with evidence and history timeline."""
    service = IncidentService(db)
    try:
        u_id = UUID(incident_id)
        profile = await service.get_incident_profile(u_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Incident not found")
        return profile
    except ValueError:
        res = await service.search_incidents(query=incident_id, page=1, size=1)
        if res.get("items"):
            item_id = res["items"][0]["id"]
            return await service.get_incident_profile(UUID(item_id))
        raise HTTPException(status_code=404, detail="Incident not found")
