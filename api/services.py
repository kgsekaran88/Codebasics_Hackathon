"""Data services for API."""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.load_data import PROCESSED, ensure_processed


def ensure_data():
    ensure_processed()


def load(name: str) -> pd.DataFrame:
    return pd.read_csv(PROCESSED / f"{name}.csv")


def df_to_records(df: pd.DataFrame) -> list[dict]:
    clean = df.replace({pd.NA: None}).where(pd.notna(df), None)
    records = clean.to_dict(orient="records")
    for row in records:
        for key, val in row.items():
            if isinstance(val, float) and (val != val):  # NaN
                row[key] = None
            elif hasattr(val, "item"):  # numpy scalar
                row[key] = val.item()
    return records


def filter_meta() -> dict:
    comp = load("ac_comparison")
    return {
        "regions": sorted(comp["region"].dropna().unique().tolist()),
        "reserved": ["GEN", "SC", "ST"],
        "parties_2026": sorted(comp["winner_party_norm_2026"].dropna().unique().tolist()),
    }


def get_comparison(
    regions: list[str] | None,
    reserved: list[str] | None,
    parties: list[str] | None,
    flip_only: bool,
    max_margin: float,
) -> list[dict]:
    df = load("ac_comparison")
    if regions:
        df = df[df["region"].isin(regions)]
    if reserved:
        df = df[df["reserved"].isin(reserved)]
    if parties:
        df = df[df["winner_party_norm_2026"].isin(parties)]
    if flip_only:
        df = df[df["flip_norm"] == True]  # noqa: E712
    df = df[df["margin_pct_2026"] <= max_margin]
    out = df_to_records(df)
    for row in out:
        row["ac_name"] = row.get("constituency") or row.get("constituency_2026")
    return out


def _normalize_year(year: str) -> str:
    return year if year in ("2021", "2026") else "2026"


def get_kpis(year: str = "2026") -> dict:
    year = _normalize_year(year)
    comp = load("ac_comparison")
    if year == "2021":
        s = load("ac_summary_2021")
        counts = s["winner_party_norm"].value_counts()
        leading = counts.index[0]
        second = counts.index[1] if len(counts) > 1 else None
        return {
            "year": "2021",
            "leading_party": leading,
            "leading_party_seats": int(counts.iloc[0]),
            "second_party": second,
            "second_party_seats": int(counts.iloc[1]) if second else 0,
            "avg_margin": round(float(s["margin_pct"].mean()), 1),
            "median_margin": round(float(s["margin_pct"].median()), 1),
            "under_35_share": int((s["winner_share_pct"] < 35).sum()),
            "under_5_margin": int((s["margin_pct"] < 5).sum()),
            "over_50_share": int((s["winner_share_pct"] > 50).sum()),
            "total_acs": int(len(s)),
            "tvk_seats": None,
            "flips": None,
            "flip_pct": None,
            "avg_margin_2021": None,
            "avg_margin_2026": None,
        }
    s26 = load("ac_summary_2026")
    counts = s26["winner_party_norm"].value_counts()
    leading = counts.index[0]
    return {
        "year": "2026",
        "leading_party": leading,
        "leading_party_seats": int(counts.iloc[0]),
        "tvk_seats": int((s26["winner_party_norm"] == "TVK").sum()),
        "flips": int(comp["flip_norm"].sum()),
        "flip_pct": round(100 * comp["flip_norm"].mean(), 1),
        "avg_margin": round(float(comp["margin_pct_2026"].mean()), 1),
        "avg_margin_2021": round(float(comp["margin_pct_2021"].mean()), 1),
        "avg_margin_2026": round(float(comp["margin_pct_2026"].mean()), 1),
        "median_margin": round(float(comp["margin_pct_2026"].median()), 1),
        "under_35_share": int((s26["winner_share_pct"] < 35).sum()),
        "under_5_margin": int((comp["margin_pct_2026"] < 5).sum()),
        "over_50_share": int((s26["winner_share_pct"] > 50).sum()),
        "total_acs": 234,
    }


