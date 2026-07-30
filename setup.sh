#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv311"

info() { printf 'ℹ️  %s\n' "$*"; }
success() { printf '✅ %s\n' "$*"; }
warn() { printf '⚠️  %s\n' "$*" >&2; }
fail() { printf '❌ %s\n' "$*" >&2; exit 1; }

command_exists() { command -v "$1" >/dev/null 2>&1; }

on_error() {
    local exit_code=$?
    printf '❌ Setup failed near line %s (exit %s).\n' "${BASH_LINENO[0]}" "$exit_code" >&2
    exit "$exit_code"
}
trap on_error ERR

printf '\nNama Organisasi LMS local setup\n===============================\n\n'

command_exists node || fail "Node.js is required. Install Node.js 20 LTS or newer."
command_exists npm || fail "npm is required."

PYTHON_BIN=""
for candidate in python3.11 python3 python; do
    if command_exists "$candidate" && "$candidate" -c \
        'import sys; raise SystemExit(0 if sys.version_info[:2] == (3, 11) else 1)' \
        >/dev/null 2>&1; then
        PYTHON_BIN="$(command -v "$candidate")"
        break
    fi
done
[[ -n "$PYTHON_BIN" ]] || fail "Python 3.11 is required by the pinned backend dependencies."

node -e 'const major=Number(process.versions.node.split(".")[0]); process.exit(major >= 20 ? 0 : 1)' \
    || fail "Node.js 20 or newer is required."

success "Runtime requirements found: $($PYTHON_BIN --version), Node $(node --version), npm $(npm --version)."

if [[ ! -d "$VENV_DIR" ]]; then
    info "Creating Python virtual environment..."
    "$PYTHON_BIN" -m venv "$VENV_DIR"
else
    info "Reusing existing Python virtual environment."
fi

info "Installing backend dependencies..."
"$VENV_DIR/bin/python" -m pip install --upgrade pip
"$VENV_DIR/bin/python" -m pip install --requirement "$BACKEND_DIR/requirements.txt"
success "Backend dependencies installed."

info "Installing frontend dependencies from package-lock.json..."
(
    cd "$FRONTEND_DIR"
    npm install --legacy-peer-deps
)
success "Frontend dependencies installed."

if [[ ! -f "$BACKEND_DIR/.env" ]]; then
    command_exists openssl || warn "openssl not found; using Python to generate SECRET_KEY."
    if command_exists openssl; then
        SECRET_KEY="$(openssl rand -hex 48)"
    else
        SECRET_KEY="$("$VENV_DIR/bin/python" -c 'import secrets; print(secrets.token_urlsafe(48))')"
    fi

    DEFAULT_DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/organization_lms"
    DATABASE_URL="$DEFAULT_DATABASE_URL"
    if [[ -t 0 ]]; then
        printf 'PostgreSQL DATABASE_URL [%s]: ' "$DEFAULT_DATABASE_URL"
        read -r entered_database_url
        DATABASE_URL="${entered_database_url:-$DEFAULT_DATABASE_URL}"
    fi

    {
        printf '# PostgreSQL Database Configuration\n'
        printf 'DATABASE_URL=%s\n\n' "$DATABASE_URL"
        printf '# JWT signing secret\n'
        printf 'SECRET_KEY=%s\n' "$SECRET_KEY"
    } > "$BACKEND_DIR/.env"
    success "Created backend/.env."
else
    info "Keeping existing backend/.env unchanged."
fi

if [[ ! -f "$FRONTEND_DIR/.env" ]]; then
    {
        printf '# Backend origin; frontend appends /api\n'
        printf 'REACT_APP_BACKEND_URL=http://localhost:8001\n'
    } > "$FRONTEND_DIR/.env"
    success "Created frontend/.env."
else
    info "Keeping existing frontend/.env unchanged."
fi

"$VENV_DIR/bin/python" - "$BACKEND_DIR/.env" <<'PY' \
    || fail "backend/.env must define DATABASE_URL with postgresql+asyncpg:// and a non-empty SECRET_KEY."
import sys
from dotenv import dotenv_values

config = dotenv_values(sys.argv[1])
database_url = config.get("DATABASE_URL", "")
secret_key = config.get("SECRET_KEY", "")
valid = database_url.startswith("postgresql+asyncpg://") and bool(secret_key)
raise SystemExit(0 if valid else 1)
PY

info "Checking PostgreSQL and initializing tables..."
if ! (
    cd "$BACKEND_DIR"
    "$VENV_DIR/bin/python" - <<'PY'
import asyncio
from database import engine, init_db

async def main():
    await init_db()
    await engine.dispose()

asyncio.run(main())
PY
); then
    fail "Could not connect to PostgreSQL. Start PostgreSQL, create the database/user, update backend/.env, then rerun ./setup.sh."
fi
success "PostgreSQL connection succeeded and tables are ready."

printf '\nSetup complete.\n\n'
printf 'Start the services in separate terminals:\n'
printf '  ./start_backend.sh\n'
printf '  ./start_frontend.sh\n\n'
printf 'Open http://localhost:3000 (API docs: http://localhost:8001/docs).\n'
