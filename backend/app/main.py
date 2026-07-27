import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
from app.core.redis import redis_client
from app.api import auth_router, health_router
from app.middleware.error_handler import custom_error_handler
from app.middleware.audit_log import AuditLogMiddleware
from app.services.telemetry import broadcast_telemetry
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:80",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1",
        "http://127.0.0.1:80",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuditLogMiddleware)
app.add_exception_handler(Exception, custom_error_handler)

# Mount evidence directory
os.makedirs("/app/evidence", exist_ok=True)
app.mount("/evidence", StaticFiles(directory="/app/evidence"), name="evidence")

from app.engine.frame_manager import frame_manager
from app.engine.core import detection_engine

@app.on_event("startup")
async def startup_event():
    await redis_client.connect()
    
    # Auto-create tables and seed default admin user if not present
    try:
        from app.core.database import engine, Base, async_session_maker
        from app.models.role import Role
        from app.models.user import User
        from app.core.security import hash_password
        from sqlalchemy import select
        
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
        async with async_session_maker() as session:
            res = await session.execute(select(User).where(User.email == "admin@neuroflow.ai"))
            admin = res.scalar_one_or_none()
            if not admin:
                res_role = await session.execute(select(Role).where(Role.name == "Administrator"))
                admin_role = res_role.scalar_one_or_none()
                if not admin_role:
                    admin_role = Role(name="Administrator", description="Administrator role")
                    session.add(admin_role)
                    await session.commit()
                    await session.refresh(admin_role)
                    
                new_admin = User(
                    name="Admin",
                    email="admin@neuroflow.ai",
                    password_hash=hash_password("admin123"),
                    role_id=admin_role.id,
                    is_active=True
                )
                session.add(new_admin)
                await session.commit()
                print("[DB_SEED] Default admin user initialized: admin@neuroflow.ai / admin123", flush=True)
    except Exception as err:
        print(f"[DB_SEED_ERROR] Failed to seed database: {err}", flush=True)

    dataset_path = r"d:/placements/Smart traffic/frontend/public/Dataset.mp4"
    
    # Initialize the single unified camera source
    frame_manager.set_source({
        "type": "mp4",
        "url": dataset_path,
        "name": "Live City Dataset (Unified)",
        "id": "cam-unified"
    })
    
    # Start the unified detection pipeline background thread
    detection_engine.start()
    
    # Start mock telemetry loops for all frontend channels to preserve API
    asyncio.create_task(broadcast_telemetry("dashboard"))
    asyncio.create_task(broadcast_telemetry("incidents"))
    asyncio.create_task(broadcast_telemetry("vision"))

@app.on_event("shutdown")
async def shutdown_event():
    await redis_client.disconnect()
    await engine.dispose()

from app.api.cameras import router as cameras_router
from app.api.traffic import router as traffic_router
from app.api.vehicles import router as vehicles_router
from app.api.incidents import router as incidents_router
from app.api.predictions import router as predictions_router
from app.api.reports import router as reports_router
from app.api.notifications import router as notifications_router
from app.api.vision import router as vision_router
from app.api.ws import router as ws_router
from app.api.exports import router as exports_router
from app.api.location import router as location_router
from app.api.weather import router as weather_router
from app.api.copilot import router as copilot_router

app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(ws_router, prefix=settings.API_V1_PREFIX)
app.include_router(cameras_router, prefix=f"{settings.API_V1_PREFIX}/cameras")
app.include_router(traffic_router, prefix=f"{settings.API_V1_PREFIX}/traffic", tags=["traffic"])
app.include_router(vehicles_router, prefix=f"{settings.API_V1_PREFIX}/vehicles")
app.include_router(incidents_router, prefix=f"{settings.API_V1_PREFIX}/incidents")
app.include_router(predictions_router, prefix=settings.API_V1_PREFIX)
app.include_router(exports_router, prefix=settings.API_V1_PREFIX)
app.include_router(reports_router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications_router, prefix=settings.API_V1_PREFIX)
app.include_router(vision_router, prefix=settings.API_V1_PREFIX)
app.include_router(location_router, prefix=f"{settings.API_V1_PREFIX}/location", tags=["location"])
app.include_router(weather_router, prefix=f"{settings.API_V1_PREFIX}/weather", tags=["weather"])
app.include_router(copilot_router, prefix=f"{settings.API_V1_PREFIX}/copilot", tags=["copilot"])