def get_seat_tally() -> dict:
    df = load("seat_tally")
    return {
        "2021": [
            {"party": r["winner_party_norm"], "seats": int(r["seats_2021"])}
            for _, r in df.iterrows()
            if r["seats_2021"] > 0
        ],
        "2026": [
            {"party": r["winner_party_norm"], "seats": int(r["seats_2026"])}
            for _, r in df.iterrows()
            if r["seats_2026"] > 0
        ],
    }


def get_vote_share() -> dict:
    def map_parties(df: pd.DataFrame) -> list[dict]:
        return [
            {"party": r["party_norm"], "vote_share_pct": float(r["vote_share_pct"])}
            for _, r in df.iterrows()
        ]

    return {
        "2021": map_parties(load("vote_share_2021")),
        "2026": map_parties(load("vote_share_2026")),
    }


def get_sankey(full: bool) -> list[dict]:
    name = "sankey_full" if full else "sankey_edges"
    df = load(name)
    return [
        {"source": r["source"], "target": r["target"], "value": int(r["seats"])}
        for _, r in df.iterrows()
    ]


def get_regional_seats() -> dict:
    def map_df(df: pd.DataFrame) -> list[dict]:
        return [
            {
                "region": r["region"],
                "party": r["winner_party_norm"],
                "seats": int(r["seats"]),
            }
            for _, r in df.iterrows()
        ]

    return {
        "2021": map_df(load("regional_seats_2021")),
        "2026": map_df(load("regional_seats_2026")),
    }


def get_party_retention() -> list[dict]:
    df = load("party_retention")
    return [
        {
            "party": r["party"],
            "held_2021": int(r["seats_won_2021"]),
            "retained_2026": int(r["retained_2026"]),
            "retention_pct": float(r["retention_pct"]),
        }
        for _, r in df.iterrows()
    ]


def get_winner_buckets() -> list[dict]:
    df = load("winner_share_buckets")
    return [{"bucket": r["bucket"], "count": int(r["constituencies"])} for _, r in df.iterrows()]


def get_flips_by_region() -> list[dict]:
    df = load("flips_by_region")
    return [
        {
            "region": r["region"],
            "flips": int(r["flips"]),
            "total": int(r["total_acs"]),
            "flip_pct": float(r["flip_pct"]),
        }
        for _, r in df.iterrows()
    ]


def get_flips_by_reserved() -> list[dict]:
    df = load("flips_by_reserved")
    return [
        {
            "reserved": r["reserved"],
            "flips": int(r["flips"]),
            "total": int(r["total_acs"]),
            "flip_pct": float(r["flip_pct"]),
        }
        for _, r in df.iterrows()
    ]


def get_reserved_breakdown() -> list[dict]:
    df = load("reserved_breakdown")
    df = df[df["year"] == 2026]
    return [
        {"reserved": r["reserved"], "party": r["party"], "seats": int(r["seats"])}
        for _, r in df.iterrows()
    ]


def get_reserved_breakdown_full() -> dict:
    """Both years grouped for side-by-side comparison (Q4)."""
    df = load("reserved_breakdown")
    out: dict[str, list[dict]] = {}
    for year_val, group in df.groupby("year"):
        out[str(int(year_val))] = [
            {"reserved": r["reserved"], "party": r["party"], "seats": int(r["seats"])}
            for _, r in group.iterrows()
        ]
    return out


def get_reserved_margin_summary() -> list[dict]:
    """Avg margin and plurality counts by reserved category for both years (Q4)."""
    comp = load("ac_comparison")
    rows = []
    for cat in ["GEN", "SC", "ST"]:
        sub = comp[comp["reserved"] == cat]
        if sub.empty:
            continue
        rows.append(
            {
                "reserved": cat,
                "acs": int(len(sub)),
                "avg_margin_2021": round(float(sub["margin_pct_2021"].mean()), 1),
                "avg_margin_2026": round(float(sub["margin_pct_2026"].mean()), 1),
                "flip_pct": round(100 * float(sub["flip_norm"].mean()), 1),
                "under_35_2026": int((sub["winner_share_pct_2026"] < 35).sum()),
            }
        )
    return rows


