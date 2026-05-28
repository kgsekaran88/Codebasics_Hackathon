# TN Election RPC #21 — Master Execution Plan

> **Challenge:** Codebasics Resume Project Challenge #21 — *Decoding the 2026 Tamil Nadu Assembly Election*  
> **Role:** Freelance data analyst for **AtliQ Media** (neutral, ECI-only TV storytelling)  
> **Deadline:** 28 May 2026, 11:59 PM IST  
> **Prize:** ₹10,000  
> **Primary skill tested:** Storytelling (70 pts) > analytical hygiene (30 pts)

This document is the **single source of truth** for execution. Keep it updated as decisions are made (headline, party mapping, turnout source).

---

## 0. Recommended winning strategy (data-informed)

### 0.1 What the starter data already shows

Quick profiling of the provided CSVs (join on `ac_number`):

| Signal | 2021 | 2026 | Story use |
|--------|------|------|-----------|
| Constituencies | 234 | 234 | Full coverage |
| ACs where winning **party label** changed | — | **163** (~70%) | Q2 Flips — dominant narrative |
| TVK won (label `TVK`) | 0 | **108** seats | Q3 Vote share / new entrant |
| Avg winning **margin** (% of valid votes) | **11.8%** | **7.7%** | Q6 — more fragmented races |
| Winner vote share **>50%** | (compute) | **14** | Q6 — few landslides |
| Winner vote share **<35%** | (compute) | **61** | Q6 — many pluralities |
| Turnout in CSV | 234 ACs filled | **0** (blank) | Q5 requires ECI scrape |
| Flips by region (2021 region tag) | — | South 38, Chennai 30, Kongu/Central/North ~26–27, Delta 15 | Q1 Geographic |

### 0.2 Recommended story package (best ROI for rubric)

**Headline (example — refine after normalization):**  
*"In 2026, Tamil Nadu’s assembly became more fragmented: TVK took 108 seats, seven in ten constituencies changed hands, and average winning margins fell sharply versus 2021."*

**Pick these 3 research questions:**

1. **Q6 — Margin of victory** (fragmentation, landslides vs pluralities)  
2. **Q2 — Flip story** (163 seat changes; Sankey or alluvial)  
3. **Q3 — Vote share / TVK** (where TVK won; vote share shifts by region)

**Optional 4th thread for deck (not a 4th “question”):** Q1 geographic — one regional heatmap/small multiples slide.

**Do not lead with Q5 (turnout)** unless you complete ECI turnout scrape early; it is extra work and not required for a winning story.

### 0.4 Deep electoral-science layer (extra credit, neutral)

In addition to the six research questions, we surface structural indices from comparative-politics literature on a dedicated **`/deep`** dashboard page and three deck slides (14–16):

- **Effective Number of Parties** (Laakso–Taagepera, 1979): vote-share weighted fragmentation
- **Pedersen volatility** (1979): net vote-share churn between elections
- **Gallagher LSq** (1991): seat-vote disproportionality under first-past-the-post
- **Representation gap** per party (seat share − vote share)
- **Anti-incumbency rate** by region / reserved category / party
- **Race competitiveness** buckets (multi-cornered / three-way / two-party)
- **District churn** with "full sweep" flag

All measures are descriptive, ECI-only, and add depth without changing the lead narrative. See `docs/METRIC_DEFINITIONS.md` for formulas and constitutional context.

### 0.3 Why this beats other combinations

- Hits **surprise + scale** reviewers want (108 TVK seats, 163 flips, margin collapse).
- Three charts that **look different** (distribution, flow, regional bars/maps).
- Fully **descriptive** — no causal claims about why DMK/AIADMK/TVK gained/lost.
- Avoids reserved-seat controversy (Q4) unless you have a crisp, neutral angle.

---

## 1. Non-negotiable rules (disqualification if broken)

- [ ] **Data:** ECI public data only (+ Codebasics starter CSVs). No exit polls, news, social media, opinion.
- [ ] **Tone:** No praise/criticism of party, leader, community, religion, region.
- [ ] **Claims:** No “because” explanations for outcomes; no predictions.
- [ ] **Visuals:** No leader photos; no party symbols/logos.
- [ ] **AI:** Allowed for scrape/clean/chart; you own story selection and neutral framing.

