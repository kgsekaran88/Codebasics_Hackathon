#!/usr/bin/env bash
# Start FastAPI + React dashboard (two terminals or background jobs).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d .venv ]]; then
  echo "Create venv first: python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

source .venv/bin/activate
python scripts/build_processed_data.py 2>/dev/null || true

echo "API → http://127.0.0.1:8000"
uvicorn api.main:app --reload --host 127.0.0.1 --port 8000 &
API_PID=$!

if [[ ! -d web/node_modules ]]; then
  echo "Installing web dependencies…"
  (cd web && npm install)
fi

echo "Web → http://localhost:5173"
(cd web && npm run dev) &
WEB_PID=$!

trap 'kill $API_PID $WEB_PID 2>/dev/null' EXIT
wait
