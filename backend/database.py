from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON, Index
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database URL
DATABASE_URL = os.environ.get(
    'DATABASE_URL',
    'postgresql+asyncpg://postgres:postgres@localhost:5432/organization_lms'
)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Helper function to generate UUID
def generate_id():
    return str(uuid.uuid4())


# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_id)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student", index=True)
    avatar = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    expertise = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="user", cascade="all, delete-orphan")
    courses_taught = relationship("Course", back_populates="instructor")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(String(36), primary_key=True, default=generate_id)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    long_description = Column(Text, nullable=True)
    instructor_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    level = Column(String(50), nullable=False, index=True)
    thumbnail = Column(String(500), nullable=True)
    duration = Column(String(50), nullable=False)
    language = Column(String(50), default="English")
    rating = Column(Float, default=0.0)
    reviews = Column(Integer, default=0)
    students = Column(Integer, default=0)
    price = Column(Float, default=0.0)
    skills = Column(JSON, default=list)
    subtitles = Column(JSON, default=list)
    curriculum = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    instructor = relationship("User", back_populates="courses_taught")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="course", cascade="all, delete-orphan")
    discussions = relationship("Discussion", back_populates="course", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="course", cascade="all, delete-orphan")

class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(String(36), primary_key=True, default=generate_id)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False, index=True)
    enrolled_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    progress = Column(Float, default=0.0)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=False)
    completed_lessons = Column(JSON, default=list)
    
    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    
    # Unique constraint
    __table_args__ = (
        Index('uq_user_course', 'user_id', 'course_id', unique=True),
    )

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(String(36), primary_key=True, default=generate_id)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False, index=True)
    lesson_id = Column(String(36), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    questions = Column(JSON, nullable=False)
    
    # Relationships
    course = relationship("Course", back_populates="quizzes")

class Discussion(Base):
    __tablename__ = "discussions"
    
    id = Column(String(36), primary_key=True, default=generate_id)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    user_name = Column(String(255), nullable=False)
    user_avatar = Column(String(500), nullable=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    replies = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    category = Column(String(100), default="General")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    course = relationship("Course", back_populates="discussions")

class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(String(36), primary_key=True, default=generate_id)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False, index=True)
    completion_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    certificate_url = Column(String(500), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="certificates")
    course = relationship("Course", back_populates="certificates")
    
    # Unique constraint
    __table_args__ = (
        Index('uq_user_course_cert', 'user_id', 'course_id', unique=True),
    )

class AppSetting(Base):
    __tablename__ = "app_settings"

    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

# Helper function to serialize SQLAlchemy models
def serialize_model(model):
    """Convert SQLAlchemy model to dict."""
    if model is None:
        return None
    if isinstance(model, list):
        return [serialize_model(item) for item in model]
    
    result = {}
    for column in model.__table__.columns:
        value = getattr(model, column.name)
        if isinstance(value, datetime):
            result[column.name] = value.isoformat()
        elif isinstance(value, list):
            result[column.name] = value
        elif isinstance(value, dict):
            result[column.name] = value
        else:
            result[column.name] = value
    return result

# For backward compatibility
def serialize_doc(doc):
    """Alias for serialize_model for backward compatibility."""
    return serialize_model(doc)

# Database initialization
async def init_db():
    """Initialize database - create all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Database tables created")

# Get database session
async def get_db():
    """Get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