def get_vote_share_by_region() -> dict:
    """Party vote share within each macro-region, both years (Q3)."""
    out: dict[str, list[dict]] = {}
    for year in ("2021", "2026"):
        try:
            df = load(f"vote_share_by_region_{year}")
        except FileNotFoundError:
            df = pd.DataFrame(columns=["region", "party_norm", "vote_share_pct"])
        out[year] = [
            {
                "region": r["region"],
                "party": r["party_norm"],
                "vote_share_pct": float(r["vote_share_pct"]),
            }
            for _, r in df.iterrows()
        ]
    return out


def _load_optional(name: str) -> pd.DataFrame:
    path = PROCESSED / f"{name}.csv"
    if not path.exists():
        return pd.DataFrame()
    try:
        return pd.read_csv(path)
    except Exception:
        return pd.DataFrame()


def get_advanced_summary() -> dict:
    """Headline electoral-science indices (ENP, Pedersen, Gallagher, anti-incumbency)."""
    df = _load_optional("advanced_summary")
    return {row["metric"]: float(row["value"]) for _, row in df.iterrows()}


def get_enp_by_region() -> list[dict]:
    df = _load_optional("enp_by_region")
    return df_to_records(df)


def get_pedersen_by_region() -> list[dict]:
    df = _load_optional("pedersen_by_region")
    return df_to_records(df)


def get_swing_by_region() -> list[dict]:
    df = _load_optional("swing_by_region")
    return df_to_records(df)


def get_anti_incumbency() -> list[dict]:
    df = _load_optional("anti_incumbency")
    return df_to_records(df)


def get_representation_gap() -> dict:
    return {
        "2021": df_to_records(_load_optional("representation_gap_2021")),
        "2026": df_to_records(_load_optional("representation_gap_2026")),
    }


def get_district_full_flips() -> list[dict]:
    df = _load_optional("district_full_flips")
    return df_to_records(df)


def get_bellwether_acs() -> list[dict]:
    df = _load_optional("bellwether_acs")
    return df_to_records(df)


def get_race_type_summary() -> list[dict]:
    df = _load_optional("race_type_summary")
    return df_to_records(df)


def get_turnout_top_changes() -> dict:
    """Top-20 ACs by 2021→2026 turnout change (Q5).

    Empty `rows` indicates 2026 turnout has not been sourced (data/external/turnout_2026.csv).
    """
    try:
        df = load("turnout_top_changes")
    except FileNotFoundError:
        df = pd.DataFrame()
    rows = df_to_records(df) if not df.empty else []
    return {
        "rows": rows,
        "has_2026_turnout": len(rows) > 0,
        "state_record_2026_pct": 85.1,  # ECI-reported statewide figure
        "source_hint": "Fill data/external/turnout_2026.csv (per-AC turnout %) and rebuild.",
    }


def get_ac(ac_number: int) -> dict | None:
    comp = load("ac_comparison")
    row = comp[comp["ac_number"] == ac_number]
    if row.empty:
        return None
    rec = df_to_records(row)[0]
    rec["ac_name"] = rec.get("constituency") or rec.get("constituency_2026")
    return rec


