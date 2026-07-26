from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.role import Role
from pydantic import BaseModel
from .base import BaseRepository

class RoleCreate(BaseModel):
    name: str
    description: str | None = None

class RoleUpdate(BaseModel):
    description: str | None = None

class RoleRepository(BaseRepository[Role, RoleCreate, RoleUpdate]):
    async def get_by_name(self, db: AsyncSession, name: str) -> Role | None:
        result = await db.execute(select(Role).filter(Role.name == name))
        return result.scalars().first()

role_repo = RoleRepository(Role)