---

## 2. Deliverables checklist (strict priority)

| Priority | Deliverable | Spec | Weight focus |
|----------|-------------|------|----------------|
| 1 | **Video** | 5–7 min, on camera, pitch to AtliQ content head; hook → 2–3 stories → editorial rec → limitations | 20 pts storytelling + 20 video |
| 2 | **Deck** | 8–10 slides: headline → stories → **editorial recommendation** → limitations | 15 pts |
| 3 | **GitHub** | Public repo; Python/SQL notebook runs end-to-end; README with sources + reproduction | 20 pts accuracy |
| 4 | **Dashboard** | Power BI / Tableau / Streamlit (optional) | 10 pts (skip-scored if absent) |
| 5 | **LinkedIn + RPC** | Post with mandatory tags; submit post URL on RPC page | Required for evaluation |

### 2.1 Editorial recommendation (deck + video)

Must answer for AtliQ: **What should the 60-minute show cover, in what order, and why?**  
Example structure (neutral):

- Segment A (10 min): Statewide seat arithmetic — TVK entry, fragmentation metrics  
- Segment B (15 min): Regional map — where flips clustered  
- Segment C (10 min): Close races — margins under X%  
- Segment D (5 min): Data caveats — live results vs Form-20, turnout sourcing  

---

## 3. Repository structure (current)

```
Codebasics-Hackathon/
├── README.md
├── HACKATHON_EXECUTION_PLAN.md
├── config/election.json      # Jurisdiction metadata (+ /api/meta)
├── data/
│   ├── raw/                  # tn_*_results.csv, constituency_master.csv
│   ├── external/             # Optional scraped 2026 turnout
│   └── processed/            # ac_comparison.csv, sankey_edges.csv, …
├── notebooks/
│   └── 01_build_and_explore.ipynb
├── src/                      # metrics, advanced_metrics, party_normalize, charts, presentation
├── api/                      # FastAPI (serves processed CSVs + /api/advanced/* + optional web/dist)
├── web/                      # React + TypeScript + ECharts (primary dashboard, incl. Deep insights page)
├── scripts/                  # build_processed_data, build_presentation, fetch_eci_turnout_2026, ngrok, …
├── outputs/
│   ├── charts/               # Plotly HTML exports
│   ├── presentation_assets/  # PNGs embedded in deck
│   └── walkthrough/          # Video script, teleprompter, checklist
├── deck/                     # TN_2026_AtliQ_Briefing.pptx
├── dashboard/                # Legacy Streamlit (optional; not submission path)
└── docs/
    ├── METRIC_DEFINITIONS.md
    ├── DASHBOARD_QA.md
    ├── DASHBOARD_REUSE.md
    └── VIDEO_NARRATION_SCRIPT.md
```

---

## 4. Data dictionary & joins

### 4.1 Files

| File | Rows | Key |
|------|------|-----|
| `tn_2021_results.csv` | ~4,232 | `ac_number` |
| `tn_2026_results.csv` | ~4,257 | `ac_number` |
| `constituency_master.csv` | 234 | `ac_number` |

### 4.2 Columns (results files)

- `constituency`, `ac_number`, `candidate`, `party`, `votes`, `turnout`, `reserved`, `region`
- **Turnout:** populated in 2021; **empty in 2026** → scrape from `results.eci.gov.in/ResultAcGenMay2026` if needed
- **Name drift:** e.g. `Gummidipundi` vs `Gummidipoondi` — **always join on `ac_number`**, not name

### 4.3 Regions (editorial, not ECI)

Chennai Metro, North, Central, Kongu, Delta, South — use `constituency_master.region` as canonical.

### 4.4 Reserved seats

GEN 188 | SC 44 | ST 2 — same in 2021 and 2026.

---

## 5. Metric definitions (document in `docs/METRIC_DEFINITIONS.md`)

### 5.1 Valid votes per AC

