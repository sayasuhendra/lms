from fastapi import APIRouter, HTTPException, status, Depends
from models import UserCreate, UserLogin, User, UserResponse
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from database import User, AsyncSessionLocal, generate_id, serialize_doc
from sqlalchemy import select
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register a new user."""
    async with AsyncSessionLocal() as session:
        # Check if user already exists
        result = await session.execute(
            select(User).where(User.email == user_data.email)
        )
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user_id = generate_id()
        hashed_password = get_password_hash(user_data.password)
        
        new_user = User(
            id=user_id,
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed_password,
            role=user_data.role.value if hasattr(user_data.role, 'value') else user_data.role,
            avatar=user_data.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.name}",
            bio=user_data.bio or "",
            expertise=user_data.expertise or "",
            created_at=datetime.utcnow()
        )
        
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        
        # Create access token
        token_data = {"sub": user_id, "email": user_data.email, "role": new_user.role}
        token = create_access_token(token_data)
        
        # Serialize user (exclude password)
        user_dict = serialize_doc(new_user)
        user_dict.pop("hashed_password", None)
        
        return {
            "success": True,
            "user": user_dict,
            "token": token
        }

@router.post("/login", response_model=UserResponse)
async def login(credentials: UserLogin):
    """Login user."""
    async with AsyncSessionLocal() as session:
        # Find user
        result = await session.execute(
            select(User).where(User.email == credentials.email)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
        token = create_access_token(token_data)
        
        # Serialize user (exclude password)
        user_dict = serialize_doc(user)
        user_dict.pop("hashed_password", None)
        
        return {
            "success": True,
            "user": user_dict,
            "token": token
        }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user information."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.id == current_user["id"])
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_dict = serialize_doc(user)
        user_dict.pop("hashed_password", None)
        return {"user": user_dict}
