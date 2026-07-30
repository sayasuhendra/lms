# Nama Organisasi Learning Management System — Documentation

This directory is the source of truth for the Nama Organisasi LMS project. The current application is a React 19 single-page frontend backed by a FastAPI API and PostgreSQL through async SQLAlchemy.

## Start here

| Goal | Document |
|---|---|
| Run the application quickly | [QUICK_START.md](QUICK_START.md) |
| Install a clean local environment | [SETUP_LOKAL.md](SETUP_LOKAL.md) |
| Understand features, configuration, data, and operations | [DOCUMENTATION.md](DOCUMENTATION.md) |
| Inspect every implemented API route | [contracts.md](contracts.md) |
| Understand components and data flow | [arsitektur.md](arsitektur.md) |
| Plan a production deployment | [infrastruktur.md](infrastruktur.md) |
| Understand the frontend package | [frontend/README.md](frontend/README.md) |

## Supporting records

These files provide useful history, but are not the primary setup instructions:

| Document | Purpose |
|---|---|
| [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md) | Final MongoDB-to-PostgreSQL migration record |
| [MIGRATION_POSTGRESQL.md](MIGRATION_POSTGRESQL.md) | Migration plan and query-pattern notes |
| [MIGRATION_STATUS.md](MIGRATION_STATUS.md) | Historical migration status snapshot |
| [CLEANUP_MONGODB.md](CLEANUP_MONGODB.md) | MongoDB cleanup record |
| [SETUP_INSTRUKSI.md](SETUP_INSTRUKSI.md) | Short Indonesian installation guide |
| [SETUP_STATUS.md](SETUP_STATUS.md) | Current readiness checklist |
| [test_result.md](test_result.md) | Internal test-agent record; not end-user documentation |

## Current system at a glance

- Frontend: React 19, React Router, Axios, Tailwind CSS, Radix UI, i18next.
- Backend: Python, FastAPI, Pydantic, JWT bearer authentication.
- Database: PostgreSQL, SQLAlchemy async ORM, `asyncpg`.
- Roles: `student`, `instructor`, and `admin`.
- Main flows: registration/login, course discovery, enrollment, lesson progress, quizzes, discussions, certificates, instructor course management, and admin user management.
- Local URLs: frontend `http://localhost:3000`, API `http://localhost:8001/api`, OpenAPI UI `http://localhost:8001/docs`.
- Local automation: `./setup.sh` prepares dependencies/configuration; `start_backend.sh` and `start_frontend.sh` validate their environment before launching.

## Documentation conventions

- Commands assume the repository root unless a preceding command changes directories.
- Never commit real `.env` secrets.
- The FastAPI OpenAPI page is the definitive runtime schema if it differs from a written example.
- Historical documents contain a notice at the top and should not override the current guides above.

## License

This project is licensed under the MIT License. See the repository root `LICENSE` file for details.

Last code audit: 2026-07-03.
