from fastapi import APIRouter, HTTPException, status, Depends
from models import ProfileUpdate, User
from auth import get_current_user
from database import User, AsyncSessionLocal, serialize_doc
from sqlalchemy import select

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/profile", response_model=dict)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile."""
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

@router.put("/profile", response_model=dict)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile."""
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
        
        # Update fields
        if profile_data.name is not None:
            user.name = profile_data.name
        if profile_data.bio is not None:
            user.bio = profile_data.bio
        if profile_data.expertise is not None:
            user.expertise = profile_data.expertise
        
        await session.commit()
        await session.refresh(user)
        
        user_dict = serialize_doc(user)
        user_dict.pop("hashed_password", None)
        
        return {"user": user_dict}

@router.get("/{user_id}", response_model=dict)
async def get_user(user_id: str):
    """Get user by ID (public info only)."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_dict = serialize_doc(user)
        # Remove sensitive data
        user_dict.pop("hashed_password", None)
        user_dict.pop("email", None)
        
        return {"user": user_dict}
