#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
PORT="${FRONTEND_PORT:-3000}"
HOST="${FRONTEND_HOST:-0.0.0.0}"

fail() { printf '❌ %s\n' "$*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || fail "Node.js is missing. Install Node.js 20+ and run ./setup.sh."
command -v npm >/dev/null 2>&1 || fail "npm is missing."
[[ -f "$FRONTEND_DIR/.env" ]] || fail "frontend/.env is missing. Run ./setup.sh first."
[[ -f "$FRONTEND_DIR/package.json" ]] || fail "frontend/package.json is missing."
if [[ ! "$PORT" =~ ^[0-9]+$ ]] || (( PORT < 1 || PORT > 65535 )); then
    fail "FRONTEND_PORT must be a number from 1 to 65535."
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
    printf '📦 Frontend dependencies are missing; installing them now...\n'
    (cd "$FRONTEND_DIR" && npm install --legacy-peer-deps)
fi

if [[ ! -x "$FRONTEND_DIR/node_modules/.bin/craco" ]]; then
    fail "Frontend dependencies are incomplete. Run ./setup.sh again."
fi

REACT_APP_BACKEND_URL="$(sed -n 's/^REACT_APP_BACKEND_URL=//p' "$FRONTEND_DIR/.env" | tail -1 | tr -d '\r')"
REACT_APP_BACKEND_URL="${REACT_APP_BACKEND_URL%\"}"
REACT_APP_BACKEND_URL="${REACT_APP_BACKEND_URL#\"}"
[[ -n "$REACT_APP_BACKEND_URL" ]] \
    || fail "REACT_APP_BACKEND_URL is missing from frontend/.env."

export PORT HOST

printf '🚀 Starting Nama Organisasi LMS frontend\n'
printf '   App:     http://localhost:%s\n' "$PORT"
printf '   API:     %s/api\n' "${REACT_APP_BACKEND_URL%/}"
printf '   Bind:    %s:%s\n\n' "$HOST" "$PORT"

cd "$FRONTEND_DIR"
exec npm start
