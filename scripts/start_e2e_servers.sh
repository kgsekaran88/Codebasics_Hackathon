#!/usr/bin/env bash
# Used by Playwright webServer — starts API only (Vite started separately in playwright.config).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
source .venv/bin/activate
exec uvicorn api.main:app --host 127.0.0.1 --port 8000