def _deep_bullets(enp21, enp26, ped, lsq21, lsq26, enp_reg, ped_reg, repgap26, races) -> list[str]:
    bullets: list[str] = []
    if enp21 and enp26:
        bullets.append(
            f"Effective number of parties (vote-share weighted) rose from {enp21:.2f} to {enp26:.2f} — a more fragmented contest."
        )
    if ped:
        bullets.append(
            f"Pedersen volatility {ped:.1f} — academic literature flags 20+ as 'high'; 36+ signals a structural realignment in party vote shares."
        )
    if lsq21 and lsq26:
        bullets.append(
            f"Gallagher LSq disproportionality fell from {lsq21:.1f} to {lsq26:.1f} — 2026 seat shares track 2026 vote shares more closely than 2021 did."
        )
    if not enp_reg.empty:
        max_row = enp_reg.sort_values("enp_2026", ascending=False).iloc[0]
        bullets.append(
            f"Most fragmented region (2026): {max_row['region']} with ENP {float(max_row['enp_2026']):.2f}."
        )
    if not ped_reg.empty:
        top_p = ped_reg.iloc[0]
        bullets.append(
            f"Highest Pedersen volatility: {top_p['region']} at {float(top_p['pedersen']):.1f} — biggest party-share churn."
        )
    if not repgap26.empty:
        rg = repgap26.sort_values("representation_gap_pp", ascending=False).iloc[0]
        bullets.append(
            f"Largest 2026 seat-vs-vote amplification: {rg['party_norm']} with {float(rg['representation_gap_pp']):+.1f} pp gap (seats > votes)."
        )
    if not races.empty:
        multi = races[races["race_type"].astype(str).str.startswith("Multi")]
        if not multi.empty:
            bullets.append(
                f"{int(multi.iloc[0]['count'])} of 234 ACs were multi-cornered races in 2026 (top-2 combined share under 70%)."
            )
    return bullets


