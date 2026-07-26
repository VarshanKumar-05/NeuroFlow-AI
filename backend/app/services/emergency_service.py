import asyncio
import random
import uuid
import os
import httpx
from typing import Dict, Any, List

class EmergencyService:
    def __init__(self):
        self.bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.chat_id = os.getenv("TELEGRAM_CHAT_ID", "")
        self.hospitals = [
            {"name": "City General Hospital", "lat": 12.9716, "lng": 77.5946, "phone": "+1-555-0101"},
            {"name": "Metro Care Center", "lat": 12.9720, "lng": 77.5950, "phone": "+1-555-0102"},
            {"name": "St. Jude's Emergency", "lat": 12.9690, "lng": 77.5920, "phone": "+1-555-0103"},
            {"name": "Valley Medical Center", "lat": 12.9750, "lng": 77.5990, "phone": "+1-555-0104"},
            {"name": "Central Trauma Unit", "lat": 12.9650, "lng": 77.5900, "phone": "+1-555-0105"},
        ]

    async def send_telegram_alert(self, incident: Dict[str, Any], photo_path: str = None, video_path: str = None) -> bool:
        """Send a real Telegram alert using bot API with exponential backoff."""
        if not self.bot_token or not self.chat_id:
            print("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing. Skipping Telegram alert.")
            return False
            
        maps_link = f"https://www.google.com/maps?q={incident.get('lat')},{incident.get('lng')}"
        
        message = f"🚨 *ACCIDENT DETECTED*\n\n"
        message += f"📋 *Incident ID:* `{incident.get('id')}`\n"
        message += f"📷 *Camera:* {incident.get('cameraName')}\n"
        message += f"🕒 *Time:* {incident.get('timestamp')}\n"
        message += f"⚠️ *Severity:* {incident.get('severity').upper()}\n"
        message += f"🎯 *Confidence:* {incident.get('confidence')}%\n"
        message += f"📍 *Location:* [Google Maps]({maps_link})\n\n"
        
        if incident.get('hospitals') and len(incident.get('hospitals')) > 0:
            h = incident['hospitals'][0]
            message += f"🏥 *Nearest Hospital:* {h['name']} ({h['distance']}km, ~{h['eta']} mins)\n"
            
        url_photo = f"https://api.telegram.org/bot{self.bot_token}/sendPhoto"
        url_video = f"https://api.telegram.org/bot{self.bot_token}/sendVideo"
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient() as client:
                    data = {
                        "chat_id": self.chat_id,
                        "caption": message,
                        "parse_mode": "Markdown"
                    }
                    if photo_path and os.path.exists(photo_path):
                        with open(photo_path, "rb") as f:
                            files = {"photo": f}
                            response = await client.post(url_photo, data=data, files=files, timeout=20.0)
                    else:
                        # Fallback to sendMessage if no photo
                        send_msg_url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
                        data["text"] = message
                        data.pop("caption", None)
                        response = await client.post(send_msg_url, data=data, timeout=10.0)
                        
                    response.raise_for_status()
                    print(f"Telegram photo alert sent successfully for incident {incident.get('id')}")
                    
                    # Now send the video if available
                    if video_path and os.path.exists(video_path):
                        vid_data = {
                            "chat_id": self.chat_id,
                            "caption": f"🎥 *Evidence Clip:* `{incident.get('id')}`",
                            "parse_mode": "Markdown"
                        }
                        with open(video_path, "rb") as vf:
                            vfiles = {"video": vf}
                            v_resp = await client.post(url_video, data=vid_data, files=vfiles, timeout=60.0)
                            v_resp.raise_for_status()
                            print(f"Telegram video evidence sent successfully for {incident.get('id')}")
                    
                    return True
            except Exception as e:
                print(f"Telegram alert attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
        return False

    async def initiate_emergency_call(self, incident: Dict[str, Any], phone_number: str) -> bool:
        """Mock placing an emergency call via Twilio/Exotel."""
        await asyncio.sleep(2.0)  # Simulate network latency
        print(f"EMERGENCY CALL PLACED to {phone_number} for Incident {incident.get('id')}")
        return True

    def find_nearest_hospitals(self, lat: float, lng: float, count: int = 3) -> List[Dict[str, Any]]:
        """Mock finding the nearest hospitals."""
        # Randomly select and add mock distances and ETAs
        selected = random.sample(self.hospitals, min(count, len(self.hospitals)))
        results = []
        for h in selected:
            distance = round(random.uniform(0.5, 5.0), 1)
            eta = int(distance * 3)  # rough mock ETA
            h_copy = h.copy()
            h_copy["distance"] = distance
            h_copy["eta"] = eta
            results.append(h_copy)
            
        # Sort by distance
        results.sort(key=lambda x: x["distance"])
        return results

emergency_service = EmergencyService()
