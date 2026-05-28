"""Headline metrics for presentation and walkthrough scripts."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from src.load_data import PROCESSED, ensure_processed


@dataclass
class StoryMetrics:
    tvk_seats: int
    flips_norm: int
    flips_pct: float
    avg_margin_2021: float
    avg_margin_2026: float
    margin_drop: float
    winner_under_35_2026: int
    winner_over_50_2026: int
    under_5_margin_2026: int
    total_acs: int
    dmk_seats_2021: int
    tvk_vote_share_2026: float
    dmk_vote_share_2021: float
    top_flip_region: str
    top_flip_pct: float
    lowest_flip_region: str
    lowest_flip_pct: float
    top_sankey_flows: list[tuple[str, str, int]]
    tvk_by_region: dict[str, int]
    headline: str
    subheadline: str
    enp_2021: float = 0.0
    enp_2026: float = 0.0
    pedersen: float = 0.0
    gallagher_2021: float = 0.0
    gallagher_2026: float = 0.0
    multi_cornered_races: int = 0
    top_pedersen_region: str = ""
    top_pedersen_value: float = 0.0
    chennai_anti_incumbency: float = 0.0
    delta_anti_incumbency: float = 0.0
    tvk_representation_gap: float = 0.0
    bjp_representation_gap: float = 0.0


def load_story_metrics() -> StoryMetrics:
    ensure_processed()
    comp = pd.read_csv(PROCESSED / "ac_comparison.csv")
    s21 = pd.read_csv(PROCESSED / "ac_summary_2021.csv")
    s26 = pd.read_csv(PROCESSED / "ac_summary_2026.csv")
    sankey = pd.read_csv(PROCESSED / "sankey_edges.csv")
    reg26 = pd.read_csv(PROCESSED / "regional_seats_2026.csv")
    flips_reg = pd.read_csv(PROCESSED / "flips_by_region.csv")
    vote26 = pd.read_csv(PROCESSED / "vote_share_2026.csv")
    vote21 = pd.read_csv(PROCESSED / "vote_share_2021.csv")

    n = len(comp)
    flips = int(comp["flip_norm"].sum())
    tvk = int((s26["winner_party_norm"] == "TVK").sum())
    dmk21 = int((s21["winner_party_norm"] == "DMK").sum())
    m21 = float(comp["margin_pct_2021"].mean())
    m26 = float(comp["margin_pct_2026"].mean())
    under35 = int((s26["winner_share_pct"] < 35).sum())
    over50 = int((s26["winner_share_pct"] > 50).sum())
    under5 = int((comp["margin_pct_2026"] < 5).sum())

    def _share(df: pd.DataFrame, party: str) -> float:
        row = df[df["party_norm"] == party]
        return float(row["vote_share_pct"].iloc[0]) if len(row) else 0.0

    tvk_share = _share(vote26, "TVK")
    dmk_share21 = _share(vote21, "DMK")

    top_reg = flips_reg.sort_values("flip_pct", ascending=False).iloc[0]
    low_reg = flips_reg.sort_values("flip_pct", ascending=True).iloc[0]

    flows = sankey.nlargest(6, "seats")
    top_flows = [(r.source, r.target, int(r.seats)) for r in flows.itertuples()]

    tvk_reg = (
        reg26[reg26["winner_party_norm"] == "TVK"]
        .set_index("region")["seats"]
        .to_dict()
    )

    def _opt(name: str) -> pd.DataFrame:
        p = PROCESSED / f"{name}.csv"
        return pd.read_csv(p) if p.exists() else pd.DataFrame()

    adv_summary = _opt("advanced_summary")
    adv_map: dict[str, float] = {}
    if not adv_summary.empty:
        adv_map = {row["metric"]: float(row["value"]) for _, row in adv_summary.iterrows()}

    races = _opt("race_type_summary")
    multi = 0
    if not races.empty:
        m = races[races["race_type"].astype(str).str.startswith("Multi")]
        if not m.empty:
            multi = int(m.iloc[0]["count"])

    ped_reg = _opt("pedersen_by_region")
    top_ped_region = ""
    top_ped_val = 0.0
    if not ped_reg.empty:
        r = ped_reg.iloc[0]
        top_ped_region = str(r["region"])
        top_ped_val = float(r["pedersen"])

    anti = _opt("anti_incumbency")
    chennai_ai = 0.0
    delta_ai = 0.0
    if not anti.empty:
        c = anti[(anti["slice"] == "Region") & (anti["label"] == "Chennai Metro")]
        d = anti[(anti["slice"] == "Region") & (anti["label"] == "Delta")]
        if len(c):
            chennai_ai = float(c.iloc[0]["incumbent_lost_pct"])
        if len(d):
            delta_ai = float(d.iloc[0]["incumbent_lost_pct"])

    repgap = _opt("representation_gap_2026")
    tvk_gap = 0.0
    bjp_gap = 0.0
    if not repgap.empty:
        tvk_row = repgap[repgap["party_norm"] == "TVK"]
        bjp_row = repgap[repgap["party_norm"] == "BJP"]
        if len(tvk_row):
            tvk_gap = float(tvk_row.iloc[0]["representation_gap_pp"])
        if len(bjp_row):
            bjp_gap = float(bjp_row.iloc[0]["representation_gap_pp"])

    headline = (
        "In 2026, Tamil Nadu’s assembly became more fragmented: "
        f"TVK won {tvk} seats, {flips} of {n} constituencies changed hands, "
        f"and average winning margins fell from {m21:.1f}% to {m26:.1f}%."
    )
    subheadline = (
        "A neutral, ECI-based briefing for AtliQ Media — descriptive facts only, "
        "no predictions or causal claims."
    )

    return StoryMetrics(
        tvk_seats=tvk,
        flips_norm=flips,
        flips_pct=round(100 * flips / n, 1),
        avg_margin_2021=round(m21, 1),
        avg_margin_2026=round(m26, 1),
        margin_drop=round(m21 - m26, 1),
        winner_under_35_2026=under35,
        winner_over_50_2026=over50,
        under_5_margin_2026=under5,
        total_acs=n,
        dmk_seats_2021=dmk21,
        tvk_vote_share_2026=round(tvk_share, 1),
        dmk_vote_share_2021=round(dmk_share21, 1),
        top_flip_region=str(top_reg["region"]),
        top_flip_pct=round(float(top_reg["flip_pct"]), 1),
        lowest_flip_region=str(low_reg["region"]),
        lowest_flip_pct=round(float(low_reg["flip_pct"]), 1),
        top_sankey_flows=top_flows,
        tvk_by_region=tvk_reg,
        headline=headline,
        subheadline=subheadline,
        enp_2021=round(adv_map.get("enp_statewide_2021", 0.0), 2),
        enp_2026=round(adv_map.get("enp_statewide_2026", 0.0), 2),
        pedersen=round(adv_map.get("pedersen_statewide", 0.0), 1),
        gallagher_2021=round(adv_map.get("gallagher_lsq_2021", 0.0), 1),
        gallagher_2026=round(adv_map.get("gallagher_lsq_2026", 0.0), 1),
        multi_cornered_races=multi,
        top_pedersen_region=top_ped_region,
        top_pedersen_value=round(top_ped_val, 1),
        chennai_anti_incumbency=round(chennai_ai, 1),
        delta_anti_incumbency=round(delta_ai, 1),
        tvk_representation_gap=round(tvk_gap, 1),
        bjp_representation_gap=round(bjp_gap, 1),
    )