def get_insights(year: str = "2026") -> dict:
    """Neutral narrative bullets per dashboard page (ECI-derived, descriptive only)."""
    year = _normalize_year(year)
    comp = load("ac_comparison")
    s21 = load("ac_summary_2021")
    s26 = load("ac_summary_2026")
    sankey = load("sankey_edges")
    flips_reg = load("flips_by_region")
    retention = load("party_retention")
    vote21 = load("vote_share_2021")
    vote26 = load("vote_share_2026")

    n = len(comp)
    flips = int(comp["flip_norm"].sum())
    tvk = int((s26["winner_party_norm"] == "TVK").sum())
    dmk21 = int((s21["winner_party_norm"] == "DMK").sum())
    m21 = round(float(comp["margin_pct_2021"].mean()), 1)
    m26 = round(float(comp["margin_pct_2026"].mean()), 1)
    under35_26 = int((s26["winner_share_pct"] < 35).sum())
    under35_21 = int((s21["winner_share_pct"] < 35).sum())
    over50 = int((s26["winner_share_pct"] > 50).sum())
    under5 = int((comp["margin_pct_2026"] < 5).sum())

    top_flow = sankey.nlargest(1, "seats").iloc[0]
    top_flip_region = flips_reg.sort_values("flip_pct", ascending=False).iloc[0]
    lowest_flip_region = flips_reg.sort_values("flip_pct", ascending=True).iloc[0]
    dmk_ret = retention[retention["party"] == "DMK"]
    dmk_ret_pct = float(dmk_ret["retention_pct"].iloc[0]) if len(dmk_ret) else 0
    dmk_held = int(dmk_ret["seats_won_2021"].iloc[0]) if len(dmk_ret) else 0
    dmk_kept = int(dmk_ret["retained_2026"].iloc[0]) if len(dmk_ret) else 0

    avg_candidates = round(float(comp["n_candidates_2026"].mean()), 1)
    max_candidates = int(comp["n_candidates_2026"].max())
    turnout_2021_avg = round(float(comp["turnout_pct_2021"].mean()), 1)
    tvk_vote = vote26[vote26["party_norm"] == "TVK"]
    tvk_share = float(tvk_vote["vote_share_pct"].iloc[0]) if len(tvk_vote) else 0.0
    dmk_vote21 = float(vote21[vote21["party_norm"] == "DMK"]["vote_share_pct"].iloc[0])

    sc_flips = load("flips_by_reserved")
    sc_row = sc_flips[sc_flips["reserved"] == "SC"].iloc[0]

    adv = _load_optional("advanced_summary")
    adv_map: dict[str, float] = {}
    if not adv.empty:
        adv_map = {row["metric"]: float(row["value"]) for _, row in adv.iterrows()}
    enp21 = adv_map.get("enp_statewide_2021", 0)
    enp26 = adv_map.get("enp_statewide_2026", 0)
    ped = adv_map.get("pedersen_statewide", 0)
    lsq21 = adv_map.get("gallagher_lsq_2021", 0)
    lsq26 = adv_map.get("gallagher_lsq_2026", 0)

    enp_reg = _load_optional("enp_by_region")
    pedersen_reg = _load_optional("pedersen_by_region")
    repgap26 = _load_optional("representation_gap_2026")
    races = _load_optional("race_type_summary")

    reg21 = load("regional_seats_2021")
    dmk_chennai = reg21[(reg21["region"] == "Chennai Metro") & (reg21["winner_party_norm"] == "DMK")][
        "seats"
    ].sum()

    headline_2026 = (
        f"Across 234 constituencies, TVK won {tvk} seats in 2026; "
        f"{flips} ({round(100 * flips / n, 1)}%) changed normalized winner vs 2021."
    )
    headline_2021 = (
        f"In 2021, DMK led with {dmk21} seats on normalized labels; "
        f"average winning margin was {m21}%."
    )

    data_scope = {
        "has_booth_level": False,
        "has_age_demographics": False,
        "has_turnout_2026": bool(comp["turnout_pct_2026"].notna().any()),
        "has_turnout_2021": bool(comp["turnout_pct_2021"].notna().any()),
        "has_constituency_level": True,
        "note": (
            "Starter ECI CSVs are candidate-level per assembly constituency — not polling-booth "
            "or voter-age tables. Turnout in the 2026 file is blank; 2021 turnout is used where shown."
        ),
    }

    pages_by_year = {
        "overview": {
            "2021": [
                f"DMK won {dmk21} of 234 seats in 2021 — the largest block on normalized party labels.",
                f"Statewide DMK vote share was {dmk_vote21:.1f}% of valid votes (excluding NOTA).",
                f"{under35_21} winners held under 35% of valid votes — pluralities, not majority mandates.",
            ],
            "2026": [
                f"TVK holds {tvk} of 234 seats on normalized party labels — the largest single-party block in this file.",
                f"Average winning margin fell from {m21}% (2021) to {m26}% (2026), indicating closer races on average.",
                f"{under35_26} winners took under 35% of valid votes in 2026 — pluralities, not majority mandates.",
            ],
        },
        "geography": {
            "2021": [
                f"DMK held {int(dmk_chennai)} seats in Chennai Metro macro-region in 2021 (stacked bar).",
                "District map always shows 2026 winners; use the year toggle for regional seat stacks.",
                "Macro-regions group 234 ACs into six descriptive zones — not administrative districts.",
            ],
            "2026": [
                f"Highest macro-region flip rate: {top_flip_region['region']} ({float(top_flip_region['flip_pct']):.1f}% of ACs).",
                f"Lowest flip rate among regions: {lowest_flip_region['region']} ({float(lowest_flip_region['flip_pct']):.1f}%).",
                "District map colors districts by 2026 winner; flip mode shows 2021→2026 change intensity.",
            ],
        },
    }

    static_pages = {
        "flows": [
            f"Largest seat flow: {top_flow['source']} (2021) → {top_flow['target']} (2026), {int(top_flow['seats'])} constituencies ({round(100 * int(top_flow['seats']) / n, 1)}% of 234).",
            f"DMK retained {dmk_kept} of {dmk_held} seats it won in 2021 ({dmk_ret_pct:.0f}% retention on this label).",
            f"{flips} ACs ({round(100 * flips / n, 1)}%) changed normalized winner — band width in the Sankey is seat count.",
        ],
        "margins": [
            f"Mean winning margin fell from {m21}% (2021) to {m26}% (2026) — races tightened on average.",
            f"{under5} constituencies had a 2026 winning margin under 5 percentage points; {under35_26} winners held under 35% vote share.",
            f"Only {over50} winners cleared 50% of valid votes in 2026 — few majority mandates on the ballot.",
        ],
        "reserved": [
            f"SC-reserved seats: {int(sc_row['flips'])} flips of {int(sc_row['total_acs'])} ({float(sc_row['flip_pct']):.1f}%) — compare to statewide {round(100 * flips / n, 1)}% flip rate.",
            "188 GEN, 44 SC, and 2 ST constituencies — same reservation map in 2021 and 2026.",
            "Seat counts by category describe outcomes on normalized party labels, not demographic voting.",
        ],
        "depth": [
            f"2021 average reported turnout: {turnout_2021_avg}% (constituency-level in starter CSV).",
            f"2026 ballot lists averaged {avg_candidates} candidates per AC (max {max_candidates} on one ballot).",
            "Booth-level and age breakdowns are not in the provided ECI starter files.",
        ],
        "explorer": [
            "Filters apply to all 234 ACs — scatter, table, and detail card update together.",
            "Points below the dashed diagonal had a lower 2026 margin than in 2021 (tighter races).",
            "Use region chips to compare macro-zones; click any AC for winner and margin detail.",
        ],
        "deep": _deep_bullets(enp21, enp26, ped, lsq21, lsq26, enp_reg, pedersen_reg, repgap26, races),
    }

    tvk_seat_pct = round(100 * tvk / n, 1)
    dmk_seat_pct = round(100 * dmk21 / n, 1)
    chart_takeaways = {
        "overview": {
            "seat_tally": (
                f"TVK's {tvk} seats = {tvk_seat_pct}% of the assembly — majority needs 118."
                if year == "2026"
                else f"DMK's {dmk21} seats = {dmk_seat_pct}% of the assembly — majority needs 118."
            ),
            "vote_share": (
                f"TVK won {tvk_share:.1f}% of valid votes statewide — compare seat share vs vote share on Deep insights."
                if year == "2026"
                else f"DMK held {dmk_vote21:.1f}% statewide vote share in 2021 on normalized labels."
            ),
            "mosaic": f"{flips} of {n} tiles ({round(100 * flips / n, 1)}%) changed winner colour vs 2021 — scan clusters for regional churn.",
        },
        "geography": {
            "district_map": (
                f"Highest flip macro-region: {top_flip_region['region']} ({float(top_flip_region['flip_pct']):.1f}% of its ACs)."
                if year == "2026"
                else "Map shows 2026 winners; regional stack below reflects 2021 seat split."
            ),
            "regional_seats": (
                f"Stack heights sum seats per macro-region in {year} — totals printed above each column."
            ),
            "flip_rate": f"Statewide flip rate: {round(100 * flips / n, 1)}% — bars rank macro-regions by % of ACs that changed winner.",
            "vote_share_region": f"100% stacked bars show how valid votes split by party within each macro-region ({year}).",
        },
        "flows": {
            "sankey": f"Thickest band: {top_flow['source']} → {top_flow['target']} ({int(top_flow['seats'])} seats).",
            "retention": f"DMK kept {dmk_kept}/{dmk_held} seats won in 2021 ({dmk_ret_pct:.0f}% retention).",
        },
        "margins": {
            "scatter": f"State averages: {m21}% margin (2021) vs {m26}% (2026). Below the diagonal = tighter race in 2026.",
            "buckets": f"{under35_26} winners under 35% vote share — pluralities, not majority mandates.",
            "closest": f"{under5} races decided by under 5 percentage points in 2026.",
        },
        "reserved": {
            "flip": f"SC-reserved flip rate {float(sc_row['flip_pct']):.1f}% vs statewide {round(100 * flips / n, 1)}%.",
            "seats": "Seat bars by party within each reservation category (2026 winners).",
        },
        "depth": {
            "turnout_region": f"2021 turnout averages {turnout_2021_avg}% statewide — 2026 turnout not in starter CSV.",
            "turnout_delta": "Constituencies with the largest reported turnout gain vs 2021 (when 2026 per-AC data is loaded).",
            "turnout_margin": "Each dot links 2021 turnout to 2026 margin — descriptive only, not causal.",
            "candidates": f"Mean {avg_candidates} candidates per 2026 ballot — crowded races correlate with lower winner shares.",
            "nota": "Highest NOTA shares flag constituencies where protest / withheld preference was largest.",
        },
        "deep": {
            "enp": f"Statewide effective parties: {enp21:.2f} (2021) → {enp26:.2f} (2026) — more fragmentation in vote shares.",
            "pedersen": f"Statewide Pedersen volatility: {ped:.1f} — net party vote-share churn between elections.",
            "swing": "Green = party gained vote share vs 2021 in that region; red = loss (percentage points).",
            "anti_inc": "Share of seats where the 2021 winning party did not retain the seat in 2026.",
            "rep_gap": "Bars compare seat share vs vote share — gap shows over- or under-representation in seats.",
            "race_type": "Multi-cornered races: top two combined under 70% of valid votes in 2026.",
        },
        "explorer": {
            "tally": "Seat bars reflect only constituencies matching your active filters.",
            "scatter": "Below the diagonal: 2026 margin lower than 2021 (tighter race) in the filtered set.",
        },
    }

    pages: dict = {}
    for key, val in pages_by_year.items():
        pages[key] = val.get(year, val["2026"])
    for key, val in static_pages.items():
        pages[key] = val

    research_notes = {
        "geography": {
            "title": "Geographic patterns",
            "bullets": [
                f"2026: highest flip rate in {top_flip_region['region']} ({float(top_flip_region['flip_pct']):.1f}% of ACs).",
                f"2021: DMK led Chennai Metro with {int(dmk_chennai)} seats in this file.",
                "Use Geography regional stacks + district map; map layer is 2026-only.",
            ],
        },
        "flows": {
            "title": "Seat flips (2021 → 2026)",
            "bullets": [
                f"{flips} constituencies ({round(100 * flips / n, 1)}%) changed normalized winner between elections.",
                f"Largest flow: {top_flow['source']} → {top_flow['target']} ({int(top_flow['seats'])} seats).",
                "Seat flows page Sankey summarizes party-to-party seat movement.",
            ],
        },
        "vote_share": {
            "title": "Vote share & TVK",
            "bullets": [
                f"TVK won {tvk} seats and {tvk_share:.1f}% statewide valid vote share in 2026.",
                f"2021 DMK vote share was {dmk_vote21:.1f}% — compare via Overview year toggle.",
                "Vote share bars exclude NOTA; party labels normalized before aggregation.",
            ],
        },
        "reserved": {
            "title": "Reserved constituencies",
            "bullets": [
                f"SC-reserved: {int(sc_row['flips'])} flips of {int(sc_row['total_acs'])} seats ({float(sc_row['flip_pct']):.1f}%).",
                "188 GEN, 44 SC, 2 ST — reservation category unchanged between cycles in master file.",
                "Reserved page shows 2026 seat split by party within each category.",
            ],
        },
        "turnout": {
            "title": "Turnout",
            "bullets": [
                f"2021 average constituency turnout in CSV: {turnout_2021_avg}%.",
                "2026 turnout column is blank in starter data — Depth page uses 2021 only for turnout charts.",
                "No booth-level turnout in provided files.",
            ],
        },
        "margins": {
            "title": "Margins & fragmentation",
            "bullets": [
                f"Mean margin: {m21}% (2021) vs {m26}% (2026).",
                f"{under35_26} winners in 2026 under 35% vote share; {under5} seats under 5pt margin.",
                "Margins page scatter compares both years per AC.",
            ],
        },
        "electoral_arithmetic": {
            "title": "Electoral arithmetic",
            "bullets": [
                f"Effective number of parties rose from {enp21} to {enp26} (Laakso–Taagepera, vote-weighted).",
                f"Pedersen volatility index: {ped} — net party vote-share churn between 2021 and 2026.",
                f"Gallagher disproportionality fell from {lsq21} to {lsq26} — seats matched votes more closely in 2026.",
            ],
        },
    }

    return {
        "year": year,
        "headline": headline_2026 if year == "2026" else headline_2021,
        "headline_2026": headline_2026,
        "headline_2021": headline_2021,
        "data_scope": data_scope,
        "research_notes": research_notes,
        "pages": pages,
        "chart_takeaways": chart_takeaways,
    }


