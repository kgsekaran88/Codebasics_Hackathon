# Video narration script — TN 2026 dashboard

Use this document as a **teleprompter-style guide** while recording your 5–7 minute AtliQ pitch. Numbers below come from the processed ECI starter files (`data/processed/`, normalized party labels). Re-run `python scripts/build_processed_data.py` if your pipeline changes.

**Tone:** Neutral, descriptive, ECI-only. Say what the data **shows** — not why voters behaved, not who should win.

**Avoid:** “because,” “due to,” “wave,” “rejected,” “mandate for/against,” leader names, party symbols, predictions.

**App routes:** Editorial brief `/` · Statewide `/overview` · Margins `/margins` · Seat flows `/flows` · Geography `/geography` · Reserved `/reserved` · Ballots & turnout `/depth` · Deep insights `/deep` · Explorer `/explorer` · Sources `/methods`

**Run locally:** `uvicorn api.main:app --port 8000` after `cd web && npm run build`, or dev mode on http://127.0.0.1:5173 with API on :8000.

---

## Suggested video arc (≈7 minutes)

| Segment | Time | Dashboard | Purpose |
|---------|------|-----------|---------|
| Hook + headline | 0:00–0:45 | Statewide `/overview` (2026) | Statewide story in one sentence |
| Seat flows | 0:45–2:00 | `/flows` | Where seats moved |
| Margins | 2:00–3:00 | `/margins` | Fragmentation |
| Vote share / TVK | 3:00–3:45 | `/overview` (bars + mosaic) | New entrant scale |
| Geography | 3:45–4:30 | `/geography` | Regional pattern |
| Deep insights | 4:30–5:15 | `/deep` | Electoral arithmetic — ENP, Pedersen, representation gap |
| Limitations | 5:15–5:45 | `/methods` (+ `/depth` if needed) | Data scope, no booth/age, 2026 turnout |
| Editorial recommendation | 5:45–6:45 | `/` or deck slide 17 | What AtliQ should air, in what order |

---

## Opening hook (on Statewide or on camera)

> “For a neutral sixty-minute briefing, the 2026 Tamil Nadu Assembly results in the ECI files show a more fragmented assembly than 2021: **TVK won 108 of 234 seats**, **163 constituencies—about seven in ten—changed normalized winner**, and the **average winning margin fell from 11.8% to 7.7%**. I’ll walk through seat flows, margins, and geography using only public ECI data.”

---

## Page 0 — Editorial brief (`/`)

**Page purpose:** Recommended 60-minute run-of-show for producers — segment order, minutes, and links to supporting views.

**Script:**

> “Before the charts: here’s how I’d structure the hour — open with statewide arithmetic, then regional patterns, then churn and close races, and end with sources and caveats. The three lead threads are margins, seat flows, and where TVK won. Everything below is descriptive ECI data only.”

---

## Page 1 — Statewide (`/overview`)

**Page purpose:** One-screen statewide summary — seats, vote share, and equal-weight map of all 234 ACs.

**Controls to demo:** Year toggle **2021 | 2026**; region chips (optional filter).

### Key insights panel

**What it is:** Auto-generated bullets from `/api/insights?year=` for this page only.

**Script:**

> “The insights panel restates the same numbers as the charts—so the briefing stays consistent. Toggle the year to compare 2021 and 2026 without changing the story’s neutrality.”

---

### KPI strip (4 cards)

**What it shows:** Headline counts for the **selected year**.

| Year | Cards | Numbers to cite |
|------|--------|-----------------|
| **2026** | TVK seats, Flips, Avg margin, Under 35% share | 108 / 234 · 163 (69.7%) · 7.7% (vs 11.8% in 2021) · 61 plurality wins |
| **2021** | Leading party seats, Runner-up, Avg margin, Under 35% share | DMK **133** · AIADMK 66 · 11.8% · 2 under 35% |

**Script (2026):**

> “In 2026, TVK is the largest seat block in this file with **108 seats**. **163 constituencies flipped** on normalized party labels—that’s **69.7%** of the assembly. The average winning margin is **7.7%**, down from **11.8%** in 2021. **61 winners** took under **35%** of valid votes—a plurality, not a majority of ballots.”

