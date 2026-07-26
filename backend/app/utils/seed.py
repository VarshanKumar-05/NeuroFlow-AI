import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session_maker
from app.models.role import Role
from app.models.user import User
from app.core.security import hash_password
import uuid

async def seed_data():
    async with async_session_maker() as session:
        # Create roles
        roles = ['Administrator', 'Operator', 'Analyst', 'Research']
        role_objs = {}
        for role_name in roles:
            role = Role(name=role_name, description=f"{role_name} role")
            session.add(role)
            role_objs[role_name] = role
        await session.commit()
        
        # Create admin user
        for role_name in roles:
            await session.refresh(role_objs[role_name])
            
        admin_user = User(
            name="Admin",
            email="admin@neuroflow.ai",
            password_hash=hash_password("admin123"),
            role_id=role_objs['Administrator'].id
        )
        session.add(admin_user)
        await session.commit()
        
        print("Database seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