```
valid_votes(ac) = SUM(votes) WHERE party != 'NOTA'
```

(Confirm against ECI constituency PDF for 1–2 sample ACs; note definition in README.)

### 5.2 Winner

```
winner(ac) = candidate with MAX(votes) among non-NOTA candidates
```

Ties: flag manually (should be rare).

### 5.3 Vote share

```
vote_share(candidate) = votes / valid_votes(ac) * 100
winner_share(ac) = votes(winner) / valid_votes(ac) * 100
```

### 5.4 Margin of victory

```
margin_votes = winner_votes - runner_up_votes
margin_pct = margin_votes / valid_votes(ac) * 100
```

### 5.5 Flip

```
flip(ac) = winner_party_2026 != winner_party_2021
```
After **party normalization** (Section 6). Report both raw-label flips (163) and normalized flips in limitations if they differ.

### 5.6 Seat counts by party

Count ACs where normalized winner party = X.  
For “alliance” views, map parties to **formation** (DMK+, AIADMK+, etc.) only if you publish an explicit, source-backed mapping table.

---

## 6. Party normalization (critical for 2026)

2026 `party` field has long names and many `IND` rows. Build `party_normalize.csv`:

| raw_party (examples) | normalized | notes |
|----------------------|------------|-------|
| TVK | TVK | |
| DMK | DMK | |
| Anna Puratchi Thalaivar Amma Dravida Munnetra Kazhagam | AIADMK | verify spelling variants |
| All India Puratchi Thalaivar Makkal Munnettra Kazhagam | AIADMK | |
| INC | INC | |
| BJP | BJP | |
| NTK | NTK | |
| IND | IND | do not merge into majors without ECI “party” field proof |

**Process:**

1. `SELECT DISTINCT party, COUNT(*) FROM tn_2026 GROUP BY party ORDER BY count DESC`
2. Manually map top 30 labels
3. For winner stats, use **normalized** column only
4. In README: “Independent candidates are labeled IND; vote-transfer claims are not made.”

---

## 7. Phase-by-phase execution (step-by-step)

### PHASE 1 — Foundation (Days 1–2)

#### Step 1.1 — Fork starter data
- [ ] Copy `input_files_for_participants_rpc/data/*` → `data/raw/`
- [ ] Never edit raw files; all transforms write to `data/processed/`

#### Step 1.2 — Create GitHub repo
- [ ] Public repository
- [ ] Add `.gitignore` (exclude large caches, keep processed CSVs <10MB or use Git LFS if needed)
- [ ] Initial README: challenge name, disclaimer, folder map

#### Step 1.3 — Environment
- [ ] Python 3.11+ with `pandas`, `matplotlib` or `plotly`, `jupyter`
- [ ] Optional: `requests`, `beautifulsoup4` for turnout scrape
- [ ] `requirements.txt` pinned versions

#### Step 1.4 — Build AC-level tables
Notebook `01_build_ac_tables.ipynb`:

1. Load 2021 + 2026 + master  
2. Per `ac_number`, compute: valid_votes, winner, runner_up, winner_share, margin_pct, total_candidates  
3. Join master → district, region, reserved  
4. Export `data/processed/ac_summary_2021.csv`, `ac_summary_2026.csv`  
5. Export `data/processed/ac_comparison.csv` with columns:  
   `ac_number, region, reserved, winner_2021, winner_2026, flip, margin_2021, margin_2026, winner_share_2021, winner_share_2026`

**Validation gates:**
- [ ] 234 rows each year  
- [ ] Sum of votes per AC matches manual check for AC 1 and AC 100  
- [ ] No null `ac_number`

#### Step 1.5 — Party normalization
- [ ] Create `src/party_normalize.py` + `data/party_normalize.csv`  
- [ ] Re-run AC tables with `winner_party_norm`

---

### PHASE 2 — Story metrics (Days 3–4)

Notebook `02_story_metrics.ipynb`:

#### Q6 — Margins (do first)
- [ ] Statewide: mean/median margin 2021 vs 2026  
- [ ] Count: winner_share > 50%, < 35% (both years)  
- [ ] Chart: overlaid histogram or boxplot of `margin_pct`  
- [ ] Table: top 10 closest races 2026 (neutral titles: “Smallest margin, AC name”)