**Script (2021 — after toggling year):**

> “In 2021, **DMK led with 133 seats**, AIADMK had **66**, and the average margin was **11.8%**. Only **two** winners were under 35% vote share—so 2026 is visibly more fragmented on this metric.”

**Hackathon link:** Q2 (flips), Q3 (TVK seats), Q6 (margins, under-35%).

---

### Chart: Mosaic — 234 constituencies

**What it shows:** One tile per assembly constituency (18×13 grid). Color = **normalized winner for selected year**. Equal area—no geographic distortion.

**How to read:** Dense yellow in 2026 = TVK breadth; red/blue dominant in 2021 = DMK/AIADMK era.

**Script (2026):**

> “This mosaic treats every constituency equally—like an NPR-style tile map. Yellow is TVK, red DMK, blue AIADMK. You can see how widespread TVK’s 108 wins are without exaggerating Chennai or Kongu on a geographic map.”

**Script (2021):**

> “Switching to 2021, the mosaic is mostly red and blue—DMK and AIADMK—with no TVK tiles, since TVK did not win seats on this label in 2021.”

**Interaction:** Click a tile → AC detail card (name, district, 2021 vs 2026 winner, margins).

**Hackathon link:** Q1 (pattern at a glance), Q3 (TVK geography).

---

### Chart: Seat tally (horizontal bars)

**What it shows:** Number of assembly seats won per normalized party for the **selected year**.

**Script (2026):**

> “The seat tally confirms the mosaic: TVK has the most seats in 2026, followed by DMK and AIADMK on normalized labels. Bar length is seat count—not vote share.”

**Script (2021):**

> “In 2021, DMK’s bar is longest at **133 seats**, then AIADMK at **66**.”

**Hackathon link:** Q2, Q3.

---

### Chart: Vote share (horizontal bars)

**What it shows:** Each party’s share of **statewide valid votes** (NOTA excluded) for the selected year.

**Script (2026):**

> “Vote share is a different lens from seats. TVK has about **35%** of valid votes statewide in this file—while seat counts depend on where that vote was distributed across 234 constituencies.”

**Script (2021):**

> “In 2021, DMK’s statewide vote share was about **38%**—similar magnitude, but the seat outcome was DMK-heavy because of how votes clustered.”

**Hackathon link:** Q3.

---

## Page 2 — Seat flows (`/flows`)

**Page purpose:** How **2021 winning parties** map to **2026 winners**—seat counts only, not vote transfer.

**Control:** “All flows” checkbox (default: top paths).

### Key insights panel

**Script:**

> “Seat flows answer hackathon question two: where did seats go between elections? The largest single band in the top flows is **2021 DMK to 2026 TVK—65 constituencies** in this file.”

---

### Chart: Seat flow Sankey (top)

**What it shows:** Bands between nodes labeled `Party (2021)` and `Party (2026)`. **Band width = number of constituencies** that took that path.

**Top flows to cite:**

| From (2021) | To (2026) | Seats |
|-------------|-----------|-------|
| DMK | TVK | 65 |
| DMK | DMK | 40 |
| AIADMK | TVK | 26 |
| AIADMK | AIADMK | 22 |
| DMK | AIADMK | 22 |

**Script:**

> “Read the Sankey left to right: 2021 winner on the left, 2026 winner on the right. The thickest band here is **DMK 2021 to TVK 2026—65 seats**. That’s descriptive flow—**not** voters ‘switching party’ as a one-to-one transfer. Smaller bands show seats DMK or AIADMK held, or moved to each other.”

**Hackathon link:** Q2.

---

### Chart: Incumbent retention (bottom)

**What it shows:** For each party that **won seats in 2021**, what **percentage of those same constituencies** it **still won in 2026**. Label format: `retained / held` (e.g. **40/133** for DMK).

**How to read:** Low retention = most 2021 wins for that party flipped to another 2026 winner. High retention = defended turf.

**Numbers to cite:**

