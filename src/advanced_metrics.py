"""Advanced electoral metrics — political-science-standard, neutral, ECI-only.

All measures are descriptive. We compute structural indices from publicly
reported votes and seats. No causal attribution.

References (concept names — used internally, not on screen unless explicitly
labeled in UI):

- Effective Number of Parties (ENP)        — Laakso & Taagepera (1979)
- Pedersen Index (volatility)              — Pedersen (1979)
- Loosemore-Hanby disproportionality (LH)  — Loosemore & Hanby (1971)
- Gallagher disproportionality (LSq)       — Gallagher (1991)

These are non-partisan standard measures of electoral systems.
"""

from __future__ import annotations

from typing import Dict

import numpy as np
import pandas as pd

from src.party_normalize import apply_party_column


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _valid(df: pd.DataFrame) -> pd.DataFrame:
    d = apply_party_column(df)
    d = d[d["party_norm"] != "NOTA"].copy()
    d["votes"] = pd.to_numeric(d["votes"], errors="coerce").fillna(0)
    return d


def _enp(shares_pct: pd.Series) -> float:
    """ENP from vote share % (Laakso-Taagepera). shares must sum to ~100."""
    p = shares_pct / 100.0
    denom = (p ** 2).sum()
    return float(1 / denom) if denom > 0 else 0.0


# ---------------------------------------------------------------------------
# Effective Number of Parties — statewide and per region, per year
# ---------------------------------------------------------------------------


def enp_statewide(raw: pd.DataFrame) -> float:
    d = _valid(raw)
    total = d["votes"].sum()
    if total == 0:
        return 0.0
    shares = (d.groupby("party_norm")["votes"].sum() * 100 / total)
    return round(_enp(shares), 2)


def enp_by_region(raw: pd.DataFrame) -> pd.DataFrame:
    d = _valid(raw)
    rows = []
    for region, g in d.groupby("region", observed=True):
        total = g["votes"].sum()
        if total == 0:
            continue
        shares = g.groupby("party_norm")["votes"].sum() * 100 / total
        rows.append({"region": region, "enp": round(_enp(shares), 2)})
    return pd.DataFrame(rows).sort_values("enp", ascending=False)


# ---------------------------------------------------------------------------
# Pedersen volatility — net change in statewide vote share between elections
# ---------------------------------------------------------------------------


def pedersen_index(v21: pd.DataFrame, v26: pd.DataFrame) -> float:
    """Pedersen volatility = sum(|share_t - share_{t-1}|) / 2.

    Inputs: long-form vote share tables with columns `party_norm`, `vote_share_pct`.
    Returns a float in [0, 100] — 0 means identical party shares, 100 maximum churn.
    """
    a = v21.set_index("party_norm")["vote_share_pct"]
    b = v26.set_index("party_norm")["vote_share_pct"]
    parties = a.index.union(b.index)
    diff = a.reindex(parties, fill_value=0) - b.reindex(parties, fill_value=0)
    return round(float(diff.abs().sum() / 2), 2)


def pedersen_by_region(raw21: pd.DataFrame, raw26: pd.DataFrame) -> pd.DataFrame:
    def regional_shares(raw: pd.DataFrame) -> pd.DataFrame:
        d = _valid(raw)
        totals = d.groupby("region", observed=True)["votes"].sum().rename("total")
        by = (
            d.groupby(["region", "party_norm"], observed=True)["votes"]
            .sum()
            .reset_index()
            .merge(totals, on="region")
        )
        by["share"] = 100 * by["votes"] / by["total"]
        return by[["region", "party_norm", "share"]]

    a = regional_shares(raw21)
    b = regional_shares(raw26)
    rows = []
    for region in sorted(set(a["region"]).union(set(b["region"]))):
        s21 = a[a["region"] == region].set_index("party_norm")["share"]
        s26 = b[b["region"] == region].set_index("party_norm")["share"]
        parties = s21.index.union(s26.index)
        diff = s21.reindex(parties, fill_value=0) - s26.reindex(parties, fill_value=0)
        rows.append({"region": region, "pedersen": round(float(diff.abs().sum() / 2), 2)})
    return pd.DataFrame(rows).sort_values("pedersen", ascending=False)


# ---------------------------------------------------------------------------
# Swing — change in party vote share by region (2021 → 2026)
# ---------------------------------------------------------------------------


