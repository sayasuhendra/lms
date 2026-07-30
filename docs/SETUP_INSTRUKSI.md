# Instruksi Setup Nama Organisasi LMS

Panduan singkat ini memakai PostgreSQL, sesuai implementasi aplikasi saat ini. Jangan mengikuti instruksi MongoDB dari catatan migrasi historis.

## Kebutuhan

- PostgreSQL
- Python 3.11+
- Node.js 20 LTS+ dan npm
- Git (opsional jika source sudah tersedia)

## 1. Database

```sql
CREATE USER org_user WITH PASSWORD 'ganti-password-kuat';
CREATE DATABASE organization_lms OWNER org_user;
```

## 2. Backend

Buat `backend/.env`:

```dotenv
DATABASE_URL=postgresql+asyncpg://org_user:ganti-password-kuat@localhost:5432/organization_lms
SECRET_KEY=ganti-dengan-random-secret-yang-panjang
```

Lalu instal dependency:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
cd ..
./start_backend.sh
```

Backend berjalan di `http://localhost:8001`; Swagger UI ada di `http://localhost:8001/docs`.

## 3. Frontend

Buat `frontend/.env`:

```dotenv
REACT_APP_BACKEND_URL=http://localhost:8001
```

Pada terminal baru:

```bash
cd frontend
npm install --legacy-peer-deps
cd ..
./start_frontend.sh
```

Buka `http://localhost:3000`.

## 4. Data awal

Backend menjalankan seed idempotent saat startup. Seed manual tersedia melalui:

```bash
./seed_database.sh
```

## 5. Verifikasi

```bash
curl http://localhost:8001/api/
```

Setelah health check berhasil, uji register/login, daftar course, enrollment, dan progress dari browser.

## Pemecahan masalah

- Gagal koneksi database: cek service PostgreSQL, user, password, database, dan skema URL `postgresql+asyncpg://`.
- `ModuleNotFoundError`: aktifkan `backend/venv`, lalu install ulang requirements.
- Frontend gagal memanggil API: pastikan URL tidak memiliki `/api`, lalu restart frontend.
- Port sibuk: cek `lsof -i :8001` atau `lsof -i :3000`.

Panduan lebih rinci: [SETUP_LOKAL.md](SETUP_LOKAL.md).
