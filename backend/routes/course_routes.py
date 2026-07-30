from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from models import Course, CourseCreate
from auth import get_current_user, get_current_instructor
from database import (
    Course as CourseModel, User as UserModel, AsyncSessionLocal, 
    generate_id, serialize_doc
)
from sqlalchemy import select, or_, desc
from sqlalchemy.orm import selectinload
from datetime import datetime

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("", response_model=dict)
async def get_courses(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    sort: Optional[str] = Query("popular")
):
    """Get all courses with optional filters."""
    async with AsyncSessionLocal() as session:
        query = select(CourseModel).options(selectinload(CourseModel.instructor))
        
        # Apply filters
        if search:
            search_filter = or_(
                CourseModel.title.ilike(f"%{search}%"),
                CourseModel.description.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
        
        if category:
            query = query.where(CourseModel.category == category)
        
        if level:
            query = query.where(CourseModel.level == level)
        
        # Apply sorting
        if sort == "popular":
            query = query.order_by(desc(CourseModel.students))
        elif sort == "rating":
            query = query.order_by(desc(CourseModel.rating))
        elif sort == "newest":
            query = query.order_by(desc(CourseModel.created_at))
        
        result = await session.execute(query)
        courses = result.scalars().all()
        
        # Serialize courses with instructor info
        courses_list = []
        for course in courses:
            course_dict = serialize_doc(course)
            # Add instructor info
            if course.instructor:
                course_dict["instructor"] = {
                    "id": str(course.instructor.id),
                    "name": course.instructor.name,
                    "email": course.instructor.email,
                    "avatar": course.instructor.avatar,
                    "bio": course.instructor.bio,
                    "expertise": course.instructor.expertise
                }
            courses_list.append(course_dict)
        
        return {"courses": courses_list}

@router.get("/{course_id}", response_model=dict)
async def get_course(course_id: str):
    """Get a single course by ID."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(CourseModel)
            .options(selectinload(CourseModel.instructor))
            .where(CourseModel.id == course_id)
        )
        course = result.scalar_one_or_none()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        course_dict = serialize_doc(course)
        # Add instructor info
        if course.instructor:
            course_dict["instructor"] = {
                "id": str(course.instructor.id),
                "name": course.instructor.name,
                "email": course.instructor.email,
                "avatar": course.instructor.avatar,
                "bio": course.instructor.bio,
                "expertise": course.instructor.expertise
            }
        
        return {"course": course_dict}

@router.post("", response_model=dict)
async def create_course(
    course_data: CourseCreate,
    current_user: dict = Depends(get_current_instructor)
):
    """Create a new course (instructor only)."""
    async with AsyncSessionLocal() as session:
        # Get instructor info
        result = await session.execute(
            select(UserModel).where(UserModel.id == current_user["id"])
        )
        instructor = result.scalar_one_or_none()
        if not instructor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Instructor not found"
            )
        
        course_id = generate_id()
        
        new_course = CourseModel(
            id=course_id,
            title=course_data.title,
            description=course_data.description,
            long_description=course_data.long_description or course_data.description,
            instructor_id=current_user["id"],
            category=course_data.category,
            level=course_data.level.value if hasattr(course_data.level, 'value') else course_data.level,
            thumbnail=course_data.thumbnail or "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
            duration=course_data.duration,
            language=course_data.language,
            rating=0.0,
            reviews=0,
            students=0,
            price=0.0,
            skills=course_data.skills or [],
            subtitles=course_data.subtitles or [],
            curriculum=[],
            created_at=datetime.utcnow()
        )
        
        session.add(new_course)
        await session.commit()
        await session.refresh(new_course)
        
        # Serialize with instructor info
        course_dict = serialize_doc(new_course)
        course_dict["instructor"] = {
            "id": str(instructor.id),
            "name": instructor.name,
            "email": instructor.email,
            "avatar": instructor.avatar,
            "bio": instructor.bio,
            "expertise": instructor.expertise
        }
        
        return {"course": course_dict}

@router.get("/instructor/my-courses", response_model=dict)
async def get_instructor_courses(current_user: dict = Depends(get_current_instructor)):
    """Get courses created by the current instructor."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(CourseModel)
            .options(selectinload(CourseModel.instructor))
            .where(CourseModel.instructor_id == current_user["id"])
            .order_by(desc(CourseModel.created_at))
        )
        courses = result.scalars().all()
        
        courses_list = []
        for course in courses:
            course_dict = serialize_doc(course)
            if course.instructor:
                course_dict["instructor"] = {
                    "id": str(course.instructor.id),
                    "name": course.instructor.name,
                    "email": course.instructor.email,
                    "avatar": course.instructor.avatar,
                    "bio": course.instructor.bio,
                    "expertise": course.instructor.expertise
                }
            courses_list.append(course_dict)
        
        return {"courses": courses_list}

@router.put("/{course_id}", response_model=dict)
async def update_course(
    course_id: str,
    course_data: CourseCreate,
    current_user: dict = Depends(get_current_instructor)
):
    """Update a course (instructor only, own courses only)."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(CourseModel)
            .options(selectinload(CourseModel.instructor))
            .where(CourseModel.id == course_id)
        )
        course = result.scalar_one_or_none()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        if course.instructor_id != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this course"
            )
        
        # Update fields
        course.title = course_data.title
        course.description = course_data.description
        course.long_description = course_data.long_description
        if course_data.thumbnail:
            course.thumbnail = course_data.thumbnail
        course.category = course_data.category
        course.level = course_data.level.value if hasattr(course_data.level, 'value') else course_data.level
        course.duration = course_data.duration
        course.skills = course_data.skills or []
        course.language = course_data.language
        course.subtitles = course_data.subtitles or []
        
        await session.commit()
        await session.refresh(course)
        
        course_dict = serialize_doc(course)
        if course.instructor:
            course_dict["instructor"] = {
                "id": str(course.instructor.id),
                "name": course.instructor.name,
                "email": course.instructor.email,
                "avatar": course.instructor.avatar,
                "bio": course.instructor.bio,
                "expertise": course.instructor.expertise
            }
        
        return {"course": course_dict}

@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    current_user: dict = Depends(get_current_instructor)
):
    """Delete a course (instructor only, own courses only)."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(CourseModel).where(CourseModel.id == course_id)
        )
        course = result.scalar_one_or_none()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        if course.instructor_id != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this course"
            )
        
        await session.delete(course)
        await session.commit()
        
        return {"message": "Course deleted successfully"}
