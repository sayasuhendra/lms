#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
VENV_DIR="$BACKEND_DIR/.venv311"

fail() { printf '❌ %s\n' "$*" >&2; exit 1; }

[[ -x "$VENV_DIR/bin/python" ]] || fail "Python environment is missing. Run ./setup.sh first."
[[ -f "$BACKEND_DIR/.env" ]] || fail "backend/.env is missing. Run ./setup.sh first."

"$VENV_DIR/bin/python" - "$BACKEND_DIR/.env" <<'PY' \
    || fail "backend/.env must define DATABASE_URL with postgresql+asyncpg:// and a non-empty SECRET_KEY."
import sys
from dotenv import dotenv_values

config = dotenv_values(sys.argv[1])
database_url = config.get("DATABASE_URL", "")
secret_key = config.get("SECRET_KEY", "")
raise SystemExit(0 if database_url.startswith("postgresql+asyncpg://") and secret_key else 1)
PY

printf '🌱 Seeding database with initial data...\n\n'

cd "$BACKEND_DIR"
"$VENV_DIR/bin/python" - <<'PY'
import asyncio

from database import init_db
from seed_data import seed_initial_data

async def main():
    await init_db()
    await seed_initial_data()

asyncio.run(main())
PY

printf '\n✅ Database seeding completed.\n'