| Party | Retained / held 2021 | Retention % |
|-------|----------------------|-------------|
| DMK | 40 / 133 | 30.1% |
| AIADMK | 22 / 66 | 33.3% |
| INC | 4 / 18 | 22.2% |
| CPI | 2 / 2 | 100% |

**Script:**

> “Retention answers a simpler question than the Sankey: of the seats a party won in 2021, how many did it still win in 2026? **DMK kept 40 of 133**—about **30%** retention. **AIADMK kept 22 of 66**. TVK doesn’t appear here as a 2021 incumbent because it had no 2021 wins on this label. This chart does **not** show who took lost seats—that’s the Sankey above.”

**Hackathon link:** Q2.

---

## Page 3 — Geography (`/geography`)

**Page purpose:** Regional and district views of **where** outcomes and flips cluster.

**Controls:** Year toggle (regional chart only); map mode **2026 winner** vs **flip rate**.

**Note when year = 2021:** District map still shows **2026**; banner on screen explains this.

### Key insights panel

**Script (2026):**

> “Geography addresses question one. **Chennai Metro** has the highest flip rate in this file—**93.8%** of its 32 ACs changed normalized winner. **Delta** is lowest at **45.5%**.”

---

### Chart: Tamil Nadu district map

**What it shows (party mode):** District polygons colored by **2026 winning party** (aggregated from AC winners in that district).

**What it shows (flip mode):** Gradient = share of ACs in the district where normalized winner **changed** 2021→2026.

**Script:**

> “The map is a geographic complement to the mosaic. In party mode, you see which district-level color dominates in 2026. In flip mode, darker districts had more seat changes. Pan and zoom for detail—constituency-level truth is still the 234-tile mosaic on Overview.”

**Hackathon link:** Q1.

---

### Chart: Seats by macro-region (stacked bars)

**What it shows:** Seat count by **normalized party** within each of six editorial macro-regions (Chennai Metro, North, Central, Kongu, Delta, South). Respects **year toggle**.

**Script (2021):**

> “With 2021 selected, Chennai Metro is heavily DMK—**29 seats** in this regional split.”

**Script (2026):**

> “With 2026 selected, the stacks show how TVK, DMK, and AIADMK divide each macro-region’s seats—useful for a regional segment in the TV show.”

**Hackathon link:** Q1, Q3.

---

### Chart: Flip rate by macro-region

**What it shows:** Percent of ACs in each macro-region where normalized winner changed (2021 vs 2026). **Not year-toggled**—always the comparison.

**Script:**

> “This bar chart ranks regions by churn. **Chennai Metro** is at the top—nearly **94%** of constituencies flipped. **Delta** is about **46%**—still high, but lower than the state average of **70%**.”

**Hackathon link:** Q1, Q2.

---

## Page 4 — Margins (`/margins`)

**Page purpose:** How tight races were—**Q6 fragmentation**.

### Key insights panel

**Script:**

> “Margins tell us competition got closer on average: **103 constituencies** had a 2026 winning margin under **five percentage points**, and only **14 winners** cleared **50%** of valid votes.”

---

### Chart: 2021 vs 2026 margin (scatter)

**What it shows:** One dot per AC. Typically X = 2021 margin %, Y = 2026 margin % (valid-vote denominator). Points below the diagonal = tighter race in 2026.

**Script:**

> “Each dot is one constituency. Many dots sit lower on the 2026 axis than on 2021—consistent with the statewide average margin dropping from **11.8%** to **7.7%**. Scroll and zoom to inspect outliers. Hover for AC name.”

**Hackathon link:** Q6.

---

### Chart: Winner vote share buckets (2026)

**What it shows:** How many ACs fall into winner share bands: **under 35%**, **35–50%**, **over 50%**.

| Bucket | Constituencies |
|--------|----------------|
| &lt;35% | 61 |
| 35–50% | 159 |
| 50%+ | 14 |

**Script:**

> “Most 2026 winners fell between **35 and 50%** of valid votes. **61** won with under **35%**—a plurality. Only **14** crossed **50%**—few landslide-style majorities in this file.”

