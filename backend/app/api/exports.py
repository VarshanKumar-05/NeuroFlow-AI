from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import csv
import io
from app.core.database import get_db
from app.repositories.vehicle_repo import vehicle_repo

router = APIRouter(prefix="/exports", tags=["exports"])

@router.get("/vehicles/csv")
async def export_vehicles_csv(db: AsyncSession = Depends(get_db)):
    db_vehicles = await vehicle_repo.get_vehicles_with_cameras(db, skip=0, limit=1000)
    
    # Create an in-memory string buffer
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["ID", "Track ID", "Type", "First Seen", "Last Seen", "Avg Speed (mph)", "Location"])
    
    # Write data
    for v in db_vehicles:
        writer.writerow([
            str(v.id),
            v.track_id,
            v.vehicle_type,
            v.first_seen.strftime("%Y-%m-%d %H:%M:%S"),
            v.last_seen.strftime("%Y-%m-%d %H:%M:%S"),
            round(v.avg_speed, 2) if v.avg_speed else 0.0,
            v.camera.name if v.camera else "Unknown"
        ])
    
    # Seek to start
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=traffic_vehicles_export.csv"}
    )
