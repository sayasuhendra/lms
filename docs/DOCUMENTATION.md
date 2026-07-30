# Nama Organisasi Learning Management System — Complete Guide

## 1. Purpose and scope

Nama Organisasi LMS is a role-based learning platform. Students discover and enroll in courses, track lessons, take quizzes, join discussions, and receive certificates. Instructors manage their courses. Administrators manage users, roles, and dashboard statistics.

This guide describes the code in this repository as audited on 2026-07-03. For exact request and response contracts, see [contracts.md](contracts.md).

## 2. Implemented capabilities

### Public

- Browse, filter, search, and inspect courses.
- Register and log in.
- Switch between Indonesian and English frontend translations.

### Student

- Enroll once per course.
- View owned enrollments and progress.
- Mark lessons complete or incomplete; progress is recalculated from curriculum size.
- Load and submit quizzes.
- Read and create course discussions and like discussion entries.
- Generate and retrieve certificates after course completion requirements are satisfied by the backend.
- View and update a personal profile.

### Instructor

- All authenticated-user capabilities.
- Create courses.
- List, update, and delete courses owned by the instructor.

### Administrator

- List and search users with pagination and role filters.
- Inspect user enrollment details.
- Create users, change roles, and delete users.
- View user, course, and enrollment totals.
- Update the runtime organization name shown in the UI.
- Self-protection rules prevent an admin from deleting their own account or removing their own admin role.

## 3. Technology stack

| Layer | Technology |
|---|---|
| Browser application | React 19, React Router 7, Axios, Tailwind CSS, Radix UI |
| Localization | i18next and react-i18next |
| API | FastAPI and Uvicorn |
| Validation | Pydantic |
| Authentication | JWT bearer tokens, python-jose, Passlib/bcrypt |
| Persistence | PostgreSQL, SQLAlchemy async ORM, asyncpg |
| Tests | Source syntax checks, frontend test runner, and manual API smoke checks |

## 4. Repository structure

```text
lms-organisasi/
├── backend/
│   ├── routes/              # Route modules grouped by domain
│   ├── auth.py              # Password hashing, JWT, role dependencies
│   ├── database.py          # Async engine, ORM tables, sessions
│   ├── models.py            # Pydantic request/response schemas
│   ├── seed_data.py         # Idempotent demo data
│   ├── server.py            # FastAPI composition and startup
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Shared and UI components
│   │   ├── context/         # Authentication and runtime app settings state
│   │   ├── i18n/            # Translation configuration and catalogs
│   │   ├── pages/           # Route-level screens
│   │   └── services/api.js  # Axios API client
│   └── package.json
├── docs/                    # All project documentation
├── start_backend.sh
├── start_frontend.sh
└── seed_database.sh
```

Generated directories such as `frontend/node_modules`, `frontend/build`, `backend/.venv311`, and Python caches are not source code and should not be committed.

## 5. Configuration

### Backend: `backend/.env`

| Variable | Required | Example | Notes |
|---|---:|---|---|
| `DATABASE_URL` | Yes | `postgresql+asyncpg://user:pass@localhost:5432/organization_lms` | Must use an async SQLAlchemy driver URL |
| `SECRET_KEY` | Yes outside throwaway development | random 48+ byte value | Used to sign JWTs |

`backend/auth.py` currently hard-codes `HS256` and a 24-hour expiration. Although the checked-in sample environment contains `ALGORITHM` and `ACCESS_TOKEN_EXPIRE_MINUTES`, those keys currently have no effect.

### Frontend: `frontend/.env`

| Variable | Required | Example | Notes |
|---|---:|---|---|
| `REACT_APP_BACKEND_URL` | Yes | `http://localhost:8001` | Origin only; `services/api.js` appends `/api` |

React reads environment values at startup/build time. Restart `npm start` after changing `.env`.

## 6. Database model

All primary keys are string UUIDs. JSON columns store course skills, subtitles, curriculum, quiz questions, and completed lesson IDs.

| Table | Purpose | Important constraints |
|---|---|---|
| `users` | Identity, role, profile, password hash | Unique indexed email |
| `courses` | Course metadata and JSON curriculum | Required instructor FK |
| `enrollments` | User-course membership and progress | Unique `(user_id, course_id)` |
| `quizzes` | Lesson quiz and JSON questions | Course FK; indexed lesson ID |
| `discussions` | Course discussion posts | Course FK; denormalized author display fields |
| `certificates` | Completion certificate record | Unique `(user_id, course_id)` |
| `app_settings` | Runtime application settings such as organization name | Primary key `key` |

Foreign-key relationships use ORM cascades for several parent-owned records. Schema creation uses `Base.metadata.create_all()` at API startup; this creates missing tables but is not a versioned migration system. Production schema changes should use Alembic before rolling deployments.

