# ✅ Migrasi MongoDB ke PostgreSQL - SELESAI

> **Catatan historis:** Dokumen ini merekam penyelesaian migrasi. Sistem aktif sudah memakai PostgreSQL; panduan operasional terkini ada di [DOCUMENTATION.md](DOCUMENTATION.md).

## 🎉 Status: Semua Routes Sudah Diupdate!

### ✅ Yang Sudah Selesai

1. ✅ **database.py** - Sudah menggunakan SQLAlchemy dengan PostgreSQL models
2. ✅ **requirements.txt** - Dependencies sudah diupdate (asyncpg, sqlalchemy)
3. ✅ **routes/auth_routes.py** - ✅ Diupdate ke PostgreSQL
4. ✅ **routes/user_routes.py** - ✅ Diupdate ke PostgreSQL
5. ✅ **routes/admin_routes.py** - ✅ Diupdate ke PostgreSQL
6. ✅ **routes/course_routes.py** - ✅ Diupdate ke PostgreSQL
7. ✅ **routes/enrollment_routes.py** - ✅ Diupdate ke PostgreSQL
8. ✅ **routes/quiz_routes.py** - ✅ Diupdate ke PostgreSQL
9. ✅ **routes/discussion_routes.py** - ✅ Diupdate ke PostgreSQL
10. ✅ **routes/certificate_routes.py** - ✅ Diupdate ke PostgreSQL
11. ✅ **seed_data.py** - ✅ Diupdate ke PostgreSQL

## 🚀 Langkah Setup PostgreSQL

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

# Buat user (optional, bisa pakai postgres default)
# CREATE USER org_user WITH PASSWORD 'your_password';
# GRANT ALL PRIVILEGES ON DATABASE organization_lms TO org_user;

# Exit
\q
```

### 3. Update `.env` File

Edit `backend/.env` dan ganti dengan:

```env
# PostgreSQL Configuration
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/organization_lms

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production-12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Catatan:**
- Ganti `postgres:postgres` dengan username:password PostgreSQL Anda
- Jika pakai user khusus, format: `postgresql+asyncpg://username:password@localhost:5432/organization_lms`

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

Atau jalankan server, tables akan otomatis dibuat saat startup.

### 6. Seed Database

```bash
python seed_data.py
```

Atau jalankan server, data akan otomatis di-seed saat startup.

### 7. Jalankan Server

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

## 📝 Perubahan Utama

### Database Models
- Semua models sekarang menggunakan SQLAlchemy ORM
- UUID disimpan sebagai String(36) untuk kompatibilitas
- Relationships sudah di-setup (User ↔ Course, Enrollment, dll)
- JSON fields tetap menggunakan JSON column type

### Query Pattern
**Sebelum (MongoDB):**
```python
user = await users_collection.find_one({"email": email})
```

**Sesudah (PostgreSQL):**
```python
async with AsyncSessionLocal() as session:
    result = await session.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()
```

## ✅ Testing

Setelah setup, test dengan:

1. **Health Check:**
   ```bash
   curl http://localhost:8001/api/
   ```

2. **API Docs:**
   - Buka: http://localhost:8001/docs

3. **Login Test:**
   - Email: `admin@example.org`
   - Password: `admin123`

## 🐛 Troubleshooting

### Error: Connection refused
- Pastikan PostgreSQL service berjalan
- Check `DATABASE_URL` di `.env`
- Test connection: `psql -U postgres -d organization_lms`

### Error: Module not found (asyncpg/sqlalchemy)
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Error: Table already exists
- Tables akan dibuat otomatis saat startup
- Jika error, bisa drop database dan buat ulang:
  ```sql
  DROP DATABASE organization_lms;
  CREATE DATABASE organization_lms;
  ```

## 📚 Resources

- SQLAlchemy Async: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- asyncpg: https://magicstack.github.io/asyncpg/
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

**Selamat! Migrasi ke PostgreSQL sudah selesai! 🎉**