def swing_by_region(raw21: pd.DataFrame, raw26: pd.DataFrame, parties: list[str]) -> pd.DataFrame:
    def share(raw: pd.DataFrame) -> pd.DataFrame:
        d = _valid(raw)
        totals = d.groupby("region", observed=True)["votes"].sum().rename("total")
        by = (
            d.groupby(["region", "party_norm"], observed=True)["votes"]
            .sum()
            .reset_index()
            .merge(totals, on="region")
        )
        by["share"] = (100 * by["votes"] / by["total"]).round(2)
        return by

    a = share(raw21)[["region", "party_norm", "share"]].rename(columns={"share": "share_2021"})
    b = share(raw26)[["region", "party_norm", "share"]].rename(columns={"share": "share_2026"})
    m = a.merge(b, on=["region", "party_norm"], how="outer").fillna(0)
    m = m[m["party_norm"].isin(parties)]
    m["swing_pp"] = (m["share_2026"] - m["share_2021"]).round(2)
    return m.sort_values(["region", "party_norm"])


# ---------------------------------------------------------------------------
# Anti-incumbency rate — share of seats where 2021 winner party did NOT win in 2026
# ---------------------------------------------------------------------------


def anti_incumbency(comp: pd.DataFrame) -> pd.DataFrame:
    rows = []
    overall = float(comp["flip_norm"].mean()) * 100
    rows.append(
        {"slice": "Statewide", "label": "All ACs", "incumbent_lost_pct": round(overall, 1), "n": int(len(comp))}
    )
    for region, g in comp.groupby("region", observed=True):
        rows.append(
            {
                "slice": "Region",
                "label": region,
                "incumbent_lost_pct": round(100 * float(g["flip_norm"].mean()), 1),
                "n": int(len(g)),
            }
        )
    for cat, g in comp.groupby("reserved", observed=True):
        rows.append(
            {
                "slice": "Reserved",
                "label": cat,
                "incumbent_lost_pct": round(100 * float(g["flip_norm"].mean()), 1),
                "n": int(len(g)),
            }
        )
    for party, g in comp.groupby("winner_party_norm_2021", observed=True):
        if len(g) < 3:
            continue
        rows.append(
            {
                "slice": "Party_2021",
                "label": party,
                "incumbent_lost_pct": round(100 * float(g["flip_norm"].mean()), 1),
                "n": int(len(g)),
            }
        )
    return pd.DataFrame(rows)


# ---------------------------------------------------------------------------
# Vote-to-seat efficiency and representation gap
# ---------------------------------------------------------------------------


def representation_gap(vote_share_df: pd.DataFrame, seat_count_df: pd.DataFrame, total_seats: int = 234) -> pd.DataFrame:
    """Per party: vote share − seat share (= representation gap, percentage points)."""
    v = vote_share_df.set_index("party_norm")["vote_share_pct"]
    s = seat_count_df.copy()
    if "winner_party_norm" in s.columns:
        s = s.rename(columns={"winner_party_norm": "party_norm"})
    s = s.groupby("party_norm")["seats"].sum() if "seats" in s.columns else s.groupby("party_norm").size()
    s_share = 100 * s / total_seats
    parties = v.index.union(s_share.index)
    out = pd.DataFrame(
        {
            "vote_share_pct": v.reindex(parties, fill_value=0).values,
            "seat_share_pct": s_share.reindex(parties, fill_value=0).round(2).values,
        },
        index=parties,
    )
    out["representation_gap_pp"] = (out["seat_share_pct"] - out["vote_share_pct"]).round(2)
    out["votes_per_seat_index"] = (
        out["vote_share_pct"] / out["seat_share_pct"].replace(0, np.nan)
    ).round(2)
    out = out.reset_index().rename(columns={"index": "party_norm"})
    return out.sort_values("vote_share_pct", ascending=False)


def gallagher_lsq(rep_gap: pd.DataFrame) -> float:
    """Gallagher Least-Squares disproportionality index."""
    diff = rep_gap["seat_share_pct"] - rep_gap["vote_share_pct"]
    return round(float(np.sqrt((diff ** 2).sum() / 2)), 2)


# ---------------------------------------------------------------------------
# District-level wholesale flips (every AC in a district changed normalized winner)
# ---------------------------------------------------------------------------


def district_full_flips(comp: pd.DataFrame) -> pd.DataFrame:
    g = comp.groupby("district", observed=True).agg(
        acs=("ac_number", "count"),
        flips=("flip_norm", "sum"),
    ).reset_index()
    g["flip_pct"] = (100 * g["flips"] / g["acs"]).round(1)
    g["all_flipped"] = g["acs"] == g["flips"]
    return g.sort_values(["all_flipped", "flip_pct"], ascending=[False, False])


# ---------------------------------------------------------------------------
# Bellwether ACs — same normalized winner state-wide leading party as overall
# ---------------------------------------------------------------------------


def bellwether_acs(comp: pd.DataFrame) -> pd.DataFrame:
    """ACs where the winner party in BOTH years matched the statewide top party that year."""
    top21 = comp["winner_party_norm_2021"].value_counts().idxmax()
    top26 = comp["winner_party_norm_2026"].value_counts().idxmax()
    sub = comp[
        (comp["winner_party_norm_2021"] == top21) & (comp["winner_party_norm_2026"] == top26)
    ]
    return sub[
        [
            "ac_number",
            "constituency",
            "region",
            "winner_party_norm_2021",
            "winner_party_norm_2026",
            "margin_pct_2026",
        ]
    ].copy()


