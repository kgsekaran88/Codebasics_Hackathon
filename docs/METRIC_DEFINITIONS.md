# Metric definitions — TN Assembly 2021 vs 2026

Use these consistently across **notebook, dashboard, deck, and video**.

## Valid votes (per AC, per year)

```
valid_votes = SUM(votes) WHERE UPPER(party) != 'NOTA'
```

## Winner

Candidate with maximum `votes` among non-NOTA rows for that `ac_number`.

## Vote share (%)

```
vote_share = 100 * candidate_votes / valid_votes
winner_share = vote share of winner
```

## Margin of victory (%)

```
margin_pct = 100 * (winner_votes - runner_up_votes) / valid_votes
```

## Flip

```
flip = (winner_party_norm_2026 != winner_party_norm_2021)
```

Requires `party_normalize.csv`. Report raw-label flip count separately if it differs.

## Seat count

Count of ACs where `winner_party_norm` equals party X. Alliances only if explicit mapping table is published in README.

## Join key

Always `ac_number` (1–234). Do not join on `constituency` name alone.

## Turnout

- 2021: from starter CSV `turnout` column (constituency-level, repeated per row).  
- 2026: **not in starter pack** — source from ECI portal; record scrape date in `data/external/`.

## Advanced electoral indices (Deep Insights page)

All indices are descriptive measures from comparative-politics literature.

### Effective Number of Parties (ENP) — Laakso & Taagepera (1979)

```
ENP = 1 / Σ pᵢ²
```

where `pᵢ` is each party's share of valid votes (0–1). ENP = 2 in a pure two-party
contest; values of 3–4 indicate moderate fragmentation; > 4 is high.

### Pedersen index of volatility — Pedersen (1979)

```
V = ½ Σ |pᵢ(t) − pᵢ(t−1)|
```

where shares are in percentage points. The index measures net vote-share churn
between two elections. Values above ~20 are considered very high in stable
democracies; 36 (TN 2021→2026) indicates structural realignment.

### Gallagher Least-Squares disproportionality (LSq) — Gallagher (1991)

```
LSq = √(½ Σ (sᵢ − vᵢ)²)
```

where `sᵢ` is a party's seat share and `vᵢ` is its vote share. Lower values mean
seats match votes more closely. Compared with the older Loosemore–Hanby index,
LSq weights large discrepancies more heavily — closer to international standard.

### Representation gap (per party)

```
gap_pp = seat_share_pct − vote_share_pct
```

Positive values indicate first-past-the-post amplification of a party's vote
into seats; negative values indicate under-representation.

### Anti-incumbency rate

```
anti_incumbency_pct = 100 × Σ flip / total_seats
```

within a slice (region, reserved category, or party 2021). Descriptive only —
counts seats where the 2021 winning party did not retain the seat in 2026. No
claim about voter motivation.

### Race competitiveness

For each AC: combined vote share of top two candidates.

```
top2 = (votes_winner + votes_runner_up) / valid_votes × 100
```

Buckets used:

- `Multi-cornered`  : top2 < 70%
- `Three-way`       : 70% ≤ top2 < 85%
- `Two-party`       : top2 ≥ 85%

### District "full sweep"

A district where every assembly constituency it contains changed normalised
winner between 2021 and 2026.

## Constitutional context (descriptive)

- **Total seats:** 234 (TN Legislative Assembly, fixed under the Constitution and the Delimitation Act).
- **Reserved seats:** 44 SC and 2 ST in the current delimitation (Articles 332/334 of the Constitution; Delimitation Order 2008). The reserved set is identical across 2021 and 2026 in the starter file.
- **Voting system:** Simple-majority first-past-the-post. Winners can be elected on a plurality (< 50%) of valid votes — this is by design and not a defect.
- **NOTA:** A constitutional option since SC ruling 2013 (PUCL vs Union of India). Excluded from valid votes in margin and share computations to match ECI's "valid vote" reporting.

## Sources

- Codebasics: `tn_2021_results.csv`, `tn_2026_results.csv`, `constituency_master.csv`  
- ECI: https://results.eci.gov.in/  
- 2021 lineage: Trivedi Centre / ECI (per `metadata.txt`)
- Indices: Laakso & Taagepera (1979), Pedersen (1979), Gallagher (1991)
