import asyncio
import httpx
import websockets
import json
import time
import os

API_URL = "http://localhost:8000/api/v1"

async def verify():
    print("1. Verify FastAPI is running...")
    async with httpx.AsyncClient() as client:
        try:
            r = await client.get("http://localhost:8000/docs")
            assert r.status_code == 200
            print("   ✅ FastAPI is running")
        except Exception as e:
            print("   ❌ FastAPI failed:", e)

    print("2. Verify the login endpoint...")
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(f"{API_URL}/auth/register", json={
                "name": "Test User",
                "email": "test@example.com",
                "password": "password123"
            })
            r = await client.post(f"{API_URL}/auth/login", json={
                "email": "test@example.com",
                "password": "password123"
            })
            assert r.status_code == 200
            token = r.json()["access_token"]
            print("   ✅ Login API works")
        except Exception as e:
            print("   ❌ Login API failed:", e)

    print("3. Verify Dataset.mp4 loads...")
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(f"{API_URL}/vision/source", json={
                "type": "mp4",
                "url": "/app/Dataset.mp4",
                "name": "Demo Video",
                "id": "demo-1"
            })
            assert r.status_code == 200
            print("   ✅ Video source set to Dataset.mp4")
        except Exception as e:
            print("   ❌ Video source failed:", e)

    print("4, 5, 6, 7. Verify YOLO, ByteTrack, WebSocket, and Live Data...")
    try:
        ws_url = f"ws://localhost:8000/api/v1/ws?token={token}" if 'token' in locals() else "ws://localhost:8000/api/v1/ws"
        async with websockets.connect(ws_url) as websocket:
            print("   ✅ WebSocket connected")
            messages_received = []
            
            end_time = time.time() + 10
            while time.time() < end_time and len(messages_received) < 5:
                try:
                    msg = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    data = json.loads(msg)
                    if data.get("type") in ["TRAFFIC_STATS_UPDATE", "VEHICLE_DISTRIBUTION_UPDATE", "CAMERA_STATUS_UPDATE"]:
                        messages_received.append(data)
                        print(f"   📥 Received {data['type']}")
                except asyncio.TimeoutError:
                    continue
            
            if len(messages_received) > 0:
                print("   ✅ Real live data is streaming through WebSockets")
            else:
                print("   ❌ No live data received. YOLO/ByteTrack might have failed.")
    except Exception as e:
        print("   ❌ WebSocket failed:", e)

if __name__ == "__main__":
    asyncio.run(verify())
