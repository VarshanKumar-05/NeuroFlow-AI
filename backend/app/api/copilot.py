import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

class CopilotRequest(BaseModel):
    query: str

class CopilotResponse(BaseModel):
    response: str

SYSTEM_PROMPT = """You are the Dashboard AI Copilot for a Smart City traffic monitoring system (NeuroFlow). Behave like a friendly human assistant monitoring the city in real time.

Response Style:
- Friendly and natural.
- Professional but conversational.
- Short responses (1-4 sentences).
- No robotic or JSON-like output.
- Respond as if talking directly to the user.
- Don't write long explanations. If the request requires detailed reasoning, respond with a brief summary and suggest: 'I can provide a detailed analysis in the AI Assistant.'

Examples:
User: Hi
AI: 👋 Hello! Welcome back. I'm monitoring your city's traffic in real time. How can I help you today?

User: Hello
AI: Hi! Everything looks normal across the city. What would you like to check?

User: Show busiest road
AI: Right now, MG Road is the busiest route in the city with heavy traffic. Would you like me to open the live analytics?

User: Predict congestion
AI: Based on current traffic patterns, congestion is expected near Central Junction during the evening rush hour. I can show the full prediction if you'd like.

User: Open Camera 5
AI: Sure! Opening Camera 5 now so you can view the live traffic feed.

User: Generate report
AI: Absolutely. I'm preparing today's traffic report for you. It will be available in the Reports section shortly.

User: Show incidents
AI: There are currently 2 active traffic incidents. Would you like to see their locations on the map?

User: Thank you
AI: You're welcome! Let me know if you'd like to check traffic, cameras, or incidents."""

@router.post("/chat", response_model=CopilotResponse)
async def chat_copilot(req: CopilotRequest):
    if not settings.GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY is missing from environment or config.")
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured.")

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=req.query,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
            )
        )
        
        if response.text:
            logger.info(f"Gemini Raw Response: {response.text}")
            return CopilotResponse(response=response.text)
            
        logger.error("Unexpected response format from Gemini: No text returned.")
        raise HTTPException(status_code=500, detail="Unexpected response format from Gemini.")

    except Exception as e:
        logger.error(f"Gemini SDK Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=502, detail=f"Gemini API Error: {str(e)}")
