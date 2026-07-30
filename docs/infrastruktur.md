# Infrastruktur dan Deployment Nama Organisasi LMS

Dokumen ini memberi baseline operasional untuk development dan production. Nilai kapasitas harus ditentukan ulang dari hasil load test nyata.

## 1. Komponen runtime

| Komponen | Development | Production recommendation |
|---|---|---|
| Frontend | React dev server :3000 | Static `frontend/build/` behind CDN/web server |
| API | Uvicorn reload :8001 | Multiple ASGI workers behind HTTPS proxy/LB |
| Database | Local PostgreSQL | Managed PostgreSQL with private networking/TLS |
| Secrets | Local `.env` | Secret manager or protected runtime environment |
| Logs | Console | Central structured logging and alerting |

## 2. Build artifacts

Frontend:

```bash
cd frontend
npm ci --legacy-peer-deps
REACT_APP_BACKEND_URL=https://api.example.com npm run build
```

Deploy `frontend/build/` with SPA fallback to `index.html`.

Backend dependencies:

```bash
python3.11 -m venv .venv311
source .venv311/bin/activate
python -m pip install --requirement backend/requirements.txt
```

Run from `backend/` so `server:app` and local imports resolve:

```bash
uvicorn server:app --host 0.0.0.0 --port 8001
```

For production, select a process manager/container strategy and tune worker count from CPU, memory, connection-pool, and load-test evidence.

## 3. Required production configuration

```dotenv
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@DB_HOST:5432/DB_NAME
SECRET_KEY=long-random-production-secret
```

Frontend build:

```dotenv
REACT_APP_BACKEND_URL=https://api.example.com
```

Do not bake database credentials into frontend artifacts. Rotate secrets through the hosting platform and document ownership and emergency procedures.

## 4. Network and TLS

- Expose only ports 80/443 publicly.
- Keep PostgreSQL on private networking/firewall allowlists.
- Terminate TLS at a maintained reverse proxy or load balancer.
- Redirect HTTP to HTTPS and enable security headers.
- Restrict backend CORS to exact frontend origin(s).
- If API and SPA share one domain, route `/api` to FastAPI and everything else to the SPA with fallback.

## 5. Database lifecycle

### Migration

The current code calls SQLAlchemy `create_all()` at startup. It does not upgrade existing columns or constraints. Before production, add Alembic and use this release order:

1. Back up and verify restore readiness.
2. Run backward-compatible migrations.
3. Deploy API instances.
4. Deploy frontend.
5. Run smoke tests and monitor errors.
6. Apply destructive cleanup only in a later release.

### Backup

At minimum:

- automated encrypted backups;
- point-in-time recovery where available;
- retention policy matching business requirements;
- restore tests in an isolated environment;
- monitoring for backup failures.

Example logical backup:

```bash
pg_dump --format=custom --no-owner "$DATABASE_URL" > organization_lms.dump
pg_restore --list organization_lms.dump
```

Do not treat a successful backup command as proof that restoration works.

## 6. Security controls

- Force public registration to the intended lowest-privilege role.
- Use a strong unique JWT signing secret; define rotation procedures.
- Add login and write-endpoint rate limiting.
- Keep dependencies patched and run `pip-audit`/`npm audit` with human review.
- Prevent secrets and database dumps from entering Git or logs.
- Run services as non-root users with minimal filesystem permissions.
- Validate reverse-proxy client IP/header trust settings.
- Add Content Security Policy appropriate for external image/avatar domains.
- Review personal-data retention and deletion requirements.

## 7. Observability

Collect:

- request count, latency percentiles, and 4xx/5xx rates;
- ASGI worker restarts and saturation;
- PostgreSQL connections, query latency, locks, storage, and replication/backup health;
- frontend JavaScript errors and failed API requests;
- authentication failures and suspicious admin operations.

Correlate requests with a request ID and avoid logging tokens, passwords, or sensitive profile data.

Recommended alerts include sustained 5xx rate, high p95 latency, database connection exhaustion, storage pressure, backup failure, and certificate expiry.

## 8. Scaling

Start with one modest API service and managed PostgreSQL, then measure. Safe scale-out requires:

- stateless API instances (current JWT design supports this);
- shared PostgreSQL rather than local state;
- database pool limits coordinated across workers/instances;
- CDN caching for static frontend and images;
- pagination and indexes for growing datasets;
- load tests around course listing, enrollment, and admin searches.

JSON-heavy curriculum and quiz fields simplify initial development but may become costly for fine-grained queries. Normalize them only when measured query/product needs justify it.

## 9. CI/CD quality gates

A release pipeline should:

1. install dependencies from lock files;
2. scan secrets and dependencies;
3. run backend and frontend tests;
4. compile the React production build;
5. validate migrations against a disposable PostgreSQL instance;
6. publish immutable artifacts;
7. deploy to staging and run smoke tests;
8. require approval for production;
9. verify health and support rollback.

## 10. Production checklist

- [ ] DNS and HTTPS are active.
- [ ] CORS is restricted.
- [ ] Production secrets are externalized and rotated.
- [ ] Registration cannot self-assign elevated roles.
- [ ] Alembic migrations are present and rehearsed.
- [ ] Demo seed behavior is disabled or controlled.
- [ ] Backups and restore drill succeed.
- [ ] Logs, metrics, traces/errors, and alerts are connected.
- [ ] Rate limiting and dependency audits are enabled.
- [ ] Frontend/API/database smoke tests pass.
- [ ] Rollback owner and procedure are documented.

See [arsitektur.md](arsitektur.md) for component boundaries and [DOCUMENTATION.md](DOCUMENTATION.md) for application behavior.
