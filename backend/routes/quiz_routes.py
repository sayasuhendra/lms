from fastapi import APIRouter, HTTPException, status, Depends
from models import Quiz, QuizSubmission, QuizResult
from auth import get_current_user
from database import (
    Quiz as QuizModel, Enrollment as EnrollmentModel, 
    AsyncSessionLocal, serialize_doc
)
from sqlalchemy import select

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

@router.get("/lesson/{lesson_id}", response_model=dict)
async def get_quiz_by_lesson(
    lesson_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get quiz for a specific lesson."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(QuizModel).where(QuizModel.lesson_id == lesson_id)
        )
        quiz = result.scalar_one_or_none()
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found for this lesson"
            )
        
        return {"quiz": serialize_doc(quiz)}

@router.post("/{quiz_id}/submit", response_model=QuizResult)
async def submit_quiz(
    quiz_id: str,
    submission: QuizSubmission,
    current_user: dict = Depends(get_current_user)
):
    """Submit quiz answers and get results."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(QuizModel).where(QuizModel.id == quiz_id)
        )
        quiz = result.scalar_one_or_none()
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found"
            )
        
        # Check if user is enrolled in the course
        enrollment_result = await session.execute(
            select(EnrollmentModel).where(
                EnrollmentModel.user_id == current_user["id"],
                EnrollmentModel.course_id == quiz.course_id
            )
        )
        enrollment = enrollment_result.scalar_one_or_none()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enrolled in this course"
            )
        
        # Calculate score
        questions = quiz.questions or []
        total_questions = len(questions)
        correct_answers = 0
        
        for question in questions:
            question_id = question.get("id")
            user_answer = submission.answers.get(question_id)
            if user_answer is not None and user_answer == question.get("correct_answer"):
                correct_answers += 1
        
        score = round((correct_answers / total_questions) * 100, 2) if total_questions > 0 else 0
        passed = score >= 70
        
        return QuizResult(
            score=score,
            total_questions=total_questions,
            correct_answers=correct_answers,
            passed=passed
        )
