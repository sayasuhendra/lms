# Quick Start — Nama Organisasi LMS

Use this guide when PostgreSQL, Python, and Node.js are already installed. For a clean-machine setup, use [SETUP_LOKAL.md](SETUP_LOKAL.md).

## Prerequisites

- PostgreSQL running locally or reachable over the network
- Python 3.11 or newer
- Node.js 20 LTS or newer and npm

## 1. Create the PostgreSQL database

```sql
CREATE USER org_user WITH PASSWORD 'replace-with-a-strong-password';
CREATE DATABASE organization_lms OWNER org_user;
```

## Automated setup

From the project root, the idempotent setup script creates the Python environment, installs backend/frontend dependencies, creates missing `.env` files, validates PostgreSQL, and initializes tables:

```bash
./setup.sh
```

Existing `.env` files are never overwritten. Continue with the manual sections below only when you need custom configuration or when PostgreSQL must be prepared first.

## 2. Configure the backend

Create `backend/.env`:

```dotenv
DATABASE_URL=postgresql+asyncpg://org_user:replace-with-a-strong-password@localhost:5432/organization_lms
SECRET_KEY=replace-with-a-long-random-value
```

Generate a suitable development secret with:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

The current authentication implementation uses HS256 tokens with a 24-hour lifetime. `ALGORITHM` and `ACCESS_TOKEN_EXPIRE_MINUTES` values in `.env` are not currently read by `backend/auth.py`.

## 3. Install and start the backend

```bash
cd backend
python3.11 -m venv .venv311
source .venv311/bin/activate
python -m pip install -r requirements.txt
cd ..
./start_backend.sh
```

At startup, the API creates missing tables and runs the idempotent seed routine. You can also seed explicitly:

```bash
./seed_database.sh
```

Verify the API:

```bash
curl http://localhost:8001/api/
```

Expected response:

```json
{"message":"LearnHub API is running","version":"1.0.0"}
```

## 4. Configure and start the frontend

Create `frontend/.env`:

```dotenv
REACT_APP_BACKEND_URL=http://localhost:8001
```

Then open a second terminal:

```bash
cd frontend
npm install --legacy-peer-deps
cd ..
./start_frontend.sh
```

Open `http://localhost:3000`.

## 5. Smoke test

1. Open the course catalog without logging in.
2. Register a student account or use a seeded account listed by `backend/seed_data.py`.
3. Log in and open **My Learning**.
4. Enroll in a course and update lesson progress.
5. Confirm API requests return 2xx responses in the browser network panel.

## Common commands

```bash
./start_backend.sh       # API on port 8001
./start_frontend.sh      # React dev server on port 3000
./seed_database.sh       # Idempotent sample data seed

cd frontend && npm test -- --watchAll=false
cd frontend && npm run build
```

Launcher overrides are available through `BACKEND_HOST`, `BACKEND_PORT`, `BACKEND_RELOAD`, `FRONTEND_HOST`, and `FRONTEND_PORT`.

## Fast troubleshooting

- Database connection failure: verify PostgreSQL is running and `DATABASE_URL` uses the `postgresql+asyncpg://` scheme.
- Backend import failure: activate `backend/venv` and reinstall `backend/requirements.txt`.
- Frontend cannot reach API: ensure `REACT_APP_BACKEND_URL` contains the backend origin only, without `/api` or a trailing slash, then restart React.
- Port already in use: inspect with `lsof -i :8001` or `lsof -i :3000` and stop the conflicting process.
- Unauthorized response: log in again; the frontend stores the bearer token in browser `localStorage`.

See [DOCUMENTATION.md](DOCUMENTATION.md) for configuration, security caveats, testing, and operations.
