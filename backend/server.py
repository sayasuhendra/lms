from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Import routes
from routes import auth_routes, course_routes, enrollment_routes
from routes import quiz_routes, discussion_routes, certificate_routes, user_routes, admin_routes, settings_routes
from database import init_db
from seed_data import seed_initial_data

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI(title="LearnHub API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check route
@api_router.get("/")
async def root():
    return {"message": "LearnHub API is running", "version": "1.0.0"}

# Include all route modules
api_router.include_router(auth_routes.router)
api_router.include_router(course_routes.router)
api_router.include_router(enrollment_routes.router)
api_router.include_router(quiz_routes.router)
api_router.include_router(discussion_routes.router)
api_router.include_router(certificate_routes.router)
api_router.include_router(user_routes.router)
api_router.include_router(admin_routes.router)
api_router.include_router(settings_routes.router)

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize database and seed data on startup."""
    logger.info("Initializing database...")
    await init_db()
    logger.info("Seeding initial data...")
    await seed_initial_data()
    logger.info("Application startup complete!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Application shutting down...")
