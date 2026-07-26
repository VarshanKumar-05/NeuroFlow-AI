from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional
from datetime import datetime

T = TypeVar('T')

class PaginationParams(BaseModel):
    page: int = 1
    size: int = 20

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int

class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    database: str
    redis: str
    ai_model: str
    version: str
    uptime: float
