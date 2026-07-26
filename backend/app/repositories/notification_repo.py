"""
Notification repository with unread / mark-read operations.
"""

from typing import Sequence
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    """Data access layer for Notification entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Notification, db)

    async def get_unread(
        self, user_id: UUID, skip: int = 0, limit: int = 50
    ) -> Sequence[Notification]:
        """Return unread notifications for a user."""
        result = await self._db.execute(
            select(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)  # noqa: E712
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def mark_read(self, notification_id: UUID) -> bool:
        """Mark a single notification as read. Returns True if found."""
        result = await self._db.execute(
            update(Notification)
            .where(Notification.id == notification_id)
            .values(is_read=True)
        )
        await self._db.flush()
        return result.rowcount > 0  # type: ignore[union-attr]

    async def mark_all_read(self, user_id: UUID) -> int:
        """Mark all notifications for a user as read. Returns count updated."""
        result = await self._db.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)  # noqa: E712
            .values(is_read=True)
        )
        await self._db.flush()
        return result.rowcount  # type: ignore[union-attr]
