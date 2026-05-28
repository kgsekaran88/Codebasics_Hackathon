# Dashboard QA checklist

Stack: **React** (`web/`) + **FastAPI** (`api/`). Legacy Streamlit under `dashboard/` is not used for submission.

## Playwright E2E (recommended)

```bash
cd web
npm install
npm run test:e2e          # uses system Google Chrome (channel: chrome)
```

Expect **56 tests** (navigation, charts, filters, viewport, API contract). Re-run after UI changes and update this doc with the latest pass count.

Report: `cd web && npm run test:e2e:report`

## Automated API smoke test

```bash
source .venv/bin/activate
uvicorn api.main:app --port 8000 &
python scripts/test_dashboard_api.py
```

## Manual UI checklist (each nav page)

| Route | Nav label | Fit / scroll | Interactivity | Notes |
|-------|-----------|--------------|---------------|-------|
| `/` | Editorial brief | Scroll | Links to story pages | 60-min run-of-show, three core threads, limitations |
| `/margins` | Margins | Viewport charts | dataZoom on scatter | Lead story — fragmentation |
| `/flows` | Seat flows | Viewport charts | “All flows” toggle | Lead story — 2021→2026 transitions |
| `/overview` | Statewide | Viewport charts | Year 2021/2026; region chips; tile → detail | Lead story — KPIs, mosaic, vote share |
| `/explorer` | Explorer | Scroll (table) | Filters; scatter click | Producer drill-down |
| `/geography` | Geography | Viewport charts | Map mode; year on stacks | Supporting — regional pattern |
| `/reserved` | Reserved seats | Viewport charts | — | Supporting — GEN/SC/ST counts |
| `/depth` | Ballots & turnout | Viewport charts | — | 2021 turnout only; limitation banner |
| `/deep` | Deep insights | Scroll (5 panels) | — | Electoral arithmetic — ENP, Pedersen, Gallagher, swing heatmap, representation gap, district churn |
| `/methods` | Sources | Scroll | — | Definitions, data scope, caveats |

Insight panels show **page-specific bullets** from `/api/insights?year=` (no Q1–Q6 labels in the UI).

## Year filter regression

Playwright: `year toggle updates KPIs, mosaic, and bar charts` on **`/overview`** — 2021 shows DMK 133 seats, zero TVK tiles; 2026 shows TVK tiles.

Manual: toggle 2021 on Statewide → mosaic mostly DMK/AIADMK, KPIs show DMK 133.

## Reuse for another election

See **`docs/DASHBOARD_REUSE.md`** and **`config/election.json`**. No in-app CSV upload — swap `data/raw/` files and rebuild processed CSVs.

## Viz best practices applied

- **No 3D pie** — vote share uses horizontal bars.
- **Equal-weight tiles** — NPR-style mosaic (234 = 18×13).
- **Year toggle** — 2021 | 2026 on Statewide + Geography; KPIs/mosaic/bars follow year.
- **Sankey** for seat flows (AP VoteCast pattern).
- **Descriptive copy** — no causal or predictive language.
- **Charts resize** — `EChart` uses `ResizeObserver` when `height="fill"`.
- **Party colors** documented in `web/src/lib/colors.ts`.

## Known limits

- Explorer, Sources, and Deep insights scroll by design (long tables / multi-panel layout).
- Sankey with “all flows” can be dense on small laptops — use default top flows for recording.
- 2026 turnout not in starter CSV — optional ECI scrape to `data/external/`.
- District map is **2026-only**; flip mode is 2021→2026.
- Mobile: hamburger nav; pages scroll vertically on small screens.
- Swing heatmap colors are diverging (red = loss, green = gain) — labels include sign for accessibility.

## Local run modes

| Mode | Command | URL |
|------|---------|-----|
| Dev (hot reload) | `uvicorn api.main:app --port 8000` + `cd web && npm run dev` | http://127.0.0.1:5173 |
| Single port | `cd web && npm run build` then `uvicorn api.main:app --port 8000` | http://127.0.0.1:8000 |
| Share | `bash scripts/ngrok_share.sh` | ngrok URL → :8000 |