**Hackathon link:** Q6.

---

### Table: Closest races

**What it shows:** Constituencies with the **smallest 2026 winning margin** (winner vs runner-up, % of valid votes).

**Script:**

> “The table lists the knife-edge seats—useful for a short ‘closest contests’ segment without naming campaigns or causes.”

**Hackathon link:** Q6.

---

## Page 5 — Reserved (`/reserved`)

**Page purpose:** Seat outcomes by **GEN / SC / ST** reservation category—descriptive counts only (**Q4**).

### Key insights panel

**Script:**

> “Tamil Nadu has **188 general**, **44 SC**, and **2 ST** constituencies in the master file. Flip rates are similar across GEN and SC—about **70%**—with **31 of 44** SC seats changing normalized winner.”

---

### Chart: Flip rate by category

**What it shows:** % of ACs in each reservation type where normalized winner changed 2021→2026.

| Category | Flips | Total | Flip % |
|----------|-------|-------|--------|
| GEN | 131 | 188 | 69.7% |
| SC | 31 | 44 | 70.5% |
| ST | 1 | 2 | 50.0% |

**Script:**

> “This chart compares flip **rates** by reservation type—not voter behaviour by community. **SC-reserved** seats flipped at roughly the same rate as general seats in this dataset.”

**Hackathon link:** Q4.

---

### Table: 2026 seats · party × reserved

**What it shows:** Exact 2026 seat counts per party in GEN, SC, and ST columns.

**Script:**

> “The matrix is the 2026 seat arithmetic broken down by reservation category—handy for a single slide on how seats distributed without making claims about any group’s voting intent.”

**Hackathon link:** Q4.

---

## Page 6 — Depth (`/depth`)

**Page purpose:** Turnout (2021 only in starter data), ballot size, NOTA—**Q5 partial**.

### Key insights panel

**Script:**

> “Depth is where we’re explicit about data limits: **2026 turnout is blank** in the starter CSV, so turnout charts use **2021 constituency-level turnout**. There is **no booth-level or age data** in the files provided.”

---

### Chart: Average turnout by macro-region (2021)

**What it shows:** Mean reported **2021 turnout %** per macro-region.

**Script:**

> “Statewide average turnout in the 2021 file is about **73.4%**. This chart compares macro-regions—useful context if the show opens with 2021 baseline, with a clear label that 2026 turnout isn’t in this dataset yet.”

**Hackathon link:** Q5 (partial).

---

### Chart: Turnout vs 2026 margin (scatter)

**What it shows:** X = 2021 turnout; Y = 2026 margin. Descriptive correlation only—**do not claim causation**.

**Script:**

> “Each dot pairs 2021 turnout with how tight the 2026 race was. We describe the pattern—we do not say high or low turnout ‘caused’ a margin.”

---

### Chart: Candidates on the 2026 ballot

**What it shows:** Distribution of **how many candidates** appeared per AC in 2026 (avg **17.2**, max **79**).

**Script:**

> “2026 ballots were crowded—averaging about **seventeen** candidates per constituency in this file. That’s ballot breadth, not booth-level fragmentation.”

---

### Chart: Highest NOTA share (2026)

**What it shows:** Top constituencies by NOTA as % of valid votes (typically under ~1% in this file).

**Script:**

> “NOTA stayed a small share statewide; this chart highlights constituencies where it was relatively highest—still under about **one percent** at the top of the list in our processed file.”

---

## Page 6b — Deep insights (`/deep`)

**Page purpose:** Structural electoral-science measures applied to the same ECI data. Each index is a standard, published academic metric — no causal claim.

### Key insights panel

**Script:**

> “Beyond seats and margins, three textbook indices describe how the system itself changed. The Effective Number of Parties — Laakso–Taagepera — rose from **3.74 to 4.29**. Pedersen volatility — net party vote-share churn — is **36**, which the literature flags as very high. Gallagher disproportionality fell from **15.2 to 8.7** — seats track votes more closely than in 2021. These are descriptive measures, not opinions.”

---

### Chart: ENP by region (grouped bars)

