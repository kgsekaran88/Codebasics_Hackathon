"""Extended analytics for dashboard and exports."""

from __future__ import annotations

import pandas as pd

from src.metrics import constituency_summary, party_vote_shares
from src.party_normalize import apply_party_column

MAJOR_PARTIES = ["TVK", "DMK", "AIADMK", "INC", "BJP", "NTK", "PMK", "VCK", "IND"]


def seat_tally(s21: pd.DataFrame, s26: pd.DataFrame) -> pd.DataFrame:
    t21 = s21.groupby("winner_party_norm").size().reset_index(name="seats_2021")
    t26 = s26.groupby("winner_party_norm").size().reset_index(name="seats_2026")
    m = t21.merge(t26, on="winner_party_norm", how="outer").fillna(0)
    m["seats_2021"] = m["seats_2021"].astype(int)
    m["seats_2026"] = m["seats_2026"].astype(int)
    m["change"] = m["seats_2026"] - m["seats_2021"]
    return m.sort_values("seats_2026", ascending=False)


def party_retention(comp: pd.DataFrame) -> pd.DataFrame:
    """Seats held by same party 2021→2026 vs lost."""
    rows = []
    for party in comp["winner_party_norm_2021"].unique():
        held_2021 = comp[comp["winner_party_norm_2021"] == party]
        retained = (held_2021["winner_party_norm_2026"] == party).sum()
        total_2021 = len(held_2021)
        rows.append(
            {
                "party": party,
                "seats_won_2021": total_2021,
                "retained_2026": int(retained),
                "retention_pct": round(100 * retained / total_2021, 1) if total_2021 else 0,
                "lost_to_other": int(total_2021 - retained),
            }
        )
    return pd.DataFrame(rows).sort_values("seats_won_2021", ascending=False)


def flips_by_region(comp: pd.DataFrame) -> pd.DataFrame:
    g = comp.groupby("region", observed=True).agg(
        total_acs=("ac_number", "count"),
        flips=("flip_norm", "sum"),
    ).reset_index()
    g["flip_pct"] = (100 * g["flips"] / g["total_acs"]).round(1)
    return g.sort_values("flips", ascending=False)


def flips_by_reserved(comp: pd.DataFrame) -> pd.DataFrame:
    g = comp.groupby("reserved", observed=True).agg(
        total_acs=("ac_number", "count"),
        flips=("flip_norm", "sum"),
    ).reset_index()
    g["flip_pct"] = (100 * g["flips"] / g["total_acs"]).round(1)
    return g


def reserved_seat_breakdown(comp: pd.DataFrame) -> pd.DataFrame:
    """Winner party counts by reserved category and year."""
    rows = []
    for reserved in ["GEN", "SC", "ST"]:
        sub = comp[comp["reserved"] == reserved]
        for year_col, label in [
            ("winner_party_norm_2021", "2021"),
            ("winner_party_norm_2026", "2026"),
        ]:
            counts = sub[year_col].value_counts()
            for party, seats in counts.items():
                rows.append(
                    {"reserved": reserved, "year": label, "party": party, "seats": int(seats)}
                )
    return pd.DataFrame(rows)


def closest_races(comp: pd.DataFrame, n: int = 25) -> pd.DataFrame:
    cols = [
        "ac_number",
        "constituency",
        "district",
        "region",
        "reserved",
        "winner_party_norm_2026",
        "margin_pct_2026",
        "winner_share_pct_2026",
        "flip_norm",
    ]
    avail = [c for c in cols if c in comp.columns]
    return comp.nsmallest(n, "margin_pct_2026")[avail]


def landslide_races(comp: pd.DataFrame, threshold: float = 20.0) -> pd.DataFrame:
    return comp[comp["margin_pct_2026"] >= threshold].sort_values(
        "margin_pct_2026", ascending=False
    )


def winner_share_buckets(s26: pd.DataFrame) -> pd.DataFrame:
    bins = [0, 35, 40, 50, 100]
    labels = ["<35%", "35–50%", "50%+"]
    s = s26.copy()
    s["bucket"] = pd.cut(s["winner_share_pct"], bins=[0, 35, 50, 100.1], labels=labels)
    return s.groupby("bucket", observed=True).size().reset_index(name="constituencies")


def margin_summary(comp: pd.DataFrame) -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "metric": "mean_margin_2021",
                "value": round(comp["margin_pct_2021"].mean(), 2),
            },
            {
                "metric": "mean_margin_2026",
                "value": round(comp["margin_pct_2026"].mean(), 2),
            },
            {
                "metric": "median_margin_2021",
                "value": round(comp["margin_pct_2021"].median(), 2),
            },
            {
                "metric": "median_margin_2026",
                "value": round(comp["margin_pct_2026"].median(), 2),
            },
            {
                "metric": "seats_winner_under_35pct_2026",
                "value": int((comp["winner_share_pct_2026"] < 35).sum()),
            },
            {
                "metric": "seats_winner_over_50pct_2026",
                "value": int((comp["winner_share_pct_2026"] > 50).sum()),
            },
            {
                "metric": "seats_margin_under_5pct_2026",
                "value": int((comp["margin_pct_2026"] < 5).sum()),
            },
        ]
    )


def district_seats(comp: pd.DataFrame, year: str = "2026") -> pd.DataFrame:
    col = f"winner_party_norm_{year}"
    return (
        comp.groupby(["district", col], observed=True)
        .size()
        .reset_index(name="seats")
        .rename(columns={col: "party"})
    )


