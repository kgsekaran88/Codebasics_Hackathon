"""Plotly chart builders — neutral palette, TV-ready layouts."""

from __future__ import annotations

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Okabe–Ito inspired — not party-flag colors
PARTY_COLORS: dict[str, str] = {
    "TVK": "#E69F00",
    "DMK": "#0072B2",
    "AIADMK": "#009E73",
    "INC": "#56B4E9",
    "BJP": "#CC79A7",
    "NTK": "#F0E442",
    "PMK": "#D55E00",
    "VCK": "#999999",
    "IND": "#AAAAAA",
    "BSP": "#882255",
    "CPI": "#44AA99",
    "CPI(M)": "#117733",
    "DMDK": "#661100",
    "NOTA": "#DDDDDD",
    "OTH": "#BBBBBB",
    "Other": "#CCCCCC",
}

REGION_ORDER = ["Chennai Metro", "North", "Central", "Kongu", "Delta", "South"]
ACCENT = "#38bdf8"

from src.deep_analysis import MAJOR_PARTIES

_LAYOUT = dict(
    paper_bgcolor="#0f1419",
    plot_bgcolor="#1a2332",
    font=dict(color="#e2e8f0", family="Inter, system-ui, sans-serif", size=13),
    margin=dict(l=48, r=32, t=56, b=48),
    legend=dict(bgcolor="rgba(0,0,0,0)", orientation="h", y=1.12),
)


def _color_map(parties: list[str]) -> dict[str, str]:
    return {p: PARTY_COLORS.get(p, PARTY_COLORS["OTH"]) for p in parties}


def fig_tile_mosaic(comparison: pd.DataFrame, year_col: str = "winner_party_norm_2026") -> go.Figure:
    """234-tile grid grouped by region (NPR-style equal weight)."""
    reg_col = "region" if "region" in comparison.columns else "region_2026"
    df = comparison.sort_values([reg_col, "ac_number"]).copy()
    regions = [r for r in REGION_ORDER if r in df[reg_col].unique()]
    tiles = []
    y_offset = 0

    for region in regions:
        reg_col = "region" if "region" in df.columns else "region_2026"
        sub = df[df[reg_col] == region].reset_index(drop=True)
        n = len(sub)
        cols = int(np.ceil(np.sqrt(n * 1.4)))
        rows = int(np.ceil(n / cols))
        for i, row in sub.iterrows():
            col_idx = i % cols
            row_idx = i // cols
            tiles.append(
                dict(
                    ac_number=row["ac_number"],
                    constituency=row.get("constituency")
                    or row.get("constituency_2026")
                    or row.get("constituency_2021"),
                    region=row[reg_col],
                    party=row[year_col],
                    flip=bool(row.get("flip_norm", False)),
                    margin=row.get("margin_pct_2026"),
                    x=col_idx,
                    y=y_offset + row_idx,
                )
            )
        y_offset += rows + 1

    tdf = pd.DataFrame(tiles)
    parties = sorted(tdf["party"].dropna().unique())
    cmap = _color_map(parties)

    fig = go.Figure()
    for party in parties:
        psub = tdf[tdf["party"] == party]
        fig.add_trace(
            go.Scatter(
                x=psub["x"],
                y=-psub["y"],
                mode="markers",
                name=party,
                marker=dict(
                    size=22,
                    color=cmap[party],
                    line=dict(width=1.5, color="#0f1419" if not psub["flip"].any() else "#f8fafc"),
                    symbol="square",
                ),
                text=psub.apply(
                    lambda r: f"AC {r['ac_number']}: {r['constituency']}<br>{party}<br>Margin: {r['margin']}%",
                    axis=1,
                ),
                hovertemplate="%{text}<extra></extra>",
            )
        )

    fig.update_layout(
        **_LAYOUT,
        title="Constituency mosaic — 2026 winning party (one tile = one AC)",
        xaxis=dict(visible=False),
        yaxis=dict(visible=False),
        height=720,
        showlegend=True,
    )
    return fig


