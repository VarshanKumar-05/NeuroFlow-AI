import asyncio
from app.core.database import engine, Base
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.role import Role
from app.models.user import User
from app.models.camera import Camera
from app.core.security import hash_password

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def seed_data():
    print("Seeding database...")
    async with AsyncSessionLocal() as db:
        # Create roles
        admin_role = Role(name="Admin", description="Full system access")
        operator_role = Role(name="Operator", description="Camera and incident management")
        viewer_role = Role(name="Viewer", description="Read-only access")
        
        db.add_all([admin_role, operator_role, viewer_role])
        await db.commit()
        await db.refresh(admin_role)

        # Create Admin User
        admin_user = User(
            name="System Admin",
            email="admin@neuroflow.ai",
            password_hash=hash_password("admin123"),
            role_id=admin_role.id
        )
        db.add(admin_user)

        # Create some default cameras
        cam1 = Camera(name="Highway 5 North", location="Exit 42", rtsp_url="rtsp://demo:demo@ipv4/stream1", status="active", fps=30, lat=34.0522, lng=-118.2437)
        cam2 = Camera(name="Downtown Intersection", location="Main St & 5th Ave", rtsp_url="rtsp://demo:demo@ipv4/stream2", status="active", fps=30, lat=34.0482, lng=-118.2510)
        
        db.add_all([cam1, cam2])
        await db.commit()
        
        print("Successfully seeded Admin user (admin@neuroflow.ai / admin123) and 2 cameras.")

if __name__ == "__main__":
    asyncio.run(seed_data())