#### Q2 — Flips
- [ ] Count flips (normalized)  
- [ ] Build transition matrix: `winner_2021 → winner_2026` (top 15 flows)  
- [ ] Chart: Sankey (plotly) or alluvial — **no party colors that look like flags**; use neutral palette  
- [ ] Optional: map flips per region (choropleth if you have GeoJSON; else bar chart by region)

#### Q3 — TVK / vote share
- [ ] TVK seats won by region  
- [ ] Vote share by party statewide (2021 vs 2026) — bar chart  
- [ ] Regional small multiples: DMK, AIADMK, TVK share by region  
- [ ] **Do not claim** “TVK took votes from X” — say “TVK’s vote share was Y% in region Z; DMK share changed from A to B” (descriptive only)

#### Q1 — Geographic (one slide)
- [ ] Seats won by major normalized parties per region, 2021 vs 2026 side-by-side stacked bar

#### Q5 — Turnout (only if time)
- [ ] Scrape 2026 turnout per AC from ECI portal  
- [ ] Save `data/external/turnout_2026.csv` with source URL + scrape date  
- [ ] Merge; compute delta vs 2021; top 20 increases  
- [ ] If skipped: one limitations bullet in deck

---

### PHASE 3 — Visual design system (Day 5)

- [ ] **Palette:** Colorblind-safe (e.g. Okabe-Ito); avoid saffron/green combos that imply parties  
- [ ] **Fonts:** Single sans-serif; large axis labels for TV  
- [ ] **Titles:** Fact-only — “Average winning margin fell from 11.8% to 7.7%” not “DMK crushed”  
- [ ] Export charts at 1920×1080 min → `outputs/charts/`  
- [ ] Chart inventory table:

| Chart ID | Question | File | Deck slide |
|----------|----------|------|------------|
| C1 | Q6 | margin_hist.png | 3 |
| C2 | Q2 | sankey_flips.png | 4 |
| C3 | Q3 | tvk_by_region.png | 5 |
| C4 | Q1 | seats_by_region.png | 6 |

---

### PHASE 4 — Deck (Days 6–7)

**18 slides (current build) — generated by `python scripts/build_presentation.py`:**

1. Title — Headline finding
2. The challenge — RPC #21 problem statement
3. Our solution — Pipeline → three narratives → dashboard
4. Technology stack
5. Data & methodology
6. Research questions — coverage map (Q1–Q6) + electoral arithmetic note
7. **Q6 LEAD** — Margin of victory
8. **Q2 LEAD** — Seat churn at scale
9. **Q3 LEAD** — Vote share statewide
10. Q3 — Vote share by region
11. Q1 — Geographic pattern
12. Q4 — Reserved seats (GEN / SC / ST)
13. Q5 — Turnout
14. **Deep insight** — Electoral arithmetic (ENP / Pedersen / Gallagher)
15. **Deep insight** — Regional swing heatmap
16. **Deep insight** — Representation gap (vote vs seat share)
17. Editorial recommendation — 60-minute show
18. Limitations & reproducibility

- [ ] Export PDF  
- [ ] Place in `deck/` and link from README

---

### PHASE 5 — Video (Days 8–9)

#### Step 5.1 — Script (600–900 words for 5–7 min)
Structure:
1. **Hook (30s):** Headline + one surprising number  
2. **Context (45s):** AtliQ brief — neutral facts only  
3. **Story 1 (90s):** Margins — show C1  
4. **Story 2 (90s):** Flips — show C2  
5. **Story 3 (90s):** TVK / regions — show C3–C4  
6. **Recommendation (60s):** Show segment plan  
7. **Limitations (30s):** Honest caveats  
8. **Close (15s):** Thank you

- [ ] Bullet script, not word-for-word essay — avoids “reading script” penalty  
- [ ] Rehearse 3 times; record face + screen share

#### Step 5.2 — Production
- [ ] External mic; quiet room  
- [ ] 1080p screen recording; charts legible  
- [ ] Upload YouTube **unlisted** or Google Drive public link