# ---------------------------------------------------------------------------
# Two-party / three-party / multi-cornered races (2026)
# ---------------------------------------------------------------------------


def race_competitiveness(raw26: pd.DataFrame) -> pd.DataFrame:
    """Per AC: combined share of top 2 candidates → race type bucket."""
    d = _valid(raw26)
    rows = []
    for ac, g in d.groupby("ac_number"):
        g = g.sort_values("votes", ascending=False)
        valid = g["votes"].sum()
        if valid == 0:
            continue
        top2 = float(g["votes"].iloc[:2].sum() / valid * 100)
        top3 = float(g["votes"].iloc[:3].sum() / valid * 100)
        rows.append({"ac_number": int(ac), "top2_share_pct": round(top2, 2), "top3_share_pct": round(top3, 2)})
    df = pd.DataFrame(rows)
    bins = [0, 70, 85, 101]
    labels = ["Multi-cornered (<70%)", "Three-way (70–85%)", "Two-party (>85%)"]
    df["race_type"] = pd.cut(df["top2_share_pct"], bins=bins, labels=labels, right=False)
    return df


def race_type_summary(race_df: pd.DataFrame) -> pd.DataFrame:
    counts = race_df["race_type"].value_counts()
    return pd.DataFrame({"race_type": counts.index.astype(str), "count": counts.values.astype(int)})


# ---------------------------------------------------------------------------
# TVK winner profile (new entrant — how it won)
# ---------------------------------------------------------------------------


def tvk_winner_profile(s26: pd.DataFrame, comp: pd.DataFrame) -> dict:
    sub = s26[s26["winner_party_norm"] == "TVK"]
    runner_up = sub["runner_up_party_norm"].value_counts().head(5).to_dict()
    return {
        "n_seats": int(len(sub)),
        "mean_margin": round(float(sub["margin_pct"].mean()), 2),
        "median_margin": round(float(sub["margin_pct"].median()), 2),
        "winner_share_mean": round(float(sub["winner_share_pct"].mean()), 2),
        "under_35_pct": int((sub["winner_share_pct"] < 35).sum()),
        "under_5_margin": int((sub["margin_pct"] < 5).sum()),
        "common_runner_ups": runner_up,
        "ac_count": int(len(sub)),
    }


# ---------------------------------------------------------------------------
# Build all tables
# ---------------------------------------------------------------------------


def build_advanced_tables(
    raw21: pd.DataFrame,
    raw26: pd.DataFrame,
    s21: pd.DataFrame,
    s26: pd.DataFrame,
    comp: pd.DataFrame,
    v21: pd.DataFrame,
    v26: pd.DataFrame,
    regional_seats_21: pd.DataFrame,
    regional_seats_26: pd.DataFrame,
) -> Dict[str, pd.DataFrame]:
    parties = ["DMK", "AIADMK", "TVK", "INC", "BJP", "NTK", "PMK", "VCK"]
    rep_21 = representation_gap(v21, regional_seats_21.rename(columns={"winner_party_norm": "party_norm"}))
    rep_26 = representation_gap(v26, regional_seats_26.rename(columns={"winner_party_norm": "party_norm"}))

    enp_reg_21 = enp_by_region(raw21).rename(columns={"enp": "enp_2021"})
    enp_reg_26 = enp_by_region(raw26).rename(columns={"enp": "enp_2026"})
    enp_reg = enp_reg_21.merge(enp_reg_26, on="region", how="outer").fillna(0)

    race_df = race_competitiveness(raw26)
    race_summary = race_type_summary(race_df)

    summary = {
        "enp_statewide_2021": enp_statewide(raw21),
        "enp_statewide_2026": enp_statewide(raw26),
        "pedersen_statewide": pedersen_index(v21, v26),
        "gallagher_lsq_2021": gallagher_lsq(rep_21),
        "gallagher_lsq_2026": gallagher_lsq(rep_26),
        "incumbent_loss_pct": round(100 * float(comp["flip_norm"].mean()), 1),
    }
    summary_df = pd.DataFrame([{"metric": k, "value": v} for k, v in summary.items()])

    return {
        "advanced_summary": summary_df,
        "enp_by_region": enp_reg,
        "pedersen_by_region": pedersen_by_region(raw21, raw26),
        "swing_by_region": swing_by_region(raw21, raw26, parties),
        "anti_incumbency": anti_incumbency(comp),
        "representation_gap_2021": rep_21,
        "representation_gap_2026": rep_26,
        "district_full_flips": district_full_flips(comp),
        "bellwether_acs": bellwether_acs(comp),
        "race_competitiveness": race_df,
        "race_type_summary": race_summary,
    }
