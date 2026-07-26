from sqlalchemy.ext.asyncio import AsyncSession
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
        class _UserCreate(RegisterRequest):
            password_hash: str
            role_id: str
        
        # We bypass the repo's obj_in directly
        from app.models.user import User
        db_obj = User(
            name=data.name,
            email=data.email,
            password_hash=hashed_password,
            role_id=role.id,
            is_active=True
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        new_user = db_obj
        
        return UserResponse(
            id=new_user.id,
            name=new_user.name,
            email=new_user.email,
            role=role.name,
            is_active=new_user.is_active,
            created_at=new_user.created_at
        )

auth_service = AuthService()
