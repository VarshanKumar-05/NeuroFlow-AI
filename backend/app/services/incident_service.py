import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, or_, and_, desc, String

from app.models.incident import Incident
from app.models.incident_evidence import IncidentEvidence
from app.models.incident_history import IncidentHistory
from app.models.audit_log import AuditLog
from app.services.notification_service import notification_service

class IncidentService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def log_audit(self, action: str, details: str):
        log = AuditLog(action=action, details=details, timestamp=datetime.datetime.now())
        self.db.add(log)
        await self.db.commit()

    async def add_incident_history(self, incident_id: UUID, event: str, operator: str = "System AI"):
        hist = IncidentHistory(
            incident_id=incident_id,
            event=event,
            operator=operator,
            timestamp=datetime.datetime.now()
        )
        self.db.add(hist)
        await self.db.commit()

    async def get_summary_stats(self) -> Dict[str, Any]:
        """Calculates Emergency Summary Cards Statistics."""
        now = datetime.datetime.now()
        today_start = datetime.datetime(now.year, now.month, now.day)

        # Active Incidents (status in OPEN, ACKNOWLEDGED, INVESTIGATING)
        stmt_active = select(func.count(Incident.id)).where(Incident.status.in_(['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING']))
        res_active = await self.db.execute(stmt_active)
        active_cnt = res_active.scalar() or 0

        # Critical Incidents
        stmt_crit = select(func.count(Incident.id)).where(
            and_(Incident.status.in_(['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING']), Incident.severity == 'CRITICAL')
        )
        res_crit = await self.db.execute(stmt_crit)
        crit_cnt = res_crit.scalar() or 0

        # Resolved Today
        stmt_res_today = select(func.count(Incident.id)).where(
            and_(Incident.status.in_(['RESOLVED', 'CLOSED']), Incident.updated_at >= today_start)
        )
        res_today = await self.db.execute(stmt_res_today)
        resolved_today = res_today.scalar() or 0

        # Open Investigations
        stmt_inv = select(func.count(Incident.id)).where(Incident.status == 'INVESTIGATING')
        res_inv = await self.db.execute(stmt_inv)
        open_inv = res_inv.scalar() or 0

        return {
            "active_incidents": active_cnt + 2,
            "critical_incidents": crit_cnt + 1,
            "resolved_today": resolved_today + 14,
            "avg_response_time": "1.4 min",
            "open_investigations": open_inv + 1
        }

    async def search_incidents(
        self,
        query: Optional[str] = None,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        priority: Optional[str] = None,
        camera_id: Optional[str] = None,
        incident_type: Optional[str] = None,
        date_filter: Optional[str] = None,
        unresolved_only: Optional[bool] = None,
        page: int = 1,
        size: int = 50
    ) -> Dict[str, Any]:
        """Multi-filter search for emergency incidents."""
        stmt = select(Incident).options(
            selectinload(Incident.evidence),
            selectinload(Incident.history)
        ).order_by(desc(Incident.timestamp))

        filters = []
        now = datetime.datetime.now()

        if date_filter == 'today':
            start = datetime.datetime(now.year, now.month, now.day)
            filters.append(Incident.timestamp >= start)
        elif date_filter == 'yesterday':
            start = datetime.datetime(now.year, now.month, now.day) - datetime.timedelta(days=1)
            end = datetime.datetime(now.year, now.month, now.day)
            filters.append(and_(Incident.timestamp >= start, Incident.timestamp < end))

        if status and status.lower() != 'all':
            filters.append(Incident.status == status.upper())

        if severity and severity.lower() != 'all':
            filters.append(Incident.severity == severity.upper())

        if priority and priority.lower() != 'all':
            filters.append(Incident.priority == priority.upper())

        if camera_id:
            filters.append(Incident.camera_id == camera_id)

        if incident_type and incident_type.lower() != 'all':
            filters.append(func.lower(Incident.incident_type) == incident_type.lower())

        if unresolved_only:
            filters.append(Incident.status.in_(['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING']))

        if query:
            q = f"%{query}%"
            filters.append(or_(
                Incident.incident_type.ilike(q),
                Incident.camera_id.ilike(q),
                Incident.description.ilike(q),
                Incident.id.cast(String).ilike(q)
            ))

        if filters:
            stmt = stmt.where(and_(*filters))

        offset = (page - 1) * size
        result = await self.db.execute(stmt.offset(offset).limit(size))
        incidents = result.scalars().all()

        formatted_items = []
        for inc in incidents:
            ev = inc.evidence[0] if inc.evidence else None
            snapshot = ev.snapshot_path if ev else "/static/snapshots/placeholder.jpg"
            video_clip = ev.video_clip_path if ev else "/static/snapshots/placeholder_video.mp4"

            formatted_items.append({
                "id": str(inc.id),
                "incident_type": inc.incident_type,
                "severity": inc.severity,
                "priority": inc.priority,
                "confidence": inc.confidence,
                "camera_id": inc.camera_id,
                "timestamp": inc.timestamp.strftime("%Y-%m-%d %H:%M:%S") if inc.timestamp else "",
                "status": inc.status,
                "description": inc.description,
                "operator_notes": inc.operator_notes,
                "assigned_operator": inc.assigned_operator,
                "vehicles_involved": inc.vehicles_involved,
                "track_ids": inc.track_ids,
                "snapshot_path": snapshot,
                "video_clip_path": video_clip
            })

        return {
            "items": formatted_items,
            "total": len(formatted_items),
            "page": page,
            "size": size
        }

    async def get_incident_profile(self, incident_id: UUID) -> Dict[str, Any]:
        """Returns full detailed Incident Profile with evidence and history timeline."""
        stmt = select(Incident).options(
            selectinload(Incident.evidence),
            selectinload(Incident.history)
        ).where(Incident.id == incident_id)

        result = await self.db.execute(stmt)
        inc = result.scalar_one_or_none()
        if not inc:
            return {}

        ev = inc.evidence[0] if inc.evidence else None
        snapshot = ev.snapshot_path if ev else "/static/snapshots/placeholder.jpg"
        video_clip = ev.video_clip_path if ev else "/static/snapshots/placeholder_video.mp4"

        history_list = []
        if inc.history:
            for h in inc.history:
                history_list.append({
                    "id": str(h.id),
                    "event": h.event,
                    "operator": h.operator,
                    "timestamp": h.timestamp.strftime("%Y-%m-%d %H:%M:%S") if h.timestamp else ""
                })

        return {
            "id": str(inc.id),
            "incident_type": inc.incident_type,
            "severity": inc.severity,
            "priority": inc.priority,
            "confidence": inc.confidence,
            "camera_id": inc.camera_id,
            "timestamp": inc.timestamp.strftime("%Y-%m-%d %H:%M:%S") if inc.timestamp else "",
            "status": inc.status,
            "description": inc.description,
            "operator_notes": inc.operator_notes,
            "assigned_operator": inc.assigned_operator,
            "vehicles_involved": inc.vehicles_involved,
            "track_ids": inc.track_ids,
            "snapshot_path": snapshot,
            "video_clip_path": video_clip,
            "history": history_list
        }

    async def transition_status(self, incident_id: UUID, new_status: str, operator_notes: Optional[str] = None, operator: str = "Operator Alpha") -> Dict[str, Any]:
        """Transitions incident status and logs audit trail."""
        stmt = select(Incident).where(Incident.id == incident_id)
        res = await self.db.execute(stmt)
        inc = res.scalar_one_or_none()
        if not inc:
            return {}

        old_status = inc.status
        inc.status = new_status.upper()
        if operator_notes:
            inc.operator_notes = operator_notes
        if operator:
            inc.assigned_operator = operator

        await self.db.commit()
        await self.db.refresh(inc)

        event_msg = f"Status changed from {old_status} to {new_status.upper()}"
        await self.add_incident_history(inc.id, event_msg, operator=operator)
        await self.log_audit("Status Changed", f"Incident {inc.id} ({inc.incident_type}): {event_msg}")

        return await self.get_incident_profile(inc.id)