**What it shows:** Effective number of parties per macro-region, 2021 vs 2026.

**Script:**

> “Every region is more fragmented in 2026 except Chennai Metro, which stayed near 3.3 — same number of effective parties, but Pedersen volatility tells us the parties themselves changed. South Tamil Nadu is most fragmented at **4.6**.”

---

### Chart: Pedersen volatility by region (horizontal bars)

**What it shows:** Half the sum of absolute vote-share changes per region.

**Script:**

> “Pedersen is highest in Chennai Metro at **49** — the largest party-share churn between elections in the file. Central and Kongu sit in the mid-thirties. Twenty-plus is considered very high in academic literature.”

---

### Chart: Swing heatmap (party × region)

**What it shows:** Vote-share change in percentage points, party rows × region columns. Diverging palette: green = gain, red = loss.

**Script:**

> “The heatmap traces party gains and losses by region. We describe the colors — green means a party’s vote share went up in that region, red means down. We do not say where one party’s votes ‘went’ — votes don’t literally transfer between parties.”

---

### Chart: Anti-incumbency by region

**What it shows:** Share of seats where the 2021 winning party did **not** win in 2026.

**Script:**

> “Anti-incumbency is a descriptive label for seat-level non-retention. Statewide it’s **69.7%**. Chennai Metro is highest at **94%**, Delta is lowest at **46%**. The chart counts seat outcomes; it does not infer voter motive.”

---

### Chart: Representation gap (vote share vs seat share, 2026)

**What it shows:** Grouped horizontal bars per party — vote share % vs seat share %.

**Script:**

> “First-past-the-post amplifies the leading party. TVK won **35%** of the vote and **46%** of the seats — an **eleven-point** amplification. Smaller parties like BJP got under-represented relative to votes. Gallagher LSq summarises this gap into one number, and it’s lower than in 2021.”

---

### Chart: Race competitiveness (buckets)

**What it shows:** Combined top-2 vote share bucket: multi-cornered (<70%), three-way (70–85%), two-party (>85%).

**Script:**

> “**132 of 234** races in 2026 were multi-cornered — top two candidates combined for less than 70% of the valid votes. Only **four** were two-party contests. That structural shift sits behind the margin collapse on the Margins page.”

---

### Table: District churn

**What it shows:** Districts sorted by share of ACs that flipped, with a “full sweep” badge for districts where every AC changed normalised winner.

**Script:**

> “The table lists every district by churn. Full-sweep districts are flagged — useful for a regional B-roll segment without naming campaigns.”

---

**Hackathon link:** Goes beyond the six required questions — structural electoral-science context.

---

## Page 7 — Explorer (`/explorer`)

**Page purpose:** Analyst view—filter ACs and see **filtered** tallies, margin scatter, and table (not statewide totals).

### Filter bar

**What it does:** Region, reserved category, 2026 winner party, flip-only, max margin slider.

**Script:**

> “Explorer is for follow-up questions—for example, ‘show only flipped seats in Kongu with margin under five percent.’ The KPI strip and seat tally **recalculate for the filter**, unlike Overview which is always statewide unless you use region chips on the mosaic.”

---

### Mini KPIs: Matching ACs / Flips in set / Avg margin 2026

**Script:**

> “These three numbers summarize whatever filter you applied—great for rehearsing a regional deep-dive segment.”

---

### Chart: Filtered seat tally

**What it shows:** 2026 seat counts **within the current filter**.

**Script:**

> “After filtering, the bar chart answers ‘who won among these constituencies only?’”

---

### Chart: Margin shift (filtered scatter)

**What it shows:** Same 2021 vs 2026 margin view, subset of ACs. **Click a dot** → detail card.

**Script:**

> “Click any point to pull up that constituency’s 2021 and 2026 winners and margins for on-air fact-checking.”

---

### Table: Constituency list

**What it shows:** AC number, name, 2021 winner, 2026 winner, 2026 margin. Row click → detail.

**Script:**

> “The table is the searchable backbone—use it if the producer asks for a specific seat during recording.”

---

