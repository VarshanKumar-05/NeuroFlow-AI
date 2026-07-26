import os

backend_dir = r'd:\placements\Smart traffic\backend'

api_code = {
    'app/api/cameras.py': '''from fastapi import APIRouter

router = APIRouter(prefix="/cameras", tags=["cameras"])

@router.get("/")
async def get_cameras():
    return {"message": "Get cameras"}
''',
    'app/api/traffic.py': '''from fastapi import APIRouter

router = APIRouter(prefix="/traffic", tags=["traffic"])

@router.get("/live")
async def get_live_traffic():
    return {"message": "Get live traffic"}
''',
    'app/api/vehicles.py': '''from fastapi import APIRouter

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

@router.get("/")
async def get_vehicles():
    return {"message": "Get vehicles"}
''',
    'app/api/incidents.py': '''from fastapi import APIRouter

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.get("/")
async def get_incidents():
    return {"message": "Get incidents"}
''',
    'app/api/predictions.py': '''from fastapi import APIRouter

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.get("/")
async def get_predictions():
    return {"message": "Get predictions"}
''',
    'app/api/reports.py': '''from fastapi import APIRouter

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/")
async def get_reports():
    return {"message": "Get reports"}
''',
    'app/api/notifications.py': '''from fastapi import APIRouter

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/")
async def get_notifications():
    return {"message": "Get notifications"}
''',
}

# Update main.py to include these routers
main_append = '''from app.api.cameras import router as cameras_router
from app.api.traffic import router as traffic_router
from app.api.vehicles import router as vehicles_router
from app.api.incidents import router as incidents_router
from app.api.predictions import router as predictions_router
from app.api.reports import router as reports_router
from app.api.notifications import router as notifications_router

app.include_router(cameras_router, prefix=settings.API_V1_PREFIX)
app.include_router(traffic_router, prefix=settings.API_V1_PREFIX)
app.include_router(vehicles_router, prefix=settings.API_V1_PREFIX)
app.include_router(incidents_router, prefix=settings.API_V1_PREFIX)
app.include_router(predictions_router, prefix=settings.API_V1_PREFIX)
app.include_router(reports_router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications_router, prefix=settings.API_V1_PREFIX)
'''

# Seed script
seed_code = {
    'app/utils/seed.py': '''import asyncio
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
'''
}

for path, content in api_code.items():
    with open(os.path.join(backend_dir, path), 'w', encoding='utf-8') as f:
        f.write(content)

for path, content in seed_code.items():
    with open(os.path.join(backend_dir, path), 'w', encoding='utf-8') as f:
        f.write(content)

# Append to main.py
with open(os.path.join(backend_dir, 'app/main.py'), 'a', encoding='utf-8') as f:
    f.write(main_append)
