from fastapi import APIRouter, Depends, Query, HTTPException, Response
from typing import Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.vehicle_service import VehicleService
from app.services.export_service import export_service

router = APIRouter(tags=["vehicles"])

# 1. Static Routes (MUST BE DEFINED BEFORE /{vehicle_id})

@router.get("/stats")
async def get_vehicle_summary_stats(db: AsyncSession = Depends(get_db)):
    """Executive Summary Cards Statistics."""
    service = VehicleService(db)
    return await service.get_summary_stats()

@router.get("/session")
async def get_active_anpr_session():
    """Vehicle Intelligence (v5.0): Active In-Memory Session Data."""
    from app.services.session_manager import anpr_session_manager
    return anpr_session_manager.get_session_data()

@router.post("/session/clear")
async def clear_active_anpr_session():
    """Vehicle Intelligence (v5.0): Wipe In-Memory Session State."""
    from app.services.session_manager import anpr_session_manager
    return anpr_session_manager.reset_session()

@router.get("/plates/list")
async def list_plates(db: AsyncSession = Depends(get_db)):
    """List all recognized license plates."""
    service = VehicleService(db)
    vehicles = await service.search_vehicles(page=1, size=100)
    plates = []
    for item in vehicles.get("items", []):
        plates.append({
            "vehicle_id": item["id"],
            "track_id": item["track_id"],
            "plate_number": item["license_plate"],
            "canonical_plate": item["canonical_plate"],
            "ocr_confidence": item["ocr_confidence"],
            "camera": item["camera_id"],
            "timestamp": item["first_seen"]
        })
    return plates

@router.get("/plates/search")
async def search_plates(query: str = Query(...), db: AsyncSession = Depends(get_db)):
    """Dedicated ANPR Plate Search Endpoint."""
    service = VehicleService(db)
    res = await service.search_vehicles(query=query, page=1, size=50)
    return res.get("items", [])

@router.get("/history/timeline")
async def get_vehicle_history(db: AsyncSession = Depends(get_db)):
    """System-wide vehicle detection & movement history timeline."""
    service = VehicleService(db)
    vehicles = await service.search_vehicles(page=1, size=20)
    history = []
    for v in vehicles.get("items", []):
        history.append({
            "id": f"evt-{v['track_id']}",
            "track_id": v["track_id"],
            "license_plate": v["license_plate"],
            "vehicle_type": v["vehicle_type"],
            "camera_id": v["camera_id"],
            "event": f"Vehicle ROI Crossing & ANPR read on {v['camera_id']}",
            "timestamp": v["first_seen"]
        })
    return history

@router.get("/export/csv")
async def export_csv(db: AsyncSession = Depends(get_db)):
    """Export vehicle intelligence records as CSV."""
    service = VehicleService(db)
    data = await service.search_vehicles(page=1, size=500)
    csv_content = export_service.generate_csv(data.get("items", []))
    await service.log_audit("Export Generated", "User exported vehicle records as CSV")
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vehicle_intelligence_export.csv"}
    )

@router.get("/export/excel")
async def export_excel(db: AsyncSession = Depends(get_db)):
    """Export vehicle intelligence records as Excel workbook."""
    service = VehicleService(db)
    data = await service.search_vehicles(page=1, size=500)
    excel_bytes = export_service.generate_excel(data.get("items", []))
    await service.log_audit("Export Generated", "User exported vehicle records as Excel")
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=vehicle_intelligence_export.xlsx"}
    )

@router.get("/export/pdf")
async def export_pdf(db: AsyncSession = Depends(get_db)):
    """Export vehicle intelligence records as PDF document."""
    service = VehicleService(db)
    data = await service.search_vehicles(page=1, size=500)
    pdf_bytes = export_service.generate_pdf(data.get("items", []))
    await service.log_audit("Export Generated", "User exported vehicle intelligence report as PDF")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=vehicle_intelligence_report.pdf"}
    )

@router.get("/")
async def get_vehicles(
    query: Optional[str] = Query(None, description="Search by Plate Number, Track ID, or Type"),
    vehicle_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    camera_id: Optional[str] = Query(None),
    date_filter: Optional[str] = Query(None), # today, yesterday, 7days
    low_confidence: Optional[bool] = Query(None),
    repeated_only: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """List & Search Vehicles with Multi-Filter Controls."""
    service = VehicleService(db)
    return await service.search_vehicles(
        query=query,
        vehicle_type=vehicle_type,
        status=status,
        camera_id=camera_id,
        date_filter=date_filter,
        low_confidence=low_confidence,
        repeated_only=repeated_only,
        page=page,
        size=size
    )

# 2. Parameterized Route (MUST BE LAST)

@router.get("/{vehicle_id}")
async def get_vehicle_profile(vehicle_id: str, db: AsyncSession = Depends(get_db)):
    """Full Detailed Vehicle Profile including snapshots and movement history timeline."""
    service = VehicleService(db)
    try:
        u_id = UUID(vehicle_id)
        profile = await service.get_vehicle_profile(u_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        return profile
    except ValueError:
        res = await service.search_vehicles(query=vehicle_id, page=1, size=1)
        if res.get("items"):
            item_id = res["items"][0]["id"]
            return await service.get_vehicle_profile(UUID(item_id))
        raise HTTPException(status_code=404, detail="Vehicle not found")
