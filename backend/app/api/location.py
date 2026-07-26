import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/reverse")
async def reverse_geocode(lat: float, lon: float):
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
    headers = {
        "User-Agent": "NeuroFlowAI/1.0 (contact@example.com)"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            address = data.get("address", {})
            city = address.get("city") or address.get("town") or address.get("village") or "Unknown City"
            state = address.get("state") or address.get("region") or ""
            country = address.get("country") or ""
            
            return {
                "city": city,
                "state": state,
                "country": country,
                "display_name": data.get("display_name", "")
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geocoding failed: {str(e)}")
