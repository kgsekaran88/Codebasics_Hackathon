#!/usr/bin/env python3
"""Build processed AC-level tables and Sankey edge list."""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.deep_analysis import build_all_deep_tables
from src.advanced_metrics import build_advanced_tables
from src.metrics import build_comparison, constituency_summary, party_vote_shares, regional_seats
from src.load_data import load_master, load_raw_results

PROCESSED = ROOT / "data" / "processed"
EXTERNAL = ROOT / "data" / "external"


def _merge_external_turnout_2026(comp: pd.DataFrame) -> pd.DataFrame:
    """Overlay 2026 turnout from data/external/turnout_2026.csv if available.

    Expected columns: `ac_number`, `turnout_pct_2026`. Silent no-op if missing.
    """
    path = EXTERNAL / "turnout_2026.csv"
    if not path.exists():
        return comp
    try:
        ext = pd.read_csv(path)
    except Exception:
        return comp
    if "ac_number" not in ext.columns or "turnout_pct_2026" not in ext.columns:
        return comp
    ext = ext[["ac_number", "turnout_pct_2026"]].dropna()
    comp = comp.drop(columns=["turnout_pct_2026"], errors="ignore")
    comp = comp.merge(ext, on="ac_number", how="left")
    print(f"Merged {ext['turnout_pct_2026'].notna().sum()} 2026 turnout rows from {path.name}")
    return comp


def sankey_edges(comparison: pd.DataFrame, top_n: int = 12) -> pd.DataFrame:
    flows = (
        comparison.groupby(["winner_party_norm_2021", "winner_party_norm_2026"])
        .size()
        .reset_index(name="seats")
    )
    flows = flows.rename(
        columns={
            "winner_party_norm_2021": "source",
            "winner_party_norm_2026": "target",
        }
    )
    # Keep top parties by total seat involvement
    parties = set(flows["source"]) | set(flows["target"])
    strength = {}
    for p in parties:
        strength[p] = flows.loc[flows["source"] == p, "seats"].sum() + flows.loc[
            flows["target"] == p, "seats"
        ].sum()
    top_parties = sorted(parties, key=lambda p: strength.get(p, 0), reverse=True)[:top_n]
    top_set = set(top_parties)

    def bucket(p: str) -> str:
        return p if p in top_set else "Other"

    flows["source"] = flows["source"].map(bucket)
    flows["target"] = flows["target"].map(bucket)
    return flows.groupby(["source", "target"], as_index=False)["seats"].sum().sort_values(
        "seats", ascending=False
    )


def main() -> None:
    PROCESSED.mkdir(parents=True, exist_ok=True)
    master = load_master()
    r21 = load_raw_results(2021)
    r26 = load_raw_results(2026)

    s21 = constituency_summary(r21)
    s26 = constituency_summary(r26)
    comp = build_comparison(s21, s26, master)
    comp = _merge_external_turnout_2026(comp)

    s21.to_csv(PROCESSED / "ac_summary_2021.csv", index=False)
    s26.to_csv(PROCESSED / "ac_summary_2026.csv", index=False)
    comp.to_csv(PROCESSED / "ac_comparison.csv", index=False)
    sankey_edges(comp).to_csv(PROCESSED / "sankey_edges.csv", index=False)
    party_vote_shares(r21).to_csv(PROCESSED / "vote_share_2021.csv", index=False)
    party_vote_shares(r26).to_csv(PROCESSED / "vote_share_2026.csv", index=False)
    regional_seats(s21).to_csv(PROCESSED / "regional_seats_2021.csv", index=False)
    regional_seats(s26).to_csv(PROCESSED / "regional_seats_2026.csv", index=False)

    deep = build_all_deep_tables(s21, s26, comp, r21, r26)
    for name, df in deep.items():
        df.to_csv(PROCESSED / f"{name}.csv", index=False)

    advanced = build_advanced_tables(
        r21,
        r26,
        s21,
        s26,
        comp,
        party_vote_shares(r21),
        party_vote_shares(r26),
        regional_seats(s21),
        regional_seats(s26),
    )
    for name, df in advanced.items():
        df.to_csv(PROCESSED / f"{name}.csv", index=False)

    print(f"Wrote {len(s21)} rows to ac_summary_2021.csv")
    print(f"Wrote {len(s26)} rows to ac_summary_2026.csv")
    print(f"Flips (normalized): {comp['flip_norm'].sum()}")
    print(f"TVK seats 2026: {(s26['winner_party_norm'] == 'TVK').sum()}")


if __name__ == "__main__":
    main()