def get_editorial_plan() -> dict:
    """Editorial brief for AtliQ 60-minute special (neutral, ECI-only)."""
    ins = get_insights("2026")
    notes = ins["research_notes"]

    return {
        "headline": ins["headline_2026"],
        "briefing_intro": (
            "A neutral, fact-only briefing for a one-hour Tamil Nadu assembly results special. "
            "Lead with fragmentation and seat churn, then vote share; use regional and reserved "
            "breakdowns only if time allows. Close with data limitations."
        ),
        "core_narratives": [
            {
                "title": notes["margins"]["title"],
                "summary": notes["margins"]["bullets"][0],
                "path": "/margins",
                "label": "Margins & fragmentation",
            },
            {
                "title": notes["flows"]["title"],
                "summary": notes["flows"]["bullets"][0],
                "path": "/flows",
                "label": "Seat flows",
            },
            {
                "title": notes["vote_share"]["title"],
                "summary": notes["vote_share"]["bullets"][0],
                "path": "/overview",
                "label": "Statewide totals",
            },
        ],
        "supporting_views": [
            {
                "label": "Geography",
                "summary": notes["geography"]["bullets"][0],
                "path": "/geography",
            },
            {
                "label": "Reserved seats",
                "summary": notes["reserved"]["bullets"][0],
                "path": "/reserved",
            },
            {
                "label": "Ballots & turnout",
                "summary": notes["turnout"]["bullets"][1],
                "path": "/depth",
            },
        ],
        "run_of_show": [
            {
                "minutes": 10,
                "title": "Opening — statewide arithmetic",
                "why": "Seat tally, vote share, and headline KPIs before regional detail.",
                "path": "/overview",
            },
            {
                "minutes": 15,
                "title": "Regional picture",
                "why": "Where flips clustered; district map and macro-region bars.",
                "path": "/geography",
            },
            {
                "minutes": 10,
                "title": "Churn and close races",
                "why": "Margins, plurality wins, and 2021→2026 seat flows.",
                "path": "/margins",
            },
            {
                "minutes": 5,
                "title": "Sources and caveats",
                "why": "ECI files, normalization, missing 2026 turnout.",
                "path": "/methods",
            },
        ],
        "explorer": {
            "path": "/explorer",
            "description": (
                "Filter constituencies by region, reservation, party, or flip status; "
                "see matching KPIs, charts, and a sortable table for follow-up questions."
            ),
        },
        "limitations": [
            ins["data_scope"]["note"],
            "Party labels normalized before seat and flip counts; independents remain IND.",
            "2026 turnout is not in the provided results file.",
            "Counts are descriptive only — no forecasts or explanations of why parties gained or lost.",
        ],
    }


