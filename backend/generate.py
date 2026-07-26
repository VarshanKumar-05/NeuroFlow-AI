import os

backend_dir = r'd:\placements\Smart traffic\backend'

repo_code = {
    'app/repositories/base.py': '''from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

ModelType = TypeVar('ModelType')
CreateSchemaType = TypeVar('CreateSchemaType', bound=BaseModel)
UpdateSchemaType = TypeVar('UpdateSchemaType', bound=BaseModel)

class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get(self, db: AsyncSession, id: Any) -> Optional[ModelType]:
        result = await db.execute(select(self.model).filter(self.model.id == id))
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[ModelType]:
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return result.scalars().all()
        
    async def count(self, db: AsyncSession) -> int:
        result = await db.execute(select(func.count()).select_from(self.model))
        return result.scalar_one()

    async def create(self, db: AsyncSession, *, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, *, db_obj: ModelType, obj_in: Union[UpdateSchemaType, Dict[str, Any]]) -> ModelType:
        obj_data = {c.name: getattr(db_obj, c.name) for c in db_obj.__table__.columns}
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, *, id: Any) -> ModelType:
        obj = await self.get(db=db, id=id)
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj
''',

    'app/repositories/user_repo.py': '''from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.auth import RegisterRequest, UserUpdate
from .base import BaseRepository

class UserRepository(BaseRepository[User, RegisterRequest, UserUpdate]):
    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

user_repo = UserRepository(User)
''',

    'app/repositories/role_repo.py': '''from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.role import Role
from pydantic import BaseModel
from .base import BaseRepository

class RoleCreate(BaseModel):
    name: str
    description: str | None = None

class RoleUpdate(BaseModel):
    description: str | None = None

class RoleRepository(BaseRepository[Role, RoleCreate, RoleUpdate]):
    async def get_by_name(self, db: AsyncSession, name: str) -> Role | None:
        result = await db.execute(select(Role).filter(Role.name == name))
        return result.scalars().first()

role_repo = RoleRepository(Role)
''',

    'app/repositories/camera_repo.py': '''from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.camera import Camera
from app.schemas.camera import CameraCreate, CameraUpdate
from .base import BaseRepository

class CameraRepository(BaseRepository[Camera, CameraCreate, CameraUpdate]):
    async def get_active_cameras(self, db: AsyncSession):
        result = await db.execute(select(Camera).filter(Camera.status != 'offline'))
        return result.scalars().all()

camera_repo = CameraRepository(Camera)
''',

    'app/repositories/__init__.py': '''from .user_repo import user_repo
from .role_repo import role_repo
from .camera_repo import camera_repo
from .base import BaseRepository
'''
}

services_code = {
    'app/services/auth_service.py': '''from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.core.security import verify_password, hash_password, create_access_token, create_refresh_token
from app.repositories import user_repo, role_repo
from app.repositories.role_repo import RoleCreate
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse

class AuthService:
    async def authenticate(self, db: AsyncSession, data: LoginRequest) -> TokenResponse:
        user = await user_repo.get_by_email(db, email=data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

    async def register(self, db: AsyncSession, data: RegisterRequest) -> UserResponse:
        user = await user_repo.get_by_email(db, email=data.email)
        if user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
            
        role_name = data.role_name or "Operator"
        role = await role_repo.get_by_name(db, name=role_name)
        if not role:
            # Create default role if it doesn't exist
            role = await role_repo.create(db, obj_in=RoleCreate(name=role_name, description=f"Default {role_name} role"))
            
        hashed_password = hash_password(data.password)
        new_user = await user_repo.create(db, obj_in=RegisterRequest(
            name=data.name,
            email=data.email,
            password=hashed_password,
            role_name=role_name
        ))
        # Override the password_hash manually because the repo uses obj_in
        new_user.password_hash = hashed_password
        new_user.role_id = role.id
        await db.commit()
        await db.refresh(new_user)
        
        return UserResponse(
            id=new_user.id,
            name=new_user.name,
            email=new_user.email,
            role=role.name,
            is_active=new_user.is_active,
            created_at=new_user.created_at
        )

auth_service = AuthService()
''',
    
    'app/services/__init__.py': '''from .auth_service import auth_service
'''
}

api_code = {
    'app/middleware/error_handler.py': '''from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

async def custom_error_handler(request: Request, exc: Exception):
    logger.error(f"Error handling request {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "code": "internal_error"}
    )
''',
    'app/middleware/__init__.py': '''from .error_handler import custom_error_handler
''',

    'app/api/auth.py': '''from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import auth_service
from app.core.security import verify_token
from app.repositories import user_repo

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.register(db, data)

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.authenticate(db, data)
''',
    
    'app/api/health.py': '''from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.core.redis import get_redis
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])

@router.get("/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db), redis = Depends(get_redis)):
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"
        
    redis_status = "ok"
    try:
        await redis.get("ping")
    except Exception:
        redis_status = "error"

    return HealthResponse(
        status="ok" if db_status == "ok" and redis_status == "ok" else "error",
        database=db_status,
        redis=redis_status,
        ai_model="mock",
        version="1.0.0",
        uptime=1.0
    )
''',
    'app/api/__init__.py': '''from .auth import router as auth_router
from .health import router as health_router
''',

    'app/main.py': '''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
from app.core.redis import redis_client
from app.api import auth_router, health_router
from app.middleware.error_handler import custom_error_handler

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="NeuroFlow AI API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(Exception, custom_error_handler)

@app.on_event("startup")
async def startup_event():
    await redis_client.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await redis_client.disconnect()
    await engine.dispose()

app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(health_router)
'''
}

for path, content in {**repo_code, **services_code, **api_code}.items():
    with open(os.path.join(backend_dir, path), 'w', encoding='utf-8') as f:
        f.write(content)
