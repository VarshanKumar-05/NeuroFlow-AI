import asyncio
import datetime
import uuid
import logging
from typing import Dict, Any
from app.core.database import async_session_maker
from app.models import Incident, IncidentEvidence, IncidentHistory, AuditLog
from app.services.notification_service import notification_service
from app.core.websocket_manager import manager

logger = logging.getLogger(__name__)

class AlertEngineNotifier:
    """
    Alert & Incident Dispatcher Engine: Handles database persistence, Telegram notifications, and WebSocket broadcasting.
    """
    async def dispatch_incident(self, incident_info: Dict[str, Any], evidence_pack: Dict[str, str], camera_id: str = "Live City Camera 01") -> Dict[str, Any]:
        inc_id = uuid.uuid4()
        now = datetime.datetime.now()

        # 1. Database Persistence
        async with async_session_maker() as db:
            inc = Incident(
                id=inc_id,
                incident_type=incident_info.get("incident_type", "Vehicle Collision"),
                severity=incident_info.get("severity", "HIGH"),
                priority=incident_info.get("priority", "P1"),
                confidence=incident_info.get("confidence", 95.0),
                camera_id=camera_id,
                timestamp=now,
                status="OPEN",
                description=incident_info.get("description", "AI detected incident."),
                operator_notes="Automated AI detection dispatched to Emergency Command Center.",
                assigned_operator="System AI",
                vehicles_involved=incident_info.get("vehicles_involved", "2 Vehicles"),
                track_ids=incident_info.get("track_ids", "TRK-101, TRK-102")
            )
            db.add(inc)
            await db.commit()

            # Save Evidence Record
            ev = IncidentEvidence(
                incident_id=inc_id,
                snapshot_path=evidence_pack.get("snapshot_path", "/static/snapshots/placeholder.jpg"),
                video_clip_path=evidence_pack.get("video_clip_path", "/static/snapshots/placeholder_video.mp4")
            )
            db.add(ev)

            # Save History & Audit Log
            h1 = IncidentHistory(incident_id=inc_id, event="AI Incident Detection Confirmed", operator="System AI", timestamp=now)
            h2 = IncidentHistory(incident_id=inc_id, event="Evidence Snapshot & Video Buffer Package Saved", operator="System AI", timestamp=now)
            h3 = IncidentHistory(incident_id=inc_id, event="Telegram Bot Alert Dispatched", operator="System AI", timestamp=now)
            db.add_all([h1, h2, h3])

            audit = AuditLog(action="Incident Created", details=f"AI Incident Engine generated {inc.incident_type} (ID: {inc_id})", timestamp=now)
            db.add(audit)
            await db.commit()

        # 2. Telegram Alert Dispatch
        asyncio.create_task(
            notification_service.send_telegram_alert(
                incident_type=incident_info.get("incident_type", "Vehicle Collision"),
                severity=incident_info.get("severity", "HIGH"),
                camera_id=camera_id,
                timestamp=now.strftime("%Y-%m-%d %H:%M:%S"),
                description=incident_info.get("description", "AI Incident Detected")
            )
        )

        # 3. Payload for Real-Time WebSocket Broadcast
        payload = {
            "id": str(inc_id),
            "incident_type": incident_info.get("incident_type"),
            "severity": incident_info.get("severity"),
            "priority": incident_info.get("priority"),
            "confidence": incident_info.get("confidence"),
            "camera_id": camera_id,
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
            "status": "OPEN",
            "description": incident_info.get("description"),
            "vehicles_involved": incident_info.get("vehicles_involved"),
            "track_ids": incident_info.get("track_ids"),
            "snapshot_path": evidence_pack.get("snapshot_path"),
            "video_clip_path": evidence_pack.get("video_clip_path")
        }

        # Broadcast via WebSockets to Emergency Command Center & Dashboard
        asyncio.create_task(manager.broadcast({"type": "INCIDENT_NEW", "payload": payload}, topic="incidents"))
        asyncio.create_task(manager.broadcast({"type": "EMERGENCY_INCIDENT", "payload": payload}))

        logger.info(f"[ALERT_NOTIFIER] Dispatched {incident_info.get('incident_type')} (ID: {inc_id}) via DB, Telegram & WebSockets.")
        return payload
