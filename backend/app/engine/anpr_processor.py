import asyncio
import datetime
import logging
from app.engine.anpr import anpr_engine
from app.core.database import async_session_maker
from app.models.vehicle import Vehicle
from app.models.plate import Plate
from app.models.vehicle_snapshot import VehicleSnapshot
from app.models.plate_snapshot import PlateSnapshot
from app.models.vehicle_history import VehicleHistory
from app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)

async def persist_anpr_record(track_id: int, cls_id: int, conf: float, frame, bbox):
    """
    Persists ANPR vehicle & plate records directly into PostgreSQL database.
    Calculates plate crop, normalized canonical string, confidence, and timeline event.
    """
    try:
        class_names = {2: "Car", 3: "Motorcycle", 5: "Bus", 7: "Truck", 0: "Emergency"}
        vehicle_type = class_names.get(cls_id, "Car")
        
        # Run ANPR Engine crop & OCR recognition
        anpr_data = anpr_engine.process_vehicle_crop(
            frame=frame,
            vehicle_bbox=bbox,
            track_id=track_id,
            vehicle_type=vehicle_type
        )
        
        now = datetime.datetime.now()
        
        async with async_session_maker() as db:
            # 1. Create Vehicle
            veh = Vehicle(
                track_id=track_id,
                vehicle_type=vehicle_type,
                confidence=conf,
                direction="Northbound" if track_id % 2 == 0 else "Southbound",
                first_seen=now - datetime.timedelta(seconds=int(track_id % 15) + 5),
                last_seen=now,
                avg_speed=float(35 + (track_id * 3) % 25),
                camera_id="Live City Camera 01",
                status=anpr_data["status"]
            )
            db.add(veh)
            await db.commit()
            await db.refresh(veh)
            
            # 2. Create Plate
            plate = Plate(
                vehicle_id=veh.id,
                plate_number=anpr_data["corrected_plate"],
                raw_ocr=anpr_data["raw_ocr"],
                corrected_plate=anpr_data["corrected_plate"],
                canonical_plate=anpr_data["canonical_plate"],
                ocr_confidence=anpr_data["ocr_confidence"],
                verified=(anpr_data["status"] == "VERIFIED"),
                regex_valid=anpr_data["regex_valid"],
                timestamp=now
            )
            db.add(plate)
            await db.commit()
            await db.refresh(plate)
            
            # 3. Vehicle Snapshot
            v_snap = VehicleSnapshot(
                vehicle_id=veh.id,
                image_path=anpr_data["vehicle_crop_url"]
            )
            db.add(v_snap)
            
            # 4. Plate Snapshot
            p_snap = PlateSnapshot(
                plate_id=plate.id,
                image_path=anpr_data["plate_crop_url"]
            )
            db.add(p_snap)
            
            # 5. Vehicle History
            h1 = VehicleHistory(
                vehicle_id=veh.id,
                event=f"Vehicle ROI Entry on Live City Camera 01",
                camera_id="Live City Camera 01",
                timestamp=veh.first_seen
            )
            h2 = VehicleHistory(
                vehicle_id=veh.id,
                event=f"License Plate {anpr_data['corrected_plate']} OCR Read (Conf: {anpr_data['ocr_confidence']}%)",
                camera_id="Live City Camera 01",
                timestamp=now
            )
            db.add(h1)
            db.add(h2)
            
            # 6. Audit Log
            audit = AuditLog(
                action="Vehicle Created",
                details=f"ANPR vehicle created: Track {track_id}, Plate {anpr_data['corrected_plate']}, Status {anpr_data['status']}",
                timestamp=now
            )
            db.add(audit)
            
            await db.commit()
            logger.info(f"[ANPR_PERSIST_SUCCESS] Vehicle Track {track_id} | Plate {anpr_data['corrected_plate']} | Canonical {anpr_data['canonical_plate']} stored in DB.")
            
    except Exception as e:
        logger.error(f"[ANPR_PERSIST_ERROR] Failed to save ANPR record: {e}")

def trigger_anpr_processing(track_id: int, cls_id: int, conf: float, frame, bbox):
    """Bridge call from synchronous OpenCV/YOLO thread to AsyncIO loop."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.run_coroutine_threadsafe(
                persist_anpr_record(track_id, cls_id, conf, frame, bbox),
                loop
            )
    except Exception as e:
        logger.error(f"Error triggering ANPR processing: {e}")
