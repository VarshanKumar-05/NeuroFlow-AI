import asyncio
import random
from app.core.websocket_manager import manager
from app.services.video_source import video_managers

# We no longer run ML in the background. 
# This file returns to its original purpose: generating lightweight, mock telemetry 
# for the dashboard so the frontend UI stays compatible.

async def simulate_traffic_data(channel: str = "dashboard"):
    """
    Lightweight mock telemetry broadcaster.
    Requires exactly zero GPU/CPU compute, allowing Live Vision to run at maximum speed.
    """
    video_manager = video_managers.get_manager(channel)
    base_vehicles = 0
    
    while True:
        try:
            # Broadcast at 1 FPS
            await asyncio.sleep(1.0)
            
            cam_status = video_manager.get_status()
            is_online = cam_status.get("connected", False)
            
            # Simulate a realistic growing vehicle count
            if is_online:
                base_vehicles += random.randint(0, 3)
            
            await manager.broadcast({
                "type": "CAMERA_STATUS_UPDATE",
                "channel": channel,
                "payload": [
                    { 
                        "id": cam_status.get("name", "cam-1"), 
                        "name": cam_status.get("name", "Unknown"), 
                        "fps": cam_status.get("fps", 0), 
                        "latency": cam_status.get("latency", 0), 
                        "vehicles": base_vehicles, 
                        "status": 'online' if is_online else 'offline',
                        "thumb": cam_status.get("url", ""),
                        "type": cam_status.get("type", ""),
                        "resolution": cam_status.get("resolution", ""),
                        "channel": channel
                    }
                ]
            })
            
            if channel == "dashboard" and is_online:
                await manager.broadcast({
                    "type": "TRAFFIC_STATS_UPDATE",
                    "channel": channel,
                    "payload": {
                        "totalVehicles": base_vehicles,
                        "totalVehiclesTrend": 0.5,
                        "avgSpeed": random.uniform(40, 55),
                        "avgSpeedTrend": -0.2,
                        "congestionScore": min(100, int((base_vehicles / 100) * 10)),
                        "congestionTrend": 1.2,
                        "activeIncidents": 0
                    }
                })
                
                await manager.broadcast({
                    "type": "VEHICLE_DISTRIBUTION_UPDATE",
                    "channel": channel,
                    "payload": [
                        { "name": 'Cars', "value": random.randint(60, 80), "color": '#00E5FF', "icon": "Car" },
                        { "name": 'Bus', "value": random.randint(5, 15), "color": '#3B82F6', "icon": "Bus" },
                        { "name": 'Truck', "value": random.randint(5, 15), "color": '#F59E0B', "icon": "Truck" },
                        { "name": 'Bike', "value": random.randint(5, 15), "color": '#10B981', "icon": "Bike" },
                    ]
                })

        except Exception as e:
            print(f"WS broadcast error: {e}")
            await asyncio.sleep(2)
