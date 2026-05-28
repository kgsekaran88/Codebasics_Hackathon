"""Constituency-level election metrics."""

from __future__ import annotations

import pandas as pd

from src.party_normalize import apply_party_column


def _valid_candidate_rows(df: pd.DataFrame) -> pd.DataFrame:
    d = apply_party_column(df)
    return d[d["party_norm"] != "NOTA"].copy()


def constituency_summary(results: pd.DataFrame) -> pd.DataFrame:
    """One row per ac_number with winner, runner-up, shares, margin."""
    d = _valid_candidate_rows(results)
    d["votes"] = pd.to_numeric(d["votes"], errors="coerce").fillna(0).astype(int)

    rows = []
    for ac, g in d.groupby("ac_number", sort=True):
        g = g.sort_values("votes", ascending=False)
        valid = g["votes"].sum()
        if valid == 0:
            continue
        w = g.iloc[0]
        ru = g.iloc[1] if len(g) > 1 else None
        turnout = g["turnout"].dropna()
        turnout_val = float(turnout.iloc[0]) if len(turnout) else None

        rows.append(
            {
                "ac_number": int(ac),
                "constituency": w["constituency"],
                "region": w.get("region"),
                "reserved": w.get("reserved"),
                "valid_votes": int(valid),
                "n_candidates": len(g),
                "winner": w["candidate"],
                "winner_party": w["party"],
                "winner_party_norm": w["party_norm"],
                "winner_votes": int(w["votes"]),
                "winner_share_pct": round(100 * w["votes"] / valid, 2),
                "runner_up": ru["candidate"] if ru is not None else None,
                "runner_up_party_norm": ru["party_norm"] if ru is not None else None,
                "runner_up_votes": int(ru["votes"]) if ru is not None else None,
                "margin_pct": round(100 * (w["votes"] - (ru["votes"] if ru is not None else 0)) / valid, 2)
                if ru is not None
                else 100.0,
                "turnout_pct": turnout_val,
            }
        )
    return pd.DataFrame(rows).sort_values("ac_number")


def build_comparison(
    s21: pd.DataFrame, s26: pd.DataFrame, master: pd.DataFrame
) -> pd.DataFrame:
    m = master[["ac_number", "constituency", "district", "region", "reserved"]].drop_duplicates(
        "ac_number"
    )
    c = s21.add_suffix("_2021").merge(s26.add_suffix("_2026"), left_on="ac_number_2021", right_on="ac_number_2026")
    c["ac_number"] = c["ac_number_2021"].astype(int)
    c["flip_raw"] = c["winner_party_2021"] != c["winner_party_2026"]
    c["flip_norm"] = c["winner_party_norm_2021"] != c["winner_party_norm_2026"]
    c["margin_delta"] = c["margin_pct_2026"] - c["margin_pct_2021"]
    c = c.merge(m, on="ac_number", how="left", suffixes=("", "_m"))
    if "constituency_m" in c.columns:
        c["constituency"] = c["constituency_m"].fillna(c.get("constituency_2026"))
    return c


def party_vote_shares(results: pd.DataFrame) -> pd.DataFrame:
    """Statewide vote share by normalized party."""
    d = _valid_candidate_rows(results)
    d["votes"] = pd.to_numeric(d["votes"], errors="coerce").fillna(0)
    total = d["votes"].sum()
    by_party = d.groupby("party_norm")["votes"].sum().reset_index()
    by_party["vote_share_pct"] = (100 * by_party["votes"] / total).round(2)
    return by_party.sort_values("votes", ascending=False)


def regional_seats(summary: pd.DataFrame) -> pd.DataFrame:
    return (
        summary.groupby(["region", "winner_party_norm"], observed=True)
        .size()
        .reset_index(name="seats")
    )
