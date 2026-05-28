#!/usr/bin/env bash
# Share TN dashboard via ngrok.
# Default: single tunnel → FastAPI :8000 (API + web/dist). Fallback: Vite :5173 + API :8000.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
LOG_DIR="${TMPDIR:-/tmp}/tn-rpc-ngrok-$$"
mkdir -p "$LOG_DIR"
API_PORT=8000
WEB_PORT=5173
UVICORN="${ROOT}/.venv/bin/uvicorn"
MODE="${NGROK_MODE:-auto}"

if ! command -v ngrok >/dev/null 2>&1; then
  echo "Install ngrok: https://ngrok.com/download"
  echo "Then: ngrok config add-authtoken <YOUR_TOKEN>"
  exit 1
fi

if [[ ! -x "$UVICORN" ]]; then
  echo "Missing venv. Run: python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

if [[ "$MODE" == "auto" ]]; then
  if [[ -f "${ROOT}/web/dist/index.html" ]]; then
    MODE=single
  else
    MODE=dev
  fi
fi

if [[ "$MODE" == "single" && ! -f "${ROOT}/web/dist/index.html" ]]; then
  echo "Building frontend (first run)..."
  (cd web && npm run build) >>"${LOG_DIR}/build.log" 2>&1
fi

api_ok() { curl -sf --max-time 3 "http://127.0.0.1:${API_PORT}/api/health" >/dev/null 2>&1; }
vite_ok() { curl -sf --max-time 3 "http://127.0.0.1:${WEB_PORT}/" >/dev/null 2>&1; }
frontend_ok() {
  if [[ "$MODE" == "single" ]]; then
    curl -sf --max-time 3 "http://127.0.0.1:${API_PORT}/" >/dev/null 2>&1
  else
    vite_ok
  fi
}

# One API process only (startup loads data ~20–30s)
pkill -f "uvicorn api.main:app" 2>/dev/null || true
sleep 1

echo "Starting API on :${API_PORT} (data load ~25s; log: ${LOG_DIR}/api.log)..."
nohup "$UVICORN" api.main:app --host 127.0.0.1 --port "$API_PORT" >"${LOG_DIR}/api.log" 2>&1 &
for _ in $(seq 1 120); do
  api_ok && break
  sleep 1
done

if ! api_ok; then
  echo "API did not start. Last lines of log:"
  tail -30 "${LOG_DIR}/api.log" 2>/dev/null || true
  exit 1
fi
echo "API OK: http://127.0.0.1:${API_PORT}/api/health"

TUNNEL_PORT="$API_PORT"
if [[ "$MODE" == "dev" ]]; then
  if ! vite_ok; then
    echo "Starting Vite on :${WEB_PORT} (log: ${LOG_DIR}/vite.log)..."
    (cd web && nohup npm run dev -- --host 0.0.0.0 --port "$WEB_PORT" >"${LOG_DIR}/vite.log" 2>&1 &)
    for _ in $(seq 1 90); do
      vite_ok && break
      sleep 1
    done
  fi
  if ! vite_ok; then
    echo "Vite did not start. Last lines of log:"
    tail -20 "${LOG_DIR}/vite.log" 2>/dev/null || true
    exit 1
  fi
  echo "Vite OK: http://127.0.0.1:${WEB_PORT}"
  TUNNEL_PORT="$WEB_PORT"
else
  if ! frontend_ok; then
    echo "Frontend not served on :${API_PORT}. Run: cd web && npm run build"
    exit 1
  fi
  echo "Frontend OK: http://127.0.0.1:${API_PORT}/ (from web/dist)"
fi

pkill -f "ngrok http" 2>/dev/null || true
sleep 1

echo "Starting ngrok tunnel to :${TUNNEL_PORT} (mode=${MODE})..."
nohup ngrok http "$TUNNEL_PORT" --log=stdout >"${LOG_DIR}/ngrok.log" 2>&1 &
sleep 4

PUBLIC_URL=""
for _ in $(seq 1 20); do
  PUBLIC_URL="$(curl -sf http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for t in data.get('tunnels', []):
        if t.get('proto') == 'https':
            print(t['public_url'])
            break
except Exception:
    pass
" 2>/dev/null || true)"
  [[ -n "$PUBLIC_URL" ]] && break
  sleep 1
done

echo ""
echo "=============================================="
if [[ -n "$PUBLIC_URL" ]]; then
  echo "  Public dashboard URL:"
  echo "  ${PUBLIC_URL}"
  echo ""
  echo "  (First visit may show ngrok interstitial — click Continue)"
  if api_ok; then
    echo "  API check: ${PUBLIC_URL}/api/health"
  fi
else
  echo "  ngrok started; open http://127.0.0.1:4040 for the public URL"
fi
echo "  Local:  http://127.0.0.1:${TUNNEL_PORT}"
echo "  Mode:   ${MODE} (set NGROK_MODE=dev for Vite hot-reload)"
echo "  Logs:   ${LOG_DIR}/"
echo "  Stop:   pkill -f 'ngrok http'; pkill -f 'uvicorn api.main'"
echo "=============================================="
echo ""
tail -f "${LOG_DIR}/ngrok.log" 2>/dev/null || wait
