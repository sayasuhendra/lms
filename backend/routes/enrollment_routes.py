from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models import EnrollmentCreate, Enrollment, EnrollmentWithCourse, ProgressUpdate
from auth import get_current_user
from database import (
    Enrollment as EnrollmentModel, Course as CourseModel, 
    AsyncSessionLocal, generate_id, serialize_doc
)
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])

@router.post("", response_model=dict)
async def create_enrollment(
    enrollment_data: EnrollmentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Enroll in a course."""
    async with AsyncSessionLocal() as session:
        # Check if course exists
        result = await session.execute(
            select(CourseModel).where(CourseModel.id == enrollment_data.course_id)
        )
        course = result.scalar_one_or_none()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Check if already enrolled
        existing_result = await session.execute(
            select(EnrollmentModel).where(
                EnrollmentModel.user_id == current_user["id"],
                EnrollmentModel.course_id == enrollment_data.course_id
            )
        )
        existing = existing_result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already enrolled in this course"
            )
        
        enrollment_id = generate_id()
        
        new_enrollment = EnrollmentModel(
            id=enrollment_id,
            user_id=current_user["id"],
            course_id=enrollment_data.course_id,
            enrolled_date=datetime.utcnow(),
            progress=0.0,
            last_accessed=datetime.utcnow(),
            completed=False,
            completed_lessons=[]
        )
        
        session.add(new_enrollment)
        
        # Increment student count
        course.students += 1
        await session.commit()
        await session.refresh(new_enrollment)
        
        return {"enrollment": serialize_doc(new_enrollment)}

@router.get("", response_model=dict)
async def get_enrollments(current_user: dict = Depends(get_current_user)):
    """Get all enrollments for the current user."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(EnrollmentModel, CourseModel)
            .join(CourseModel, EnrollmentModel.course_id == CourseModel.id)
            .where(EnrollmentModel.user_id == current_user["id"])
            .options(selectinload(CourseModel.instructor))
        )
        enrollments_data = result.all()
        
        enrollments_with_courses = []
        for enrollment, course in enrollments_data:
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
            
            enrollments_with_courses.append({
                "id": str(enrollment.id),
                "course": course_dict,
                "progress": enrollment.progress,
                "last_accessed": enrollment.last_accessed.isoformat() if enrollment.last_accessed else None,
                "enrolled_date": enrollment.enrolled_date.isoformat() if enrollment.enrolled_date else None
            })
        
        return {"enrollments": enrollments_with_courses}

@router.get("/{enrollment_id}", response_model=dict)
async def get_enrollment(
    enrollment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific enrollment."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(EnrollmentModel).where(
                EnrollmentModel.id == enrollment_id,
                EnrollmentModel.user_id == current_user["id"]
            )
        )
        enrollment = result.scalar_one_or_none()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enrollment not found"
            )
        
        return {"enrollment": serialize_doc(enrollment)}

@router.put("/{enrollment_id}/progress", response_model=dict)
async def update_progress(
    enrollment_id: str,
    progress_data: ProgressUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update learning progress."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(EnrollmentModel).where(
                EnrollmentModel.id == enrollment_id,
                EnrollmentModel.user_id == current_user["id"]
            )
        )
        enrollment = result.scalar_one_or_none()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enrollment not found"
            )
        
        # Get course to calculate progress
        course_result = await session.execute(
            select(CourseModel).where(CourseModel.id == enrollment.course_id)
        )
        course = course_result.scalar_one_or_none()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Update completed lessons
        completed_lessons = enrollment.completed_lessons or []
        if progress_data.completed and progress_data.lesson_id not in completed_lessons:
            completed_lessons.append(progress_data.lesson_id)
        
        # Calculate total lessons
        curriculum = course.curriculum or []
        total_lessons = sum(len(module.get("lessons", [])) for module in curriculum)
        progress = (len(completed_lessons) / total_lessons * 100) if total_lessons > 0 else 0
        
        # Check if course is completed
        completed = progress >= 100
        
        enrollment.completed_lessons = completed_lessons
        enrollment.progress = round(progress, 2)
        enrollment.last_accessed = datetime.utcnow()
        enrollment.completed = completed
        
        await session.commit()
        await session.refresh(enrollment)
        
        return {"enrollment": serialize_doc(enrollment)}

@router.get("/course/{course_id}/check", response_model=dict)
async def check_enrollment(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Check if user is enrolled in a course."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(EnrollmentModel).where(
                EnrollmentModel.user_id == current_user["id"],
                EnrollmentModel.course_id == course_id
            )
        )
        enrollment = result.scalar_one_or_none()
        
        return {
            "enrolled": enrollment is not None,
            "enrollment": serialize_doc(enrollment) if enrollment else None
        }
