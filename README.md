# Tamil Nadu Assembly 2026 — AtliQ Election Briefing

Interactive briefing dashboard for **AtliQ Media**: neutral analysis of Tamil Nadu Legislative Assembly results (2021 vs 2026), built from public Election Commission of India data only.

*Codebasics Resume Project Challenge #21.*

## Disclaimer

Non-partisan data work. No political endorsement, predictions, or causal claims about why parties gained or lost seats.

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/build_processed_data.py

# API
uvicorn api.main:app --reload --port 8000

# Dashboard (separate terminal)
cd web && npm install && npm run dev
```

Open **http://localhost:5173**. The UI proxies `/api` to port 8000.

Production build (single port):

```bash
cd web && npm run build
uvicorn api.main:app --host 127.0.0.1 --port 8000
```

Share externally: `bash scripts/ngrok_share.sh`

## What you see in the app

| Section | Purpose |
|---------|---------|
| **Editorial brief** | Recommended 60-minute run-of-show and three core narrative threads |
| **Margins** | Fragmentation — margins, vote-share buckets, closest races |
| **Seat flows** | 2021→2026 Sankey and incumbent retention |
| **Statewide** | KPIs, mosaic, seat tally, vote share |
| **Explorer** | Filters + sortable constituency table |
| **Geography / Reserved / Ballots** | Supporting views — regional vote share, reserved comparison, turnout |
| **Deep insights** | Electoral arithmetic — ENP, Pedersen volatility, Gallagher LSq, swing heatmap, representation gap, district churn |
| **Sources** | Definitions, data scope, caveats |

Insight bullets on each page are computed from the same `data/processed/` tables as the charts.

## Data & metrics

| File | Role |
|------|------|
| `data/raw/tn_2021_results.csv` | 2021 candidate-level results |
| `data/raw/tn_2026_results.csv` | 2026 candidate-level results |
| `data/raw/constituency_master.csv` | 234 ACs — district, macro-region, reserved |
| `data/processed/` | Joined AC tables, Sankey edges, regional aggregates |

Join on **`ac_number`** (not constituency name). Definitions: `docs/METRIC_DEFINITIONS.md`.

**Note:** 2026 `turnout` is blank in the provided CSV. The pipeline reads `data/external/turnout_2026.csv` if present (template via `python scripts/fetch_eci_turnout_2026.py --template-only`); once filled from ECI Form-20, the `/depth` page automatically shows the Top-20 turnout-increase chart.

## Headline numbers (this build)

- **108** seats — normalized winner TVK (2026)
- **163** normalized seat flips (2021→2026), ~70% of ACs
- Mean winning margin **11.8%** (2021) → **7.7%** (2026)
- **61** winners below **35%** of valid votes (2026)

### Deep electoral arithmetic (Deep Insights page)

- **Effective Number of Parties** (Laakso–Taagepera): **3.74 → 4.29** statewide
- **Pedersen volatility**: **36.4** — academic literature flags 20+ as "very high"
- **Gallagher LSq disproportionality**: **15.2 → 8.7** — seats track votes more closely in 2026
- **132 of 234** ACs were multi-cornered races in 2026 (top-2 combined share < 70%)
- Definitions and constitutional context in `docs/METRIC_DEFINITIONS.md`

## Deck, video, and exports

```bash
python scripts/build_all_deliverables.py     # processed data + deck + charts + walkthrough
# Or step by step:
python scripts/build_processed_data.py
python scripts/build_presentation.py       # deck/TN_2026_AtliQ_Briefing.pptx (18 slides)
python scripts/export_charts.py            # outputs/charts/
python scripts/generate_walkthrough.py     # outputs/walkthrough/
```

Narration cues: `docs/VIDEO_NARRATION_SCRIPT.md`. QA: `docs/DASHBOARD_QA.md`. Reuse another election: `docs/DASHBOARD_REUSE.md`.

## Tests

```bash
cd web && npm run test:e2e
python scripts/test_dashboard_api.py   # API on :8000
```

## Repository map

| Path | Purpose |
|------|---------|
| `web/` | React + TypeScript + ECharts UI |
| `api/` | FastAPI over processed CSVs |
| `src/` | Metrics, normalization, charts |
| `scripts/` | Data build, exports, ngrok helper |
| `notebooks/` | Reproducible analysis |
| `config/election.json` | Jurisdiction metadata |
| `HACKATHON_EXECUTION_PLAN.md` | Internal execution checklist |
| `docs/DASHBOARD_QA.md` | Manual + E2E QA |
| `docs/DASHBOARD_REUSE.md` | Reuse pipeline for another election |
| `docs/VIDEO_NARRATION_SCRIPT.md` | Recording script aligned to routes |
| `deck/` | PowerPoint for video + RPC deck deliverable |

## Reproduce from a clean clone

```bash
rm -rf data/processed/*
python scripts/build_processed_data.py
uvicorn api.main:app --port 8000
```
