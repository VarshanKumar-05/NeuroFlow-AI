import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
from app.core.redis import redis_client
from app.api import auth_router, health_router
from app.middleware.error_handler import custom_error_handler
from app.middleware.audit_log import AuditLogMiddleware
from app.services.data_simulator import simulate_traffic_data
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.add_middleware(AuditLogMiddleware)
app.add_exception_handler(Exception, custom_error_handler)

# Mount evidence directory
os.makedirs("/app/evidence", exist_ok=True)
app.mount("/evidence", StaticFiles(directory="/app/evidence"), name="evidence")

from app.services.video_source import video_managers

@app.on_event("startup")
async def startup_event():
    await redis_client.connect()
    dataset_path = r"d:/placements/Smart traffic/frontend/public/Dataset.mp4"
    
    # Initialize all pipelines with the default dataset initially
    for channel in ["dashboard", "incidents", "vision"]:
        video_managers.get_manager(channel).set_source({
            "type": "mp4",
            "url": dataset_path,
            "name": f"Live City Dataset ({channel.capitalize()})",
            "id": f"cam-{channel}"
        })
        # Start the background loop to push stats and process vision pipeline for each channel
        asyncio.create_task(simulate_traffic_data(channel))

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
