# Reusing the dashboard for another election

## What is reusable today

| Layer | Reusable? | How |
|-------|-----------|-----|
| **Pipeline** | Yes | `scripts/build_processed_data.py` + `src/metrics.py` — swap CSVs in `data/raw/`, keep `ac_number` join |
| **Advanced metrics** | Yes | `src/advanced_metrics.py` — ENP, Pedersen, Gallagher LSq, swing, anti-incumbency, race competitiveness all compute generically from any two-election dataset with normalized parties |
| **API** | Yes | FastAPI reads `data/processed/*.csv` — logic is not TN-specific; new `/api/advanced/*` endpoints follow the same pattern |
| **React app** | Mostly | Party colors in `web/src/lib/colors.ts`; copy in page components; metadata in `config/election.json` |
| **Deep insights page** | Yes | `web/src/pages/DeepInsights.tsx` is data-driven — only the glossary block carries jurisdiction-neutral copy |
| **Maps** | Partial | TN district GeoJSON + `district_to_geo.json` — replace for other states |
| **Insights text** | Generated | `api/services.py` `get_insights()` and `_deep_bullets()` — recomputed from processed tables |

## What is NOT in the starter pack (cannot add without new data)

- Polling **booth**-level results  
- Voter **age** / demographic tables  
- **2026 turnout** (blank in provided CSV; 2021 turnout used on Ballots & turnout page)

## Steps for another state or India-wide (next cycle)

1. **Prepare ECI CSVs** with the same logical columns: `ac_number`, `candidate`, `party`, `votes`, `constituency`, optional `turnout`, `region`, `reserved`.
2. Copy files into **`data/raw/`** (or update paths in `config/election.json`).
3. Build **`data/processed/party_normalize.csv`** for new party label variants.
4. Run:
   ```bash
   source .venv/bin/activate
   python scripts/build_processed_data.py
   python scripts/build_district_map_geo.py   # after adding GeoJSON + district_to_geo.json
   ```
5. Update **`web/src/lib/colors.ts`** for any new major parties.
6. Replace **`web/public/geo/tn_districts_map.geojson`** (or add a state-specific map component).
7. Start API + web:
   ```bash
   uvicorn api.main:app --reload --port 8000
   cd web && npm run dev
   ```

## Config-driven UI

| Feature | Status |
|---------|--------|
| Election metadata (`config/election.json`) | **Done** — jurisdiction, years, regions, file paths |
| `GET /api/meta` | **Done** — returns `election.json` |
| Dynamic titles from API in React | **Partial** — sidebar copy is still TN-specific |
| Upload CSV in browser | **Not built** — post-hackathon |
| Multi-state GeoJSON picker | **Not built** — one map per deployment |

## Research threads → dashboard pages (internal mapping)

| Thread | Dashboard pages |
|--------|-----------------|
| Geographic patterns | Geography, Statewide mosaic |
| Seat flips | Seat flows, Statewide KPIs |
| Vote share / new entrant | Statewide, Explorer |
| Reserved seats | Reserved |
| Turnout | Ballots & turnout (2021 only in starter data) |
| Margins / fragmentation | Margins, Statewide KPIs |
| Electoral arithmetic (extra) | Deep insights — ENP, Pedersen, Gallagher, swing heatmap |

Insights panels use `/api/insights?year=` — bullets only, keyed by page (`overview`, `flows`, `margins`, `deep`, etc.).

## Advanced metric endpoints (regenerated automatically)

All `/api/advanced/*` endpoints read from CSVs written by `src/advanced_metrics.build_advanced_tables`:

- `/api/advanced/summary` — ENP / Pedersen / Gallagher / incumbent-loss headline indices
- `/api/advanced/enp-by-region`
- `/api/advanced/pedersen-by-region`
- `/api/advanced/swing-by-region` (party × region matrix)
- `/api/advanced/anti-incumbency`
- `/api/advanced/representation-gap` (vote share vs seat share)
- `/api/advanced/district-flips`
- `/api/advanced/bellwethers`
- `/api/advanced/race-types`

All require: (a) normalized party labels, (b) `ac_comparison.csv` joined across two elections, (c) `region` and `reserved` columns from the master.
