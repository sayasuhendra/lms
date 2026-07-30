from fastapi import APIRouter, HTTPException, status, Depends
from models import Certificate, CertificateGenerate
from auth import get_current_user
from database import (
    Certificate as CertificateModel, Enrollment as EnrollmentModel,
    Course as CourseModel, AsyncSessionLocal, generate_id, serialize_doc
)
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime

router = APIRouter(prefix="/certificates", tags=["Certificates"])

@router.get("", response_model=dict)
async def get_certificates(current_user: dict = Depends(get_current_user)):
    """Get all certificates for the current user."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(CertificateModel, CourseModel, UserModel)
            .join(CourseModel, CertificateModel.course_id == CourseModel.id)
            .join(UserModel, CourseModel.instructor_id == UserModel.id)
            .where(CertificateModel.user_id == current_user["id"])
        )
        certificates_data = result.all()
        
        certificates_list = []
        for cert, course, instructor in certificates_data:
            cert_dict = serialize_doc(cert)
            cert_dict["course_name"] = course.title
            cert_dict["instructor_name"] = instructor.name
            certificates_list.append(cert_dict)
        
        return {"certificates": certificates_list}

@router.post("/generate", response_model=dict)
async def generate_certificate(
    cert_data: CertificateGenerate,
    current_user: dict = Depends(get_current_user)
):
    """Generate a certificate for a completed course."""
    async with AsyncSessionLocal() as session:
        # Check if course is completed
        enrollment_result = await session.execute(
            select(EnrollmentModel).where(
                EnrollmentModel.user_id == current_user["id"],
                EnrollmentModel.course_id == cert_data.course_id
            )
        )
        enrollment = enrollment_result.scalar_one_or_none()
        
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Not enrolled in this course"
            )
        
        if not enrollment.completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course not completed yet"
            )
        
        # Check if certificate already exists
        existing_result = await session.execute(
            select(CertificateModel).where(
                CertificateModel.user_id == current_user["id"],
                CertificateModel.course_id == cert_data.course_id
            )
        )
        existing_cert = existing_result.scalar_one_or_none()
        if existing_cert:
            cert_dict = serialize_doc(existing_cert)
            # Get course and instructor info
            course_result = await session.execute(
                select(CourseModel, UserModel)
                .join(UserModel, CourseModel.instructor_id == UserModel.id)
                .where(CourseModel.id == cert_data.course_id)
            )
            course, instructor = course_result.first()
            if course and instructor:
                cert_dict["course_name"] = course.title
                cert_dict["instructor_name"] = instructor.name
            return {"certificate": cert_dict}
        
        # Get course info
        course_result = await session.execute(
            select(CourseModel, UserModel)
            .join(UserModel, CourseModel.instructor_id == UserModel.id)
            .where(CourseModel.id == cert_data.course_id)
        )
        course_data = course_result.first()
        if not course_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        course, instructor = course_data
        
        cert_id = generate_id()
        
        new_certificate = CertificateModel(
            id=cert_id,
            user_id=current_user["id"],
            course_id=cert_data.course_id,
            completion_date=datetime.utcnow(),
            certificate_url=f"https://certificates.learnhub.com/{cert_id}"
        )
        
        session.add(new_certificate)
        await session.commit()
        await session.refresh(new_certificate)
        
        cert_dict = serialize_doc(new_certificate)
        cert_dict["course_name"] = course.title
        cert_dict["instructor_name"] = instructor.name
        
        return {"certificate": cert_dict}

@router.get("/{certificate_id}", response_model=dict)
async def get_certificate(
    certificate_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific certificate."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(CertificateModel, CourseModel, UserModel)
            .join(CourseModel, CertificateModel.course_id == CourseModel.id)
            .join(UserModel, CourseModel.instructor_id == UserModel.id)
            .where(
                CertificateModel.id == certificate_id,
                CertificateModel.user_id == current_user["id"]
            )
        )
        cert_data = result.first()
        
        if not cert_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Certificate not found"
            )
        
        cert, course, instructor = cert_data
        cert_dict = serialize_doc(cert)
        cert_dict["course_name"] = course.title
        cert_dict["instructor_name"] = instructor.name
        
        return {"certificate": cert_dict}