def nota_analysis(results: pd.DataFrame) -> pd.DataFrame:
    d = results.copy()
    d["votes"] = pd.to_numeric(d["votes"], errors="coerce").fillna(0)
    rows = []
    for ac, g in d.groupby("ac_number"):
        total = g["votes"].sum()
        nota = g[g["party"].str.upper() == "NOTA"]["votes"].sum()
        if total == 0:
            continue
        rows.append(
            {
                "ac_number": int(ac),
                "constituency": g["constituency"].iloc[0],
                "region": g["region"].iloc[0] if "region" in g.columns else None,
                "nota_votes": int(nota),
                "nota_pct": round(100 * nota / total, 2),
            }
        )
    return pd.DataFrame(rows).sort_values("nota_pct", ascending=False)


def tvk_runner_up_when_lost(comp: pd.DataFrame) -> pd.DataFrame:
    """When TVK did not win in 2026, who won?"""
    non = comp[comp["winner_party_norm_2026"] != "TVK"]
    return (
        non["winner_party_norm_2026"]
        .value_counts()
        .reset_index(name="seats")
        .rename(columns={"winner_party_norm_2026": "party"})
    )


def regional_vote_share(raw: pd.DataFrame, top_n: int = 6) -> pd.DataFrame:
    """Party vote share within each macro-region (excludes NOTA).

    Keeps top_n parties per region; rolls the rest into 'Other'.
    """
    d = raw.copy()
    d["votes"] = pd.to_numeric(d["votes"], errors="coerce").fillna(0)
    d = d[d["party"].str.upper() != "NOTA"]
    d = apply_party_column(d, col="party")

    region_total = d.groupby("region", observed=True)["votes"].sum().rename("region_total")
    by = (
        d.groupby(["region", "party_norm"], observed=True)["votes"]
        .sum()
        .reset_index()
        .merge(region_total, on="region")
    )
    by["vote_share_pct"] = (100 * by["votes"] / by["region_total"]).round(2)

    rows = []
    for region, g in by.groupby("region", observed=True):
        g = g.sort_values("vote_share_pct", ascending=False)
        top = g.head(top_n)
        other_share = g["vote_share_pct"].iloc[top_n:].sum() if len(g) > top_n else 0
        rows.append(top[["region", "party_norm", "vote_share_pct"]])
        if other_share > 0:
            rows.append(
                pd.DataFrame(
                    [{"region": region, "party_norm": "Other", "vote_share_pct": round(other_share, 2)}]
                )
            )
    return pd.concat(rows, ignore_index=True)


def turnout_changes(comp: pd.DataFrame, top_n: int = 20) -> pd.DataFrame:
    """Top ACs by 2021→2026 turnout increase. Empty if 2026 turnout missing."""
    if "turnout_pct_2026" not in comp.columns:
        return pd.DataFrame(
            columns=["ac_number", "constituency", "region", "reserved", "turnout_pct_2021", "turnout_pct_2026", "turnout_delta"]
        )
    d = comp.dropna(subset=["turnout_pct_2026", "turnout_pct_2021"]).copy()
    if d.empty:
        return pd.DataFrame(
            columns=["ac_number", "constituency", "region", "reserved", "turnout_pct_2021", "turnout_pct_2026", "turnout_delta"]
        )
    d["turnout_delta"] = (d["turnout_pct_2026"] - d["turnout_pct_2021"]).round(2)
    cols = ["ac_number", "constituency", "region", "reserved", "turnout_pct_2021", "turnout_pct_2026", "turnout_delta"]
    avail = [c for c in cols if c in d.columns]
    return d.nlargest(top_n, "turnout_delta")[avail]


def sankey_full_edges(comp: pd.DataFrame) -> pd.DataFrame:
    return (
        comp.groupby(["winner_party_norm_2021", "winner_party_norm_2026"])
        .size()
        .reset_index(name="seats")
        .rename(
            columns={
                "winner_party_norm_2021": "source",
                "winner_party_norm_2026": "target",
            }
        )
        .sort_values("seats", ascending=False)
    )


def build_all_deep_tables(
    s21: pd.DataFrame,
    s26: pd.DataFrame,
    comp: pd.DataFrame,
    raw21: pd.DataFrame,
    raw26: pd.DataFrame,
) -> dict[str, pd.DataFrame]:
    return {
        "seat_tally": seat_tally(s21, s26),
        "party_retention": party_retention(comp),
        "flips_by_region": flips_by_region(comp),
        "flips_by_reserved": flips_by_reserved(comp),
        "reserved_breakdown": reserved_seat_breakdown(comp),
        "closest_races": closest_races(comp, 30),
        "landslides_2026": landslide_races(comp),
        "winner_share_buckets": winner_share_buckets(s26),
        "margin_summary": margin_summary(comp),
        "district_seats_2026": district_seats(comp, "2026"),
        "nota_2026": nota_analysis(raw26),
        "tvk_non_wins": tvk_runner_up_when_lost(comp),
        "sankey_full": sankey_full_edges(comp),
        "vote_share_by_region_2021": regional_vote_share(raw21),
        "vote_share_by_region_2026": regional_vote_share(raw26),
        "turnout_top_changes": turnout_changes(comp),
    }
