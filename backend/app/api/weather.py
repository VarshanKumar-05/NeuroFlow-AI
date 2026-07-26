import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/")
async def get_weather(lat: float, lon: float):
    # Open-Meteo provides free weather data without an API key
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code,visibility"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            current = data.get("current", {})
            
            # Map WMO Weather codes to descriptions
            code = current.get("weather_code", 0)
            condition = "Clear"
            if code in [1, 2, 3]: condition = "Cloudy"
            elif code in [45, 48]: condition = "Fog"
            elif code in [51, 53, 55, 56, 57]: condition = "Drizzle"
            elif code in [61, 63, 65, 66, 67]: condition = "Rain"
            elif code in [71, 73, 75, 77]: condition = "Snow"
            elif code in [80, 81, 82]: condition = "Showers"
            elif code in [95, 96, 99]: condition = "Thunderstorm"
            
            return {
                "temperature": current.get("temperature_2m"),
                "humidity": current.get("relative_humidity_2m"),
                "rain": current.get("rain"),
                "wind_speed": current.get("wind_speed_10m"),
                "visibility": current.get("visibility"),
                "condition": condition
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather fetch failed: {str(e)}")
