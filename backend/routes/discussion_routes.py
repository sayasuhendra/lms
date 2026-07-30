from fastapi import APIRouter, HTTPException, status, Depends
from models import Discussion, DiscussionCreate
from auth import get_current_user
from database import (
    Discussion as DiscussionModel, Enrollment as EnrollmentModel, 
    User as UserModel, AsyncSessionLocal, generate_id, serialize_doc
)
from sqlalchemy import select, desc
from datetime import datetime

router = APIRouter(prefix="/discussions", tags=["Discussions"])

@router.get("/course/{course_id}", response_model=dict)
async def get_discussions(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all discussions for a course."""
    async with AsyncSessionLocal() as session:
        # Check if user is enrolled
        enrollment_result = await session.execute(
            select(EnrollmentModel).where(
                EnrollmentModel.user_id == current_user["id"],
                EnrollmentModel.course_id == course_id
            )
        )
        enrollment = enrollment_result.scalar_one_or_none()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enrolled in this course"
            )
        
        result = await session.execute(
            select(DiscussionModel)
            .where(DiscussionModel.course_id == course_id)
            .order_by(desc(DiscussionModel.created_at))
            .limit(100)
        )
        discussions = result.scalars().all()
        
        return {"discussions": [serialize_doc(d) for d in discussions]}

@router.post("", response_model=dict)
async def create_discussion(
    discussion_data: DiscussionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new discussion post."""
    async with AsyncSessionLocal() as session:
        # Check if user is enrolled
        enrollment_result = await session.execute(
            select(EnrollmentModel).where(
                EnrollmentModel.user_id == current_user["id"],
                EnrollmentModel.course_id == discussion_data.course_id
            )
        )
        enrollment = enrollment_result.scalar_one_or_none()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enrolled in this course"
            )
        
        # Get user info
        user_result = await session.execute(
            select(UserModel).where(UserModel.id == current_user["id"])
        )
        user = user_result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        discussion_id = generate_id()
        
        new_discussion = DiscussionModel(
            id=discussion_id,
            course_id=discussion_data.course_id,
            user_id=current_user["id"],
            user_name=user.name,
            user_avatar=user.avatar,
            title=discussion_data.title,
            content=discussion_data.content,
            category=discussion_data.category or "General",
            replies=0,
            likes=0,
            created_at=datetime.utcnow()
        )
        
        session.add(new_discussion)
        await session.commit()
        await session.refresh(new_discussion)
        
        return {"discussion": serialize_doc(new_discussion)}

@router.put("/{discussion_id}/like", response_model=dict)
async def like_discussion(
    discussion_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Like a discussion post."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(DiscussionModel).where(DiscussionModel.id == discussion_id)
        )
        discussion = result.scalar_one_or_none()
        if not discussion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Discussion not found"
            )
        
        discussion.likes += 1
        await session.commit()
        await session.refresh(discussion)
        
        return {"discussion": serialize_doc(discussion)}
