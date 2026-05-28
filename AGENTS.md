# Agent instructions — TN Election RPC

For any work on this hackathon, use:

1. **`HACKATHON_EXECUTION_PLAN.md`** — Internal submission checklist. Dashboard opens on **Editorial brief** (`/`).
2. **`docs/VIDEO_NARRATION_SCRIPT.md`** — per-page and per-chart narration for video recording.
2b. **`docs/CHART_LAYOUT_AUDIT.md`** — per-chart clipping / margin checklist.
3. **`docs/DASHBOARD_QA.md`** — routes, E2E, manual QA.
4. **`docs/DASHBOARD_REUSE.md`** — reuse pipeline for another election.
5. **`docs/VISUAL_AND_REFERENCE_MASTER.md`** — creative reference (Streamlit sections are bibliography only).
6. **`docs/METRIC_DEFINITIONS.md`** — winner, margin, flip, valid votes, plus advanced indices (ENP, Pedersen, Gallagher LSq, representation gap) and constitutional context.
7. **`deck/TN_2026_AtliQ_Briefing.pptx`** — 18 slides; rebuild via `python scripts/build_presentation.py`.
8. **`src/advanced_metrics.py`** — electoral-science indices powering the `/deep` page and `/api/advanced/*` endpoints.
9. **`.cursor/rules/tn-election-rpc.mdc`** — always-on constraints.

Starter data lives under `input_files_for_participants_rpc/`.
