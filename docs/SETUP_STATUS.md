# Status Setup dan Kesiapan — Nama Organisasi LMS

Audit terakhir: 2026-07-03.

## Status komponen

| Area | Status | Catatan |
|---|---|---|
| React frontend | Tersedia | Route publik, authenticated, instructor, admin |
| FastAPI backend | Tersedia | Semua router domain terpasang pada `/api` |
| PostgreSQL ORM | Tersedia | Async SQLAlchemy + asyncpg |
| Auto table creation | Tersedia | Cocok untuk development, bukan pengganti migrasi production |
| Seed data | Tersedia | Dijalankan saat startup dan melalui script |
| JWT authentication | Tersedia | HS256, lifetime 24 jam dalam kode |
| Dokumentasi OpenAPI | Tersedia | `/docs` dan `/openapi.json` |
| Versioned DB migrations | Belum | Alembic belum tersedia |
| Canonical automated backend suite | Belum | Masih berupa beberapa standalone scripts |
| CI/CD | Belum terdokumentasi/terlihat | Perlu pipeline build, test, audit |

## Checklist mesin developer

- [ ] PostgreSQL aktif dan database/user dibuat.
- [ ] `backend/.env` berisi `DATABASE_URL` dan random `SECRET_KEY`.
- [ ] `backend/venv` dibuat dan requirements terpasang.
- [ ] Health endpoint `http://localhost:8001/api/` berhasil.
- [ ] `frontend/.env` menunjuk origin backend tanpa `/api`.
- [ ] Dependencies frontend terpasang.
- [ ] `http://localhost:3000` dapat dibuka.
- [ ] Login dan alur role utama diuji.
- [ ] Build frontend production berhasil.

## Blocker sebelum production

- [ ] Batasi CORS ke origin resmi.
- [ ] Hilangkan penggunaan fallback JWT secret.
- [ ] Batasi role yang boleh dipilih saat public registration.
- [ ] Tambahkan Alembic dan prosedur migrasi/rollback.
- [ ] Nonaktifkan atau kontrol demo seed.
- [ ] Tambahkan rate limiting, logging terpusat, dan monitoring.
- [ ] Tambahkan test suite terisolasi dan CI.
- [ ] Aktifkan HTTPS, backup database, dan restore drill.
- [ ] Audit dependency Python/npm.

## Referensi

- Setup singkat: [QUICK_START.md](QUICK_START.md)
- Setup lengkap: [SETUP_LOKAL.md](SETUP_LOKAL.md)
- Operasional: [DOCUMENTATION.md](DOCUMENTATION.md)
- Production: [infrastruktur.md](infrastruktur.md)