The default runtime organization name is `Nama Organisasi`. Administrators can update it from the admin dashboard; the frontend reads it from `/api/settings` and displays it in the navbar, authentication screens, and landing page.

## 7. Authentication and authorization

1. Registration or login returns `{success, user, token}`.
2. The frontend stores `token` and a cached `user` in `localStorage`.
3. Axios sends `Authorization: Bearer <token>` on subsequent requests.
4. The backend validates signature and expiry, then reads `sub`, `email`, and `role` claims.
5. Instructor/admin dependencies enforce role-specific endpoints.

Important current limitations:

- The backend CORS policy allows every origin while also allowing credentials. Restrict origins in production.
- A fallback development `SECRET_KEY` exists in code. Production must set a strong secret.
- Tokens cannot currently be revoked server-side before expiry.
- Role information is carried in the token until a new token is issued; role changes may not affect an existing token immediately.
- Storing JWTs in `localStorage` makes XSS prevention especially important.
- Public registration accepts a role field. If self-service instructor/admin creation is not intended, constrain it server-side before production.

## 8. Application lifecycle and data seeding

FastAPI startup calls `init_db()` and then `seed_initial_data()`. The seed checks for existing users before inserting demo users, courses, and quiz data, so normal restarts should not duplicate the initial dataset.

Run the seed independently with `./seed_database.sh`. Review `backend/seed_data.py` before using demo credentials on any shared environment, and never use seeded passwords in production.

## 9. Local development

Use [QUICK_START.md](QUICK_START.md) for the shortest path or [SETUP_LOKAL.md](SETUP_LOKAL.md) for clean-machine instructions.

Development endpoints:

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| API health | `http://localhost:8001/api/` |
| Swagger UI | `http://localhost:8001/docs` |
| OpenAPI JSON | `http://localhost:8001/openapi.json` |

## 10. Testing and verification

### Backend

```bash
bash -n setup.sh start_backend.sh start_frontend.sh seed_database.sh
python3.11 -m py_compile $(find backend -name '*.py' -type f | sort)
curl http://localhost:8001/api/
curl http://localhost:8001/api/settings
```

For an environment-independent automated suite, the project should add pytest fixtures with a disposable PostgreSQL database.

### Frontend

```bash
cd frontend
npm test -- --watchAll=false
npm run build
```

### Manual release smoke test

- Health endpoint and OpenAPI load.
- Registration, login, logout, and expired/invalid token handling work.
- Public course list/detail work.
- Student enrollment is duplicate-safe and progress persists.
- Quiz scoring, discussion creation/like, and certificate rules work.
- Instructor cannot modify another instructor's course.
- Non-admin requests to `/api/admin/*` return 403.
- Admin self-protection rules work.
- Frontend refresh restores a valid session and clears an invalid one.

## 11. Production readiness checklist

- Use a managed PostgreSQL service or protected database host with backups and TLS.
- Replace the default JWT secret and keep secrets outside Git.
- Restrict CORS to deployed frontend origins.
- Put the API behind HTTPS and a reverse proxy/load balancer.
- Serve the frontend's production build from a static host or web server.
- Add Alembic migrations and run them as a controlled deployment step.
- Disable or protect demo seeding in production.
- Centralize structured logs and error monitoring.
- Add rate limits to authentication and write endpoints.
- Validate role assignment during public registration.
- Run dependency audits and automated tests in CI.
- Define database backup restore drills, not only backup creation.

## 12. Troubleshooting

### API cannot connect to PostgreSQL

- Confirm PostgreSQL is listening and credentials/database exist.
- Confirm the URL begins with `postgresql+asyncpg://`.
- URL-encode special characters in passwords.
- Test the account with `psql` separately.

### API starts but a table/column is missing

`create_all()` does not alter existing tables. Reconcile the schema manually in development or introduce an Alembic migration. Do not drop production data as a shortcut.

### Frontend requests use `undefined/api`

Set `REACT_APP_BACKEND_URL`, stop the React server, and restart it.

### 401 or 403 responses

- 401: token absent, invalid, or expired. Log in again.
- 403: valid token but insufficient role.
- After an admin changes a role, issue a fresh login token.

### Seed appears to do nothing

The seed is intentionally idempotent and exits when initial users already exist. Inspect the database before assuming failure.

## 13. Known technical debt

- No Alembic migration history.
- CORS is development-wide.
- Auth algorithm and expiry are hard-coded rather than environment-driven.
- Standalone backend test scripts overlap and need consolidation.
- Course curriculum and quiz structures rely heavily on JSON columns.
- Some content URLs use third-party image/avatar services.
- The frontend route guard checks authentication but page-level role handling must remain aligned with backend enforcement.

## 14. Related documentation

- [API contract](contracts.md)
- [Architecture](arsitektur.md)
- [Infrastructure and deployment](infrastruktur.md)
- [Local setup](SETUP_LOKAL.md)
- [Migration completion record](MIGRATION_COMPLETE.md)
