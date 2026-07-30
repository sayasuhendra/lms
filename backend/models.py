from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"

class CourseLevel(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

class LessonType(str, Enum):
    VIDEO = "video"
    QUIZ = "quiz"

# User Models
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    avatar: Optional[str] = None
    bio: Optional[str] = ""
    expertise: Optional[str] = ""

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

class UserInDB(User):
    hashed_password: str

class UserResponse(BaseModel):
    success: bool
    user: User
    token: str

# Lesson Models
class Lesson(BaseModel):
    id: str
    title: str
    duration: str
    type: LessonType
    completed: bool = False

# Module Models
class Module(BaseModel):
    id: str
    title: str
    lessons: List[Lesson]

# Instructor Models
class InstructorInfo(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    bio: Optional[str] = ""
    expertise: Optional[str] = ""

# Course Models
class CourseBase(BaseModel):
    title: str
    description: str
    category: str
    level: CourseLevel
    duration: str
    thumbnail: Optional[str] = None

class CourseCreate(CourseBase):
    skills: List[str] = []
    long_description: Optional[str] = None
    language: str = "English"
    subtitles: List[str] = ["English"]

class Course(CourseBase):
    id: str
    instructor: InstructorInfo
    rating: float = 0.0
    reviews: int = 0
    students: int = 0
    price: float = 0.0
    skills: List[str] = []
    long_description: Optional[str] = None
    language: str = "English"
    subtitles: List[str] = ["English"]
    curriculum: List[Module] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

# Enrollment Models
class EnrollmentCreate(BaseModel):
    course_id: str

class Enrollment(BaseModel):
    id: str
    user_id: str
    course_id: str
    enrolled_date: datetime = Field(default_factory=datetime.utcnow)
    progress: float = 0.0
    last_accessed: datetime = Field(default_factory=datetime.utcnow)
    completed: bool = False
    completed_lessons: List[str] = []

    class Config:
        from_attributes = True

class EnrollmentWithCourse(BaseModel):
    id: str
    course: Course
    progress: float
    last_accessed: datetime
    enrolled_date: datetime

# Progress Update Models
class ProgressUpdate(BaseModel):
    lesson_id: str
    completed: bool

# Quiz Models
class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: int
    explanation: str

class Quiz(BaseModel):
    id: str
    lesson_id: str
    course_id: str
    title: str
    questions: List[QuizQuestion]

    class Config:
        from_attributes = True

class QuizSubmission(BaseModel):
    answers: Dict[str, int]

class QuizResult(BaseModel):
    score: float
    total_questions: int
    correct_answers: int
    passed: bool

# Discussion Models
class DiscussionCreate(BaseModel):
    course_id: str
    title: str
    content: str
    category: str = "General"

class Discussion(BaseModel):
    id: str
    course_id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str]
    title: str
    content: str
    replies: int = 0
    likes: int = 0
    category: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

# Certificate Models
class Certificate(BaseModel):
    id: str
    user_id: str
    course_id: str
    course_name: str
    instructor_name: str
    completion_date: datetime = Field(default_factory=datetime.utcnow)
    certificate_url: Optional[str] = None

    class Config:
        from_attributes = True

class CertificateGenerate(BaseModel):
    course_id: str

# Profile Update Models
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    expertise: Optional[str] = None

# Category Model
class Category(BaseModel):
    id: str
    name: str
    icon: str
    count: int

# Application Settings Models
class AppSettings(BaseModel):
    organization_name: str = "Nama Organisasi"

class AppSettingsUpdate(BaseModel):
    organization_name: str = Field(..., min_length=2, max_length=120)