---

### PHASE 6 — Dashboard (Days 9–10, optional)

If built — **Streamlit recommended** for speed:

- [ ] Page 1: Filters (region, reserved, flip yes/no)  
- [ ] KPI cards: total flips, TVK seats, avg margin 2026  
- [ ] Table: AC list sortable by margin  
- [ ] Do not duplicate every deck chart — exploration only

---

### PHASE 7 — QA & submission (Days 10–12)

#### Step 7.1 — Reproducibility
- [ ] Fresh clone → `pip install -r requirements.txt` → run notebooks top-to-bottom  
- [ ] All output numbers match deck/video (spreadsheet cross-check)

#### Step 7.2 — Tone audit
For every slide title and chart title, ask:  
*“Would a supporter of any party find this offensive or partisan?”*  
- [ ] Replace loaded words: “wave”, “sweep”, “rebel”, “vs battleground”

#### Step 7.3 — Reviewer simulation
- [ ] Watch video once without deck — write one-sentence headline  
- [ ] If unclear, re-cut opening 60 seconds

#### Step 7.4 — LinkedIn post
Include:
- [ ] Link to GitHub  
- [ ] Link to video  
- [ ] Tags: `@codebasics`, Hemanand Vadivel, Dhaval Patel, Government of Tamil Nadu  
- [ ] Hashtags: `#ResumeProjectChallenge #Codebasics #DataAnalytics #TamilNaduElection2026`

#### Step 7.5 — RPC portal
- [ ] Submit LinkedIn post URL on Resume Project Challenge page before deadline

---

## 8. Evaluation rubric map (100 points)

| Criterion | Pts | How this plan addresses it |
|-----------|-----|----------------------------|
| Story selection & framing | 20 | Single headline; 3 linked questions; regional slide |
| Video performance | 20 | Script structure; rehearsal; hook + recommendation |
| Deck narrative arc | 15 | 8-slide arc with editorial rec |
| Data accuracy & reproducibility | 20 | Metric doc, validation gates, public GitHub |
| Dashboard | 10 | Optional Streamlit |
| Non-partisanship | 10 | Tone audit checklist |
| Limitations honesty | 5 | Dedicated slide + video beat |

---

## 9. Timeline (working backward from 28 May 2026)

| Dates | Milestone |
|-------|-----------|
| Day 1–2 | Repo + AC tables + party normalization |
| Day 3–4 | All core metrics + charts C1–C4 |
| Day 5 | Visual polish + chart exports |
| Day 6–7 | Deck v1 → final PDF |
| Day 8–9 | Video script, record, upload |
| Day 10 | Dashboard (optional) + QA |
| Day 11–12 | Tone audit, LinkedIn, RPC submit |
| **28 May** | Buffer / only fixes |

---

## 10. Risk register

| Risk | Mitigation |
|------|------------|
| Party label chaos in 2026 | Normalization table + document uncertainty |
| 163 raw flips include alliance artifacts | Report normalized flips; footnote methodology |
| Turnout blank in 2026 CSV | Skip Q5 or scrape early with dated external file |
| Constituency name mismatch | Join only on `ac_number` |
| Over-claiming TVK “vote source” | Descriptive share changes only |
| Disqualification on tone | Tone audit + no causal language |

---

## 11. Quick reference — file paths in workspace

```
input_files_for_participants_rpc/
├── Readme-first-brief.docx
├── research_questions_and_recommendations.docx
├── How_to_Submit.docx
├── metadata.txt
└── data/
    ├── tn_2021_results.csv
    ├── tn_2026_results.csv
    └── constituency_master.csv
```

---

## 12. Decision log (update as you go)

| Date | Decision | Rationale |
|------|----------|-----------|
| | Headline text | |
| | 3 questions chosen | Q6, Q2, Q3 recommended |
| | Turnout: include Y/N | |
| | Dashboard tool | |

---

*Last updated: 28 May 2026 — added deep electoral-arithmetic layer (ENP, Pedersen, Gallagher), new `/deep` page, 18-slide deck.*
