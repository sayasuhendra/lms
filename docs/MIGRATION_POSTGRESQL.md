# 🗄️ Panduan Migrasi MongoDB ke PostgreSQL

> **Arsip rencana migrasi:** Beberapa bagian di bawah menggambarkan pekerjaan yang dahulu belum selesai. Migrasi sekarang telah selesai. Jangan gunakan status lama ini sebagai panduan setup; buka [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md) dan [SETUP_LOKAL.md](SETUP_LOKAL.md).

## 📋 Overview

Sistem Nama Organisasi LMS sedang dimigrasikan dari MongoDB ke PostgreSQL. File `database.py` sudah diupdate dengan SQLAlchemy models.

## ✅ Yang Sudah Selesai

1. ✅ `database.py` - Sudah menggunakan SQLAlchemy dengan PostgreSQL
2. ✅ `requirements.txt` - Dependencies sudah diupdate (asyncpg, sqlalchemy)
3. ✅ Database models - Semua models sudah dibuat (User, Course, Enrollment, Quiz, Discussion, Certificate)

## ⚠️ Yang Perlu Dikerjakan

Semua routes perlu diupdate untuk menggunakan SQLAlchemy queries. Berikut daftar routes yang perlu diupdate:

1. `routes/auth_routes.py` - Authentication (register, login, get_me)
2. `routes/user_routes.py` - User profile management
3. `routes/course_routes.py` - Course CRUD operations
4. `routes/enrollment_routes.py` - Enrollment management
5. `routes/quiz_routes.py` - Quiz operations
6. `routes/discussion_routes.py` - Discussion forum
7. `routes/certificate_routes.py` - Certificate generation
8. `routes/admin_routes.py` - Admin user management
9. `seed_data.py` - Database seeding script

## 🔧 Setup PostgreSQL

### 1. Install PostgreSQL

**Mac (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Atau download dari:** https://www.postgresql.org/download/

### 2. Buat Database

```bash
# Login ke PostgreSQL
psql postgres

# Buat database
CREATE DATABASE organization_lms;

# Buat user (optional)
CREATE USER org_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE organization_lms TO org_user;

# Exit
\q
```

### 3. Update `.env` File

Edit `backend/.env`:
```env
# PostgreSQL Configuration (ganti MONGO_URL)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/organization_lms

# Atau jika pakai user khusus:
# DATABASE_URL=postgresql+asyncpg://org_user:your_password@localhost:5432/organization_lms
```

## 📝 Perubahan yang Perlu Dilakukan

### Pattern Perubahan dari MongoDB ke PostgreSQL

**Sebelum (MongoDB):**
```python
from database import users_collection, serialize_doc

# Find user
user = await users_collection.find_one({"email": email})

# Insert user
await users_collection.insert_one(user_dict)

# Update user
await users_collection.update_one(
    {"id": user_id},
    {"$set": {"name": new_name}}
)
```

**Sesudah (PostgreSQL dengan SQLAlchemy):**
```python
from database import User, AsyncSessionLocal, serialize_doc
from sqlalchemy import select

# Get session
async with AsyncSessionLocal() as session:
    # Find user
    result = await session.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()
    
    # Insert user
    new_user = User(**user_dict)
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    
    # Update user
    user.name = new_name
    await session.commit()
```

## 🚀 Langkah-Langkah Migrasi

1. **Install dependencies baru:**
   ```bash
   cd backend
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Setup PostgreSQL database** (lihat di atas)

3. **Update .env file** dengan DATABASE_URL

4. **Jalankan init_db untuk create tables:**
   ```bash
   python -c "import asyncio; from database import init_db; asyncio.run(init_db())"
   ```

5. **Update semua routes** untuk menggunakan SQLAlchemy

6. **Update seed_data.py** untuk menggunakan SQLAlchemy

7. **Test aplikasi**

## 📚 Resources

- SQLAlchemy Async: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- asyncpg: https://magicstack.github.io/asyncpg/

## ⚠️ Catatan Penting

- UUID di PostgreSQL disimpan sebagai string (UUID(as_uuid=False))
- JSON fields (skills, curriculum, questions) tetap menggunakan JSON column type
- Relationships sudah di-setup di models, bisa digunakan dengan eager loading
- Semua datetime menggunakan datetime.utcnow()