def fig_sankey(edges: pd.DataFrame) -> go.Figure:
    labels = sorted(set(edges["source"]) | set(edges["target"]))
    idx = {l: i for i, l in enumerate(labels)}
    link_colors = [
        f"rgba(100,149,237,{0.25 + 0.5 * (v / edges['seats'].max())})"
        for v in edges["seats"]
    ]
    fig = go.Figure(
        data=[
            go.Sankey(
                arrangement="snap",
                node=dict(
                    pad=18,
                    thickness=22,
                    line=dict(color="#334155", width=0.5),
                    label=labels,
                    color=[PARTY_COLORS.get(l, PARTY_COLORS["OTH"]) for l in labels],
                ),
                link=dict(
                    source=[idx[s] for s in edges["source"]],
                    target=[idx[t] for t in edges["target"]],
                    value=edges["seats"].tolist(),
                    color=link_colors,
                ),
            )
        ]
    )
    layout = {**_LAYOUT, "title": "Seat flows: 2021 winning party → 2026 winning party", "height": 560}
    layout["font"] = dict(color="#e2e8f0", family="Inter, system-ui, sans-serif", size=12)
    fig.update_layout(**layout)
    return fig


def fig_margin_beeswarm(comparison: pd.DataFrame) -> go.Figure:
    long = pd.melt(
        comparison,
        id_vars=["ac_number", "region"],
        value_vars=["margin_pct_2021", "margin_pct_2026"],
        var_name="year",
        value_name="margin_pct",
    )
    long["year"] = long["year"].map(
        {"margin_pct_2021": "2021", "margin_pct_2026": "2026"}
    )
    fig = px.strip(
        long,
        x="year",
        y="margin_pct",
        color="year",
        hover_data=["ac_number", "region"],
        color_discrete_map={"2021": "#56B4E9", "2026": "#E69F00"},
    )
    fig.update_traces(jitter=0.35, marker=dict(size=9, opacity=0.65))
    fig.update_layout(
        **_LAYOUT,
        title="Winning margin distribution (% of valid votes)",
        yaxis_title="Margin (%)",
        xaxis_title="",
        height=480,
        showlegend=False,
    )
    return fig


def fig_regional_seats(reg21: pd.DataFrame, reg26: pd.DataFrame) -> go.Figure:
    a = reg21.rename(columns={"winner_party_norm": "party", "seats": "seats_2021"})
    b = reg26.rename(columns={"winner_party_norm": "party", "seats": "seats_2026"})
    m = a.merge(b, on=["region", "party"], how="outer").fillna(0)
    m = m[m["party"].isin(["TVK", "DMK", "AIADMK", "INC", "BJP", "NTK", "PMK", "IND"])]
    long = pd.melt(
        m,
        id_vars=["region", "party"],
        value_vars=["seats_2021", "seats_2026"],
        var_name="year",
        value_name="seats",
    )
    long["year"] = long["year"].str.replace("seats_", "")
    fig = px.bar(
        long,
        x="region",
        y="seats",
        color="party",
        barmode="group",
        facet_col="year",
        category_orders={"region": REGION_ORDER},
        color_discrete_map=_color_map(long["party"].unique().tolist()),
    )
    fig.update_layout(**_LAYOUT, title="Seats by region — major parties", height=520)
    fig.for_each_annotation(lambda a: a.update(text=a.text.split("=")[-1]))
    return fig


def fig_vote_share_compare(v21: pd.DataFrame, v26: pd.DataFrame, top: int = 8) -> go.Figure:
    a = v21.rename(columns={"vote_share_pct": "share_2021"})
    b = v26.rename(columns={"vote_share_pct": "share_2026"})
    m = a.merge(b, on="party_norm", how="outer").fillna(0)
    m = m.nlargest(top, "share_2026")
    fig = go.Figure()
    fig.add_trace(
        go.Bar(name="2021", x=m["party_norm"], y=m["share_2021"], marker_color="#56B4E9")
    )
    fig.add_trace(
        go.Bar(name="2026", x=m["party_norm"], y=m["share_2026"], marker_color="#E69F00")
    )
    fig.update_layout(
        **_LAYOUT,
        barmode="group",
        title="Statewide vote share — top parties (valid votes, excl. NOTA)",
        yaxis_title="Vote share (%)",
        height=420,
    )
    fig.update_traces(texttemplate="%{y:.1f}%", textposition="outside")
    return fig