def get_election_meta() -> dict:
    import json

    path = ROOT / "config" / "election.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {"jurisdiction": "Tamil Nadu", "constituency_count": 234}


def get_turnout_by_region() -> list[dict]:
    comp = load("ac_comparison")
    out = (
        comp.groupby("region", as_index=False)["turnout_pct_2021"]
        .mean()
        .rename(columns={"turnout_pct_2021": "avg_turnout_pct"})
    )
    return [
        {"region": r["region"], "avg_turnout_pct": round(float(r["avg_turnout_pct"]), 1)}
        for _, r in out.iterrows()
    ]


def get_candidate_buckets() -> list[dict]:
    comp = load("ac_comparison")
    bins = [0, 10, 15, 20, 30, 100]
    labels = ["6–10", "11–15", "16–20", "21–30", "31+"]
    comp = comp.copy()
    comp["bucket"] = pd.cut(
        comp["n_candidates_2026"],
        bins=bins,
        labels=labels,
        right=True,
    )
    counts = comp["bucket"].value_counts().sort_index()
    return [{"bucket": str(idx), "count": int(counts[idx])} for idx in counts.index]


def get_nota_all() -> list[dict]:
    df = load("nota_2026")
    return [
        {
            "ac_number": int(r["ac_number"]),
            "ac_name": r["constituency"],
            "region": r["region"],
            "nota_pct": float(r["nota_pct"]),
        }
        for _, r in df.iterrows()
    ]
