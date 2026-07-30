# Panduan Setup Development Lokal — Nama Organisasi LMS

Dokumen ini menjelaskan instalasi dari mesin bersih untuk macOS/Linux. Pengguna Windows dapat menjalankan perintah yang setara melalui PowerShell/WSL; aktivasi virtualenv menjadi `venv\\Scripts\\activate`.

## 1. Prasyarat

| Komponen | Rekomendasi | Verifikasi |
|---|---|---|
| Python | 3.11 | `python3.11 --version` |
| PostgreSQL | 15+ | `psql --version` |
| Node.js | 20 LTS+ | `node --version` |
| npm | sesuai Node LTS | `npm --version` |

Pastikan source project tersedia dan terminal berada di root `lms-organisasi`.

Setelah PostgreSQL siap, cara yang direkomendasikan adalah menjalankan `./setup.sh`. Script ini aman dijalankan ulang, tidak menimpa `.env` existing, menginstal dependency, memvalidasi koneksi database, dan membuat tabel. Bagian manual tetap tersedia untuk troubleshooting atau konfigurasi khusus.

## 2. Siapkan PostgreSQL

Masuk ke PostgreSQL sebagai superuser:

```bash
psql postgres
```

Jalankan:

```sql
CREATE USER org_user WITH PASSWORD 'development-password';
CREATE DATABASE organization_lms OWNER org_user;
\\q
```

Uji koneksi:

```bash
psql 'postgresql://org_user:development-password@localhost:5432/organization_lms'
```

Jika password mengandung karakter khusus, URL-encode karakter tersebut pada `DATABASE_URL`.

## 3. Siapkan backend Python

```bash
cd backend
python3.11 -m venv .venv311
source .venv311/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Buat `backend/.env`:

```dotenv
DATABASE_URL=postgresql+asyncpg://org_user:development-password@localhost:5432/organization_lms
SECRET_KEY=development-only-random-secret
```

Buat random secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Kembali ke root dan jalankan backend:

```bash
cd ..
./start_backend.sh
```

Startup akan membuat tabel yang belum ada dan menjalankan seed data. Verifikasi:

```bash
curl http://localhost:8001/api/
```

## 4. Siapkan frontend React

Pada terminal kedua:

```bash
cd frontend
npm install --legacy-peer-deps
```

Buat `frontend/.env`:

```dotenv
REACT_APP_BACKEND_URL=http://localhost:8001
```

Jalankan:

```bash
cd ..
./start_frontend.sh
```

Buka `http://localhost:3000`.

## 5. Data demo

`backend/seed_data.py` membuat data awal secara idempotent. Periksa file tersebut untuk akun demo yang berlaku pada checkout saat ini. Jangan gunakan password demo di production.

Untuk menjalankan ulang seed:

```bash
./seed_database.sh
```

Jika user awal sudah ada, seed dapat selesai tanpa menambahkan data; ini perilaku normal.

## 6. Workflow development

Terminal yang umum digunakan:

1. `./start_backend.sh` untuk FastAPI dengan reload.
2. `./start_frontend.sh` untuk React development server.
3. Terminal tambahan untuk test, Git, atau query PostgreSQL.

Setelah mengubah schema ORM, ingat bahwa `create_all()` tidak mengubah tabel existing. Gunakan database development baru atau tambahkan migrasi Alembic yang eksplisit.

## 7. Testing

```bash
# Source and script syntax checks
bash -n setup.sh start_backend.sh start_frontend.sh seed_database.sh
python3.11 -m py_compile $(find backend -name '*.py' -type f | sort)

# Backend smoke check setelah ./start_backend.sh berjalan
curl http://localhost:8001/api/
curl http://localhost:8001/api/settings

# Frontend tests and production compile
cd frontend
npm test -- --watchAll=false
npm run build
```

Checklist manual:

- halaman publik dan course detail tampil;
- register, login, logout berfungsi;
- token invalid dibersihkan saat refresh;
- enrollment tidak dapat dibuat dua kali;
- progress lesson tersimpan;
- quiz/discussion/certificate dapat diakses user valid;
- instructor hanya mengubah course miliknya;
- endpoint admin menolak non-admin.

## 8. Troubleshooting

### PostgreSQL connection refused

Pastikan PostgreSQL aktif dan portnya benar. Uji koneksi dengan `psql` menggunakan kredensial yang sama.

### `password authentication failed`

Reset password user PostgreSQL atau samakan nilai di `backend/.env`. URL-encode karakter khusus.

### Tabel tidak cocok dengan model

`create_all()` hanya membuat objek yang belum ada. Untuk development, gunakan migrasi atau recreate database jika datanya boleh dihapus. Jangan melakukan drop pada data penting.

### Backend dependency tidak ditemukan

```bash
source backend/.venv311/bin/activate
python -m pip install -r backend/requirements.txt
```

### Frontend API 404 atau URL `undefined/api`

Pastikan `REACT_APP_BACKEND_URL=http://localhost:8001`, tanpa `/api`. Restart `npm start` setelah edit `.env`.

### 401 dan 403

- 401 berarti token hilang, invalid, atau kedaluwarsa.
- 403 berarti token valid tetapi role/ownership tidak cukup.
- Login ulang setelah perubahan role agar token membawa role terbaru.

### Port terpakai

```bash
lsof -i :8001
lsof -i :3000
```

Hentikan proses yang tidak diperlukan atau jalankan service pada port lain dan sesuaikan konfigurasi frontend.

## 9. Kebersihan repository

Jangan commit:

- `backend/.env`, `frontend/.env`;
- `backend/venv/`, `frontend/node_modules/`;
- database dump berisi data sensitif;
- build output dan cache lokal.

## 10. Langkah berikutnya

- Baca [DOCUMENTATION.md](DOCUMENTATION.md) untuk gambaran menyeluruh.
- Baca [contracts.md](contracts.md) sebelum mengubah integrasi API.
- Baca [arsitektur.md](arsitektur.md) sebelum refactor lintas layer.
- Baca [infrastruktur.md](infrastruktur.md) untuk production deployment.