def fig_seat_tally(tally: pd.DataFrame, top: int = 10) -> go.Figure:
    m = tally.nlargest(top, "seats_2026")
    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            name="2021 seats",
            x=m["winner_party_norm"],
            y=m["seats_2021"],
            marker_color="#56B4E9",
            text=m["seats_2021"],
            textposition="outside",
        )
    )
    fig.add_trace(
        go.Bar(
            name="2026 seats",
            x=m["winner_party_norm"],
            y=m["seats_2026"],
            marker_color="#E69F00",
            text=m["seats_2026"],
            textposition="outside",
        )
    )
    fig.update_layout(
        **_LAYOUT,
        barmode="group",
        title="Assembly seats won by party (2021 vs 2026)",
        yaxis_title="Constituencies won",
        height=440,
    )
    return fig


def fig_flip_heatmap(flips_region: pd.DataFrame) -> go.Figure:
    df = flips_region.sort_values("flip_pct", ascending=True)
    fig = go.Figure(
        go.Bar(
            x=df["flip_pct"],
            y=df["region"],
            orientation="h",
            text=[f"{int(r)} flips ({p}%)" for r, p in zip(df["flips"], df["flip_pct"])],
            textposition="outside",
            marker_color=ACCENT,
        )
    )
    fig.update_layout(
        **_LAYOUT,
        title="% of constituencies that changed winning party (2021→2026)",
        xaxis_title="Flip rate (%)",
        height=360,
    )
    return fig


def fig_margin_violin(comp: pd.DataFrame) -> go.Figure:
    long = pd.melt(
        comp,
        value_vars=["margin_pct_2021", "margin_pct_2026"],
        var_name="year",
        value_name="margin",
    )
    long["year"] = long["year"].map(
        {"margin_pct_2021": "2021", "margin_pct_2026": "2026"}
    )
    fig = px.violin(
        long,
        x="year",
        y="margin",
        color="year",
        box=True,
        points="outliers",
        color_discrete_map={"2021": "#56B4E9", "2026": "#E69F00"},
    )
    med21 = comp["margin_pct_2021"].median()
    med26 = comp["margin_pct_2026"].median()
    fig.update_layout(
        **_LAYOUT,
        title=f"Winning margin distribution — median {med21:.1f}% (2021) → {med26:.1f}% (2026)",
        yaxis_title="Margin (% of valid votes)",
        height=420,
        showlegend=False,
    )
    return fig


def fig_reserved_comparison(reserved_df: pd.DataFrame) -> go.Figure:
    d = reserved_df[reserved_df["party"].isin(MAJOR_PARTIES)]
    fig = px.bar(
        d,
        x="party",
        y="seats",
        color="year",
        facet_col="reserved",
        barmode="group",
        text="seats",
        color_discrete_map={"2021": "#56B4E9", "2026": "#E69F00"},
    )
    fig.update_layout(**_LAYOUT, title="Seats won by reservation category", height=480)
    fig.update_traces(textposition="outside")
    return fig


def fig_sankey_labeled(edges: pd.DataFrame, top: int = 12) -> go.Figure:
    e = edges.nlargest(top, "seats")
    return fig_sankey(e)


def fig_transition_bars(edges: pd.DataFrame, top: int = 10) -> go.Figure:
    e = edges.nlargest(top, "seats").iloc[::-1]
    e["label"] = e["source"] + " → " + e["target"]
    fig = go.Figure(
        go.Bar(
            x=e["seats"],
            y=e["label"],
            orientation="h",
            text=e["seats"],
            textposition="outside",
            marker_color="#38bdf8",
        )
    )
    fig.update_layout(
        **_LAYOUT,
        title="Top seat transitions (constituency count on each bar)",
        xaxis_title="Constituencies",
        height=420,
    )
    return fig
