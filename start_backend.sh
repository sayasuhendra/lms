#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
VENV_DIR="$BACKEND_DIR/.venv311"
HOST="${BACKEND_HOST:-0.0.0.0}"
PORT="${BACKEND_PORT:-8001}"
RELOAD="${BACKEND_RELOAD:-true}"

fail() { printf '❌ %s\n' "$*" >&2; exit 1; }

[[ -x "$VENV_DIR/bin/python" ]] || fail "Python environment is missing. Run ./setup.sh first."
[[ -f "$BACKEND_DIR/.env" ]] || fail "backend/.env is missing. Run ./setup.sh first."

if [[ ! "$PORT" =~ ^[0-9]+$ ]] || (( PORT < 1 || PORT > 65535 )); then
    fail "BACKEND_PORT must be a number from 1 to 65535."
fi

if ! "$VENV_DIR/bin/python" -c 'import fastapi, sqlalchemy, asyncpg, uvicorn' >/dev/null 2>&1; then
    fail "Backend dependencies are incomplete. Run ./setup.sh again."
fi

"$VENV_DIR/bin/python" - "$BACKEND_DIR/.env" <<'PY' \
    || fail "backend/.env must define DATABASE_URL with postgresql+asyncpg:// and a non-empty SECRET_KEY."
import sys
from dotenv import dotenv_values

config = dotenv_values(sys.argv[1])
database_url = config.get("DATABASE_URL", "")
secret_key = config.get("SECRET_KEY", "")
raise SystemExit(0 if database_url.startswith("postgresql+asyncpg://") and secret_key else 1)
PY

args=(server:app --host "$HOST" --port "$PORT")
if [[ "$RELOAD" == "true" || "$RELOAD" == "1" ]]; then
    args+=(--reload)
fi

printf '🚀 Starting Nama Organisasi LMS backend\n'
printf '   API:  http://localhost:%s/api/\n' "$PORT"
printf '   Docs: http://localhost:%s/docs\n' "$PORT"
printf '   Bind: %s:%s | Reload: %s\n\n' "$HOST" "$PORT" "$RELOAD"

cd "$BACKEND_DIR"
exec "$VENV_DIR/bin/python" -m uvicorn "${args[@]}"
