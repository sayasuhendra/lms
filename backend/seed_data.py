from database import (
    User, Course, Quiz, AppSetting, AsyncSessionLocal,
    generate_id
)
from auth import get_password_hash
from sqlalchemy import select, func
from datetime import datetime

async def seed_initial_data():
    """Seed the database with initial data."""
    
    async with AsyncSessionLocal() as session:
        # Ensure neutral runtime branding exists.
        setting_result = await session.execute(
            select(AppSetting).where(AppSetting.key == "organization_name")
        )
        if not setting_result.scalar_one_or_none():
            session.add(AppSetting(key="organization_name", value="Nama Organisasi"))
            await session.commit()

        legacy_domain = "p" + "ks.id"
        legacy_users = {
            f"admin@{legacy_domain}": {
                "name": "Admin Organisasi",
                "email": "admin@example.org",
                "bio": "Administrator Sistem LMS",
            },
            f"siti@{legacy_domain}": {
                "email": "siti@example.org",
                "bio": "Pengajar organisasi dan pembina program pembelajaran",
                "expertise": "Kepemimpinan, Pengembangan Organisasi, Pembelajaran",
            },
            f"budi@{legacy_domain}": {
                "email": "budi@example.org",
                "bio": "Trainer nasional untuk pengembangan kapasitas organisasi",
            },
            f"ahmad@{legacy_domain}": {
                "email": "ahmad@example.org",
                "bio": "Anggota muda organisasi wilayah Jakarta Selatan",
            },
        }
        legacy_result = await session.execute(
            select(User).where(User.email.in_(legacy_users.keys()))
        )
        legacy_records = legacy_result.scalars().all()
        for user in legacy_records:
            updates = legacy_users[user.email]
            for field, value in updates.items():
                setattr(user, field, value)
        if legacy_records:
            await session.commit()

        # Check if admin user exists, if not create it
        result = await session.execute(
            select(User).where(User.email == "admin@example.org")
        )
        admin_user = result.scalar_one_or_none()
        
        if not admin_user:
            print("Creating admin user...")
            admin_id = generate_id()
            admin = User(
                id=admin_id,
                name="Admin Organisasi",
                email="admin@example.org",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
                bio="Administrator Sistem LMS",
                expertise="System Administration",
                created_at=datetime.utcnow()
            )
            session.add(admin)
            await session.commit()
            print("✓ Admin user created")
        
        # Check if data already exists
        count_result = await session.execute(select(func.count(User.id)))
        existing_users = count_result.scalar()
        
        if existing_users > 3:  # More than just admin user
            print("Database already seeded, skipping other data...")
            return
        
        print("Seeding database with initial data...")
        
        # Create sample instructors
        instructor1_id = generate_id()
        instructor2_id = generate_id()
        
        instructor1 = User(
            id=instructor1_id,
            name="Dr. Siti Nurhaliza",
            email="siti@example.org",
            hashed_password=get_password_hash("password123"),
            role="instructor",
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
            bio="Pengajar organisasi dan pembina program pembelajaran",
            expertise="Kepemimpinan, Pengembangan Organisasi, Pembelajaran",
            created_at=datetime.utcnow()
        )
        
        instructor2 = User(
            id=instructor2_id,
            name="Ustadz Budi Rahardjo",
            email="budi@example.org",
            hashed_password=get_password_hash("password123"),
            role="instructor",
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi",
            bio="Trainer nasional untuk pengembangan kapasitas organisasi",
            expertise="Ekonomi Syariah, Kebijakan Publik, Manajemen",
            created_at=datetime.utcnow()
        )
        
        session.add(instructor1)
        session.add(instructor2)
        await session.commit()
        
        # Create sample student
        student_id = generate_id()
        student = User(
            id=student_id,
            name="Ahmad Santoso",
            email="ahmad@example.org",
            hashed_password=get_password_hash("password123"),
            role="student",
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
            bio="Anggota muda organisasi wilayah Jakarta Selatan",
            created_at=datetime.utcnow()
        )
        session.add(student)
        await session.commit()
        
        # Create sample courses
        course1_id = generate_id()
        course2_id = generate_id()
        course3_id = generate_id()
        course4_id = generate_id()
        course5_id = generate_id()
        course6_id = generate_id()
        
        courses = [
            Course(
                id=course1_id,
                title="Machine Learning Specialization",
                description="Master the fundamentals of machine learning and implement algorithms from scratch. Build real-world AI applications.",
                long_description="This comprehensive specialization covers supervised learning, unsupervised learning, neural networks, and deep learning. You will learn to build and train models, evaluate their performance, and deploy them in production environments.",
                instructor_id=instructor1_id,
                category="Data Science",
                level="Intermediate",
                thumbnail="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
                duration="3 months",
                rating=4.8,
                reviews=12543,
                students=45678,
                price=0.0,
                skills=["Python", "TensorFlow", "Neural Networks", "Data Analysis"],
                language="English",
                subtitles=["English", "Spanish", "Chinese"],
                curriculum=[
                    {
                        "id": "m1",
                        "title": "Introduction to Machine Learning",
                        "lessons": [
                            {"id": "l1", "title": "What is Machine Learning?", "duration": "10 min", "type": "video", "completed": False},
                            {"id": "l2", "title": "Types of ML Algorithms", "duration": "15 min", "type": "video", "completed": False},
                            {"id": "l3", "title": "Setting up Python Environment", "duration": "20 min", "type": "video", "completed": False},
                            {"id": "l4", "title": "Week 1 Quiz", "duration": "30 min", "type": "quiz", "completed": False}
                        ]
                    },
                    {
                        "id": "m2",
                        "title": "Supervised Learning",
                        "lessons": [
                            {"id": "l5", "title": "Linear Regression", "duration": "25 min", "type": "video", "completed": False},
                            {"id": "l6", "title": "Logistic Regression", "duration": "30 min", "type": "video", "completed": False},
                            {"id": "l7", "title": "Classification Algorithms", "duration": "35 min", "type": "video", "completed": False},
                            {"id": "l8", "title": "Week 2 Quiz", "duration": "30 min", "type": "quiz", "completed": False}
                        ]
                    },
                    {
                        "id": "m3",
                        "title": "Neural Networks",
                        "lessons": [
                            {"id": "l9", "title": "Introduction to Neural Networks", "duration": "20 min", "type": "video", "completed": False},
                            {"id": "l10", "title": "Backpropagation", "duration": "25 min", "type": "video", "completed": False},
                            {"id": "l11", "title": "Building Your First Neural Network", "duration": "40 min", "type": "video", "completed": False},
                            {"id": "l12", "title": "Week 3 Quiz", "duration": "30 min", "type": "quiz", "completed": False}
                        ]
                    }
                ],
                created_at=datetime.utcnow()
            ),
            Course(
                id=course2_id,
                title="Business Strategy Fundamentals",
                description="Learn strategic thinking and frameworks used by top business leaders to drive growth and innovation.",
                long_description="Develop critical business strategy skills including competitive analysis, market positioning, and strategic planning. Real-world case studies from Fortune 500 companies.",
                instructor_id=instructor2_id,
                category="Business",
                level="Beginner",
                thumbnail="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
                duration="6 weeks",
                rating=4.7,
                reviews=8921,
                students=34562,
                price=0.0,
                skills=["Strategic Thinking", "Business Analysis", "Leadership", "Decision Making"],
                language="English",
                subtitles=["English", "Spanish"],
                curriculum=[
                    {
                        "id": "m1",
                        "title": "Introduction to Strategy",
                        "lessons": [
                            {"id": "l1", "title": "What is Business Strategy?", "duration": "12 min", "type": "video", "completed": False},
                            {"id": "l2", "title": "Strategic Frameworks Overview", "duration": "18 min", "type": "video", "completed": False},
                            {"id": "l3", "title": "Week 1 Quiz", "duration": "20 min", "type": "quiz", "completed": False}
                        ]
                    },
                    {
                        "id": "m2",
                        "title": "Competitive Analysis",
                        "lessons": [
                            {"id": "l4", "title": "Porter's Five Forces", "duration": "22 min", "type": "video", "completed": False},
                            {"id": "l5", "title": "SWOT Analysis", "duration": "20 min", "type": "video", "completed": False},
                            {"id": "l6", "title": "Week 2 Quiz", "duration": "20 min", "type": "quiz", "completed": False}
                        ]
                    }
                ],
                created_at=datetime.utcnow()
            ),
            Course(
                id=course3_id,
                title="Full Stack Web Development",
                description="Build modern web applications from scratch using React, Node.js, and MongoDB.",
                long_description="Learn full-stack development with hands-on projects. Master frontend with React, backend with Node.js and Express, and database design with MongoDB.",
                instructor_id=instructor1_id,
                category="Computer Science",
                level="Intermediate",
                thumbnail="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
                duration="4 months",
                rating=4.9,
                reviews=15234,
                students=56789,
                price=0.0,
                skills=["React", "Node.js", "MongoDB", "REST APIs"],
                language="English",
                subtitles=["English", "Spanish", "French"],
                curriculum=[
                    {
                        "id": "m1",
                        "title": "Frontend Development",
                        "lessons": [
                            {"id": "l1", "title": "HTML & CSS Fundamentals", "duration": "30 min", "type": "video", "completed": False},
                            {"id": "l2", "title": "JavaScript ES6+", "duration": "45 min", "type": "video", "completed": False},
                            {"id": "l3", "title": "React Basics", "duration": "50 min", "type": "video", "completed": False},
                            {"id": "l4", "title": "Week 1 Quiz", "duration": "25 min", "type": "quiz", "completed": False}
                        ]
                    }
                ],
                created_at=datetime.utcnow()
            ),
            Course(
                id=course4_id,
                title="Digital Marketing Mastery",
                description="Master digital marketing strategies including SEO, social media, content marketing, and analytics.",
                long_description="Complete guide to digital marketing covering all major channels and tactics used by successful brands.",
                instructor_id=instructor2_id,
                category="Business",
                level="Beginner",
                thumbnail="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
                duration="8 weeks",
                rating=4.6,
                reviews=7654,
                students=28934,
                price=0.0,
                skills=["SEO", "Social Media", "Content Marketing", "Google Analytics"],
                language="English",
                subtitles=["English"],
                curriculum=[
                    {
                        "id": "m1",
                        "title": "Digital Marketing Foundations",
                        "lessons": [
                            {"id": "l1", "title": "Introduction to Digital Marketing", "duration": "15 min", "type": "video", "completed": False},
                            {"id": "l2", "title": "Understanding Your Audience", "duration": "20 min", "type": "video", "completed": False},
                            {"id": "l3", "title": "Week 1 Quiz", "duration": "15 min", "type": "quiz", "completed": False}
                        ]
                    }
                ],
                created_at=datetime.utcnow()
            ),
            Course(
                id=course5_id,
                title="Python for Data Science",
                description="Learn Python programming and data analysis libraries including NumPy, Pandas, and Matplotlib.",
                long_description="Comprehensive Python course focused on data science applications with real-world datasets and projects.",
                instructor_id=instructor1_id,
                category="Data Science",
                level="Beginner",
                thumbnail="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
                duration="10 weeks",
                rating=4.8,
                reviews=11234,
                students=42156,
                price=0.0,
                skills=["Python", "Pandas", "NumPy", "Data Visualization"],
                language="English",
                subtitles=["English", "Spanish"],
                curriculum=[
                    {
                        "id": "m1",
                        "title": "Python Fundamentals",
                        "lessons": [
                            {"id": "l1", "title": "Introduction to Python", "duration": "18 min", "type": "video", "completed": False},
                            {"id": "l2", "title": "Variables and Data Types", "duration": "22 min", "type": "video", "completed": False},
                            {"id": "l3", "title": "Week 1 Quiz", "duration": "20 min", "type": "quiz", "completed": False}
                        ]
                    }
                ],
                created_at=datetime.utcnow()
            ),
            Course(
                id=course6_id,
                title="Leadership and Management",
                description="Develop essential leadership skills and learn to manage teams effectively.",
                long_description="Build leadership competencies including emotional intelligence, team building, conflict resolution, and strategic decision making.",
                instructor_id=instructor2_id,
                category="Personal Development",
                level="Intermediate",
                thumbnail="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
                duration="5 weeks",
                rating=4.7,
                reviews=6543,
                students=23456,
                price=0.0,
                skills=["Leadership", "Team Management", "Communication", "Problem Solving"],
                language="English",
                subtitles=["English"],
                curriculum=[
                    {
                        "id": "m1",
                        "title": "Leadership Foundations",
                        "lessons": [
                            {"id": "l1", "title": "What Makes a Great Leader?", "duration": "16 min", "type": "video", "completed": False},
                            {"id": "l2", "title": "Leadership Styles", "duration": "20 min", "type": "video", "completed": False},
                            {"id": "l3", "title": "Week 1 Quiz", "duration": "15 min", "type": "quiz", "completed": False}
                        ]
                    }
                ],
                created_at=datetime.utcnow()
            )
        ]
        
        for course in courses:
            session.add(course)
        await session.commit()
        
        # Create sample quiz
        quiz = Quiz(
            id=generate_id(),
            lesson_id="l4",
            course_id=course1_id,
            title="Week 1 Quiz: Introduction to Machine Learning",
            questions=[
                {
                    "id": "q1_1",
                    "question": "What is the primary goal of supervised learning?",
                    "options": [
                        "To discover hidden patterns in data",
                        "To predict outcomes based on labeled training data",
                        "To reduce the dimensionality of data",
                        "To cluster similar data points"
                    ],
                    "correct_answer": 1,
                    "explanation": "Supervised learning uses labeled training data to learn patterns and make predictions on new data."
                },
                {
                    "id": "q1_2",
                    "question": "Which of the following is an example of unsupervised learning?",
                    "options": [
                        "Spam email classification",
                        "House price prediction",
                        "Customer segmentation",
                        "Image recognition"
                    ],
                    "correct_answer": 2,
                    "explanation": "Customer segmentation groups similar customers without predefined labels, making it unsupervised learning."
                },
                {
                    "id": "q1_3",
                    "question": "What is overfitting in machine learning?",
                    "options": [
                        "When a model performs poorly on training data",
                        "When a model is too simple to capture patterns",
                        "When a model memorizes training data and fails to generalize",
                        "When a model takes too long to train"
                    ],
                    "correct_answer": 2,
                    "explanation": "Overfitting occurs when a model learns the training data too well, including noise, and cannot generalize to new data."
                }
            ]
        )
        session.add(quiz)
        await session.commit()
        
        print(f"✓ Seeded 2 instructors, 1 student, 1 admin")
        print(f"✓ Seeded {len(courses)} courses")
        print(f"✓ Seeded 1 quiz")
        print("Database seeding completed successfully!")
