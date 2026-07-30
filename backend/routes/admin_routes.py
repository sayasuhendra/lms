from fastapi import APIRouter, HTTPException, status, Depends, Query
from models import User, UserRole
from auth import get_current_admin
from database import (
    User as UserModel, Course, Enrollment, AsyncSessionLocal, 
    serialize_doc, generate_id
)
from auth import get_password_hash
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users")
async def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_admin)
):
    """Get all users with pagination and filters."""
    async with AsyncSessionLocal() as session:
        # Build query
        query = select(UserModel)
        
        if role:
            query = query.where(UserModel.role == role)
        
        if search:
            search_filter = or_(
                UserModel.name.ilike(f"%{search}%"),
                UserModel.email.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
        
        # Get total count
        count_query = select(func.count()).select_from(UserModel)
        if role:
            count_query = count_query.where(UserModel.role == role)
        if search:
            search_filter = or_(
                UserModel.name.ilike(f"%{search}%"),
                UserModel.email.ilike(f"%{search}%")
            )
            count_query = count_query.where(search_filter)
        
        total_result = await session.execute(count_query)
        total = total_result.scalar()
        
        # Get users with pagination
        skip = (page - 1) * limit
        query = query.order_by(UserModel.created_at.desc()).offset(skip).limit(limit)
        
        result = await session.execute(query)
        users = result.scalars().all()
        
        # Serialize users (remove password)
        users_list = []
        for user in users:
            user_dict = serialize_doc(user)
            user_dict.pop("hashed_password", None)
            users_list.append(user_dict)
        
        return {
            "users": users_list,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if total > 0 else 0
        }

@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """Get detailed user information including enrollments."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user enrollments with course info
        enrollments_result = await session.execute(
            select(Enrollment, Course)
            .join(Course, Enrollment.course_id == Course.id)
            .where(Enrollment.user_id == user_id)
        )
        enrollments_data = enrollments_result.all()
        
        enrollment_details = []
        for enrollment, course in enrollments_data:
            enrollment_details.append({
                "enrollment_id": str(enrollment.id),
                "course_title": course.title,
                "progress": enrollment.progress,
                "enrolled_date": enrollment.enrolled_date.isoformat() if enrollment.enrolled_date else None,
                "completed": enrollment.completed
            })
        
        user_dict = serialize_doc(user)
        user_dict.pop("hashed_password", None)
        
        return {
            "user": user_dict,
            "enrollments": enrollment_details,
            "total_enrollments": len(enrollment_details)
        }

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: str = Query(..., description="New role for the user"),
    current_user: dict = Depends(get_current_admin)
):
    """Update user role."""
    # Validate role
    valid_roles = ["student", "instructor", "admin"]
    if new_role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # Prevent admin from removing their own admin role
    if user_id == current_user["id"] and new_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove your own admin role"
        )
    
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.role = new_role
        await session.commit()
        await session.refresh(user)
        
        user_dict = serialize_doc(user)
        user_dict.pop("hashed_password", None)
        
        return {
            "message": "User role updated successfully",
            "user": user_dict
        }

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """Delete a user."""
    # Prevent admin from deleting themselves
    if user_id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Delete user (cascade will handle enrollments and certificates)
        await session.delete(user)
        await session.commit()
        
        return {
            "message": "User deleted successfully"
        }

@router.post("/users")
async def create_user(
    name: str = Query(..., description="User name"),
    email: str = Query(..., description="User email"),
    password: str = Query(..., description="User password"),
    role: str = Query("student", description="User role"),
    current_user: dict = Depends(get_current_admin)
):
    """Create a new user (admin only)."""
    # Validate role
    valid_roles = ["student", "instructor", "admin"]
    if role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    async with AsyncSessionLocal() as session:
        # Check if user already exists
        result = await session.execute(
            select(UserModel).where(UserModel.email == email)
        )
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user_id = generate_id()
        hashed_password = get_password_hash(password)
        
        new_user = UserModel(
            id=user_id,
            name=name,
            email=email,
            hashed_password=hashed_password,
            role=role,
            avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={name}",
            bio="",
            expertise="",
            created_at=datetime.utcnow()
        )
        
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        
        user_dict = serialize_doc(new_user)
        user_dict.pop("hashed_password", None)
        
        return {
            "message": "User created successfully",
            "user": user_dict
        }

@router.get("/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_admin)):
    """Get admin dashboard statistics."""
    async with AsyncSessionLocal() as session:
        # Count users by role
        total_users_result = await session.execute(select(func.count(UserModel.id)))
        total_users = total_users_result.scalar()
        
        total_students_result = await session.execute(
            select(func.count(UserModel.id)).where(UserModel.role == "student")
        )
        total_students = total_students_result.scalar()
        
        total_instructors_result = await session.execute(
            select(func.count(UserModel.id)).where(UserModel.role == "instructor")
        )
        total_instructors = total_instructors_result.scalar()
        
        total_admins_result = await session.execute(
            select(func.count(UserModel.id)).where(UserModel.role == "admin")
        )
        total_admins = total_admins_result.scalar()
        
        # Count courses
        total_courses_result = await session.execute(select(func.count(Course.id)))
        total_courses = total_courses_result.scalar()
        
        # Count enrollments
        total_enrollments_result = await session.execute(select(func.count(Enrollment.id)))
        total_enrollments = total_enrollments_result.scalar()
        
        # Get recent users (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_users_result = await session.execute(
            select(func.count(UserModel.id)).where(UserModel.created_at >= seven_days_ago)
        )
        recent_users = recent_users_result.scalar()
        
        return {
            "users": {
                "total": total_users,
                "students": total_students,
                "instructors": total_instructors,
                "admins": total_admins,
                "recent": recent_users
            },
            "courses": {
                "total": total_courses
            },
            "enrollments": {
                "total": total_enrollments
            }
        }
