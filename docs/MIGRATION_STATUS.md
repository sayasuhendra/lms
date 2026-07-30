# 📊 Status Migrasi MongoDB ke PostgreSQL

> **Snapshot historis:** Status “masih perlu dikerjakan” di bawah berasal dari masa migrasi dan tidak lagi menggambarkan source saat ini. Sistem aktif menggunakan PostgreSQL. Lihat [SETUP_STATUS.md](SETUP_STATUS.md).

## ✅ Yang Sudah Selesai

1. ✅ **database.py** - Sudah menggunakan SQLAlchemy dengan PostgreSQL models
2. ✅ **requirements.txt** - Dependencies sudah diupdate (asyncpg, sqlalchemy)
3. ✅ **routes/auth_routes.py** - Sudah diupdate ke PostgreSQL
4. ✅ **routes/user_routes.py** - Sudah diupdate ke PostgreSQL
5. ✅ **routes/admin_routes.py** - Sudah diupdate ke PostgreSQL

## ⚠️ Yang Masih Perlu Dikerjakan

Routes berikut masih menggunakan MongoDB dan perlu diupdate:

1. ⏳ **routes/course_routes.py** - Course CRUD operations
2. ⏳ **routes/enrollment_routes.py** - Enrollment management
3. ⏳ **routes/quiz_routes.py** - Quiz operations
4. ⏳ **routes/discussion_routes.py** - Discussion forum
5. ⏳ **routes/certificate_routes.py** - Certificate generation
6. ⏳ **seed_data.py** - Database seeding script

## 🔧 Setup yang Perlu Dilakukan

### 1. Install PostgreSQL

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

### 2. Buat Database

```bash
psql postgres
CREATE DATABASE organization_lms;
\q
```

### 3. Update `.env` File

Edit `backend/.env`:
```env
# Ganti MONGO_URL dengan DATABASE_URL
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/organization_lms

# Hapus atau comment baris ini:
# MONGO_URL=mongodb://localhost:27017
# DB_NAME=organization_lms
```

### 4. Install Dependencies Baru

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### 5. Create Database Tables

```bash
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"
```

## 📝 Pattern Migrasi

Semua routes perlu mengikuti pattern ini:

**Sebelum (MongoDB):**
```python
from database import users_collection
user = await users_collection.find_one({"email": email})
```

**Sesudah (PostgreSQL):**
```python
from database import User, AsyncSessionLocal
from sqlalchemy import select

async with AsyncSessionLocal() as session:
    result = await session.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()
```

## 🚀 Next Steps

1. Update routes yang masih menggunakan MongoDB
2. Update seed_data.py
3. Test semua endpoints
4. Update dokumentasi

## 📚 Resources

- SQLAlchemy Async Docs: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- asyncpg Docs: https://magicstack.github.io/asyncpg/