## Page 8 — Sources (`/methods`)

**Page purpose:** Sources, metric definitions, limitations, reuse notes—for closing the video.

**Script:**

> “All metrics come from ECI starter CSVs joined on assembly constituency number. Winners use valid votes excluding NOTA. Margins are winner minus runner-up, divided by valid votes. Flips mean normalized 2021 winner differs from normalized 2026 winner. Party labels are normalized via our mapping file—raw ECI strings would change counts slightly. We do not use exit polls, news, or social media.”

---

## Research threads — one-line bridges (internal; do not read Q labels on air)

| Thread | One sentence for video |
|--------|------------------------|
| Geographic patterns | Flips clustered highest in **Chennai Metro (93.8%)**, lowest in **Delta (45.5%)**; regional stacks show how seats split in 2021 vs 2026. |
| Seat flips | **163** ACs (**69.7%**) changed winner; largest flow **DMK 2021 → TVK 2026 (65 seats)**. |
| Vote share / TVK | **TVK: 108 seats, ~35% statewide valid vote share** in 2026; DMK had **~38%** vote share and **133 seats** in 2021. |
| Reserved seats | **188 GEN / 44 SC / 2 ST**; SC flip rate **70.5%** vs GEN **69.7%**—similar churn, different seat totals. |
| Turnout | **2021 avg ~73.4%** in CSV; **2026 turnout not provided** in starter files. |
| Margins | Avg margin **11.8% → 7.7%**; **61** winners under **35%** share; **103** seats under **5 pt** margin. |
| Electoral arithmetic | ENP **3.74 → 4.29**; Pedersen **36**; Gallagher LSq **15.2 → 8.7**; **132 of 234** multi-cornered races. |

---

## Editorial recommendation (closing — on camera or deck)

Template (customize order/timing):

> “For a sixty-minute neutral special, I’d recommend: **(1)** statewide arithmetic—108 TVK seats, 163 flips, margin drop **[Statewide, 10 min]**; **(2)** regional map and flip bars for Chennai vs Delta **[Geography, 15 min]**; **(3)** churn and close races—margins under five points and the seat-flow Sankey **[Margins + Seat flows, 10 min]**; **(4)** sources and caveats—no 2026 turnout in file, normalization rules **[Sources, 5 min]**. Use the constituency explorer if producers need a specific seat during the show. Keep vote share and TVK in segment one so seats and votes are not conflated.”

---

## Limitations (always say once)

> “This analysis is constituency-level ECI data only. **2026 turnout is missing** in the provided CSV. There are **no polling-booth or voter-age tables**. Party names are **normalized** for comparison. Maps approximate district boundaries. Nothing here predicts future elections or explains voter motivation.”

---

## Quick reference — headline numbers

| Metric | Value |
|--------|-------|
| Total ACs | 234 |
| TVK seats 2026 | 108 |
| DMK seats 2021 | 133 |
| Flips (normalized) | 163 (69.7%) |
| Avg margin 2021 / 2026 | 11.8% / 7.7% |
| Winners &lt;35% vote share 2026 | 61 |
| Winners &gt;50% vote share 2026 | 14 |
| Margins &lt;5 pp 2026 | 103 |
| TVK vote share 2026 | ~35.1% |
| DMK vote share 2021 | ~38.0% |
| Largest Sankey flow | DMK → TVK, 65 seats |
| DMK retention | 40 / 133 (30.1%) |
| Effective Number of Parties | 3.74 → 4.29 (Laakso–Taagepera) |
| Pedersen volatility | 36.4 (literature: 20+ = high) |
| Gallagher LSq | 15.2 → 8.7 (lower = more proportional) |
| Multi-cornered races (top-2 < 70%) | 132 of 234 |

---

## Related docs

- `docs/METRIC_DEFINITIONS.md` — formulas
- `docs/DASHBOARD_QA.md` — what to click when testing
- `HACKATHON_EXECUTION_PLAN.md` — deliverables and rubric
- Dashboard live insights: `/api/insights?year=2026`

*Regenerate numbers after rebuilding processed data.*
