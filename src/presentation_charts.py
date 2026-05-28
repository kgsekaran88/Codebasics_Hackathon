"""Matplotlib slide assets (reliable PNG export for PowerPoint)."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import pandas as pd

from src.story_metrics import StoryMetrics

# Dark theme matching dashboard
BG = "#0f1419"
PANEL = "#1a2332"
TEXT = "#e2e8f0"
MUTED = "#94a3b8"
ACCENT = "#38bdf8"
ORANGE = "#E69F00"
BLUE = "#56B4E9"

PARTY_COLORS = {
    "TVK": "#E69F00",
    "DMK": "#0072B2",
    "AIADMK": "#009E73",
    "INC": "#56B4E9",
    "BJP": "#CC79A7",
    "NTK": "#F0E442",
    "IND": "#AAAAAA",
    "Other": "#BBBBBB",
}


def _style_ax(ax):
    ax.set_facecolor(PANEL)
    ax.tick_params(colors=TEXT, labelsize=10)
    ax.xaxis.label.set_color(TEXT)
    ax.yaxis.label.set_color(TEXT)
    ax.title.set_color(TEXT)
    for spine in ax.spines.values():
        spine.set_color("#334155")


def save_margin_comparison(comp: pd.DataFrame, path: Path) -> Path:
    fig, ax = plt.subplots(figsize=(10, 5.5), facecolor=BG)
    for year, col, color in [("2021", "margin_pct_2021", BLUE), ("2026", "margin_pct_2026", ORANGE)]:
        vals = comp[col].dropna()
        parts = ax.violinplot([vals], positions=[1 if year == "2021" else 2], showmeans=True, showmedians=True)
        for pc in parts["bodies"]:
            pc.set_facecolor(color)
            pc.set_alpha(0.55)
    ax.set_xticks([1, 2])
    ax.set_xticklabels(["2021", "2026"])
    ax.set_ylabel("Winning margin (% of valid votes)")
    ax.set_title("Closer races in 2026 — margin distribution shifted downward", fontsize=13, pad=12)
    _style_ax(ax)
    fig.text(0.5, 0.02, "Excludes NOTA from valid votes | Source: Codebasics ECI starter pack", ha="center", color=MUTED, fontsize=8)
    fig.tight_layout(rect=[0, 0.04, 1, 1])
    fig.savefig(path, dpi=180, facecolor=BG, edgecolor="none")
    plt.close(fig)
    return path


def save_sankey_bars(sankey: pd.DataFrame, path: Path, top: int = 8) -> Path:
    df = sankey.nlargest(top, "seats").iloc[::-1]
    labels = [f"{s} → {t}" for s, t in zip(df["source"], df["target"])]
    fig, ax = plt.subplots(figsize=(10, 5.5), facecolor=BG)
    colors = [ACCENT] * len(df)
    ax.barh(labels, df["seats"], color=colors, height=0.65)
    ax.set_xlabel("Number of constituencies")
    ax.set_title("Largest seat transitions: 2021 winner party → 2026 winner party", fontsize=13, pad=12)
    _style_ax(ax)
    fig.tight_layout()
    fig.savefig(path, dpi=180, facecolor=BG, edgecolor="none")
    plt.close(fig)
    return path


def save_vote_share_bars(v21: pd.DataFrame, v26: pd.DataFrame, path: Path, top: int = 7) -> Path:
    a = v21.rename(columns={"vote_share_pct": "y21"})
    b = v26.rename(columns={"vote_share_pct": "y26"})
    m = a.merge(b, on="party_norm", how="outer").fillna(0).nlargest(top, "y26")
    parties = m["party_norm"].tolist()
    x = np.arange(len(parties))
    w = 0.35
    fig, ax = plt.subplots(figsize=(10, 5.5), facecolor=BG)
    ax.bar(x - w / 2, m["y21"], w, label="2021", color=BLUE)
    ax.bar(x + w / 2, m["y26"], w, label="2026", color=ORANGE)
    ax.set_xticks(x)
    ax.set_xticklabels(parties, rotation=25, ha="right")
    ax.set_ylabel("Vote share (%)")
    ax.set_title("Statewide vote share — top parties (valid votes)", fontsize=13, pad=12)
    ax.legend(facecolor=PANEL, edgecolor="#334155", labelcolor=TEXT)
    _style_ax(ax)
    fig.tight_layout()
    fig.savefig(path, dpi=180, facecolor=BG, edgecolor="none")
    plt.close(fig)
    return path


def save_tile_mosaic(comp: pd.DataFrame, path: Path) -> Path:
    """Simplified regional tile grid for slides."""
    region_order = ["Chennai Metro", "North", "Central", "Kongu", "Delta", "South"]
    reg_col = "region" if "region" in comp.columns else "region_2026"
    party_col = "winner_party_norm_2026"

    fig, axes = plt.subplots(2, 3, figsize=(11, 6.5), facecolor=BG)
    fig.suptitle("2026 winning party by constituency (one square = one AC)", color=TEXT, fontsize=13, y=0.98)

    for ax, region in zip(axes.flat, region_order):
        sub = comp[comp[reg_col] == region].sort_values("ac_number")
        n = len(sub)
        if n == 0:
            ax.axis("off")
            continue
        cols = int(np.ceil(np.sqrt(n)))
        rows = int(np.ceil(n / cols))
        grid = np.zeros((rows, cols))
        colors_grid = []
        parties = sub[party_col].tolist()
        for i, p in enumerate(parties):
            r, c = divmod(i, cols)
            colors_grid.append(PARTY_COLORS.get(p, "#888888"))
        for i in range(rows * cols):
            r, c = divmod(i, cols)
            rect = mpatches.Rectangle(
                (c, rows - 1 - r),
                0.92,
                0.92,
                facecolor=colors_grid[i] if i < len(colors_grid) else PANEL,
                edgecolor=BG,
                linewidth=0.5,
            )
            ax.add_patch(rect)
        ax.set_xlim(-0.1, cols)
        ax.set_ylim(-0.1, rows)
        ax.set_aspect("equal")
        ax.set_title(region, color=TEXT, fontsize=10)
        ax.axis("off")

    handles = [
        mpatches.Patch(color=PARTY_COLORS.get(p, "#888"), label=p)
        for p in ["TVK", "DMK", "AIADMK", "INC", "BJP", "NTK", "IND"]
    ]
    fig.legend(handles=handles, loc="lower center", ncol=7, frameon=False, labelcolor=TEXT, fontsize=8)
    fig.tight_layout(rect=[0, 0.06, 1, 0.94])
    fig.savefig(path, dpi=180, facecolor=BG, edgecolor="none")
    plt.close(fig)
    return path


def save_regional_vote_share(v26reg: pd.DataFrame, path: Path) -> Path:
    """Stacked bar — regional vote share for 2026 (Q3 by-region)."""
    regions = ["Chennai Metro", "North", "Central", "Kongu", "Delta", "South"]
    regions = [r for r in regions if r in set(v26reg["region"])]
    parties_top = (
        v26reg.groupby("party_norm")["vote_share_pct"].sum().sort_values(ascending=False).index.tolist()
    )
    parties_top = [p for p in parties_top if p != "Other"][:6] + ["Other"]

    fig, ax = plt.subplots(figsize=(10, 5.5), facecolor=BG)
    bottom = np.zeros(len(regions))
    for party in parties_top:
        vals = []
        for r in regions:
            row = v26reg[(v26reg["region"] == r) & (v26reg["party_norm"] == party)]
            vals.append(float(row["vote_share_pct"].iloc[0]) if len(row) else 0.0)
        ax.bar(regions, vals, bottom=bottom, label=party, color=PARTY_COLORS.get(party, "#888"))
        bottom = bottom + np.array(vals)
    ax.set_ylim(0, 100)
    ax.set_ylabel("Vote share within region (%)")
    ax.set_title("2026 vote share by macro-region (Q3 — by-region view)", fontsize=13, pad=12)
    ax.legend(loc="center left", bbox_to_anchor=(1.0, 0.5), facecolor=PANEL, edgecolor="#334155", labelcolor=TEXT, fontsize=9)
    _style_ax(ax)
    plt.setp(ax.get_xticklabels(), rotation=15, ha="right")
    fig.tight_layout(rect=[0, 0, 0.86, 1])
    fig.savefig(path, dpi=180, facecolor=BG, edgecolor="none")
    plt.close(fig)
    return path


def save_reserved_compare(breakdown: pd.DataFrame, path: Path) -> Path:
    """Side-by-side reserved-seat winners: GEN/SC/ST × 2021 vs 2026 (Q4)."""
    categories = ["GEN", "SC", "ST"]
    parties = ["DMK", "AIADMK", "TVK", "INC", "PMK", "BJP", "VCK", "IND", "Other"]

    fig, axes = plt.subplots(1, 3, figsize=(11, 5.5), facecolor=BG, sharey=False)
    for ax, cat in zip(axes, categories):
        sub = breakdown[breakdown["reserved"] == cat]
        if sub.empty:
            ax.axis("off")
            continue
        pivot = sub.pivot_table(index="party", columns="year", values="seats", fill_value=0)
        pivot = pivot.reindex([p for p in parties if p in pivot.index] + [p for p in pivot.index if p not in parties])
        x = np.arange(len(pivot))
        w = 0.4
        years = sorted(pivot.columns)
        ax.bar(x - w / 2, pivot[years[0]], w, label=str(years[0]), color=BLUE)
        if len(years) > 1:
            ax.bar(x + w / 2, pivot[years[1]], w, label=str(years[1]), color=ORANGE)
        ax.set_xticks(x)
        ax.set_xticklabels(pivot.index, rotation=30, ha="right", fontsize=9)
        ax.set_title(f"{cat} — {int(sub.groupby('year')['seats'].sum().max())} seats", color=TEXT, fontsize=11)
        _style_ax(ax)
        if cat == "GEN":
            ax.legend(facecolor=PANEL, edgecolor="#334155", labelcolor=TEXT, fontsize=9)
    fig.suptitle("Reserved-seat winners — 2021 vs 2026 (Q4)", color=TEXT, fontsize=13, y=0.99)
    fig.tight_layout(rect=[0, 0.02, 1, 0.95])
    fig.savefig(path, dpi=180, facecolor=BG, edgecolor="none")
    plt.close(fig)
    return path


def save_turnout_chart(turnout_top: pd.DataFrame, region_avg: pd.DataFrame, path: Path) -> Path:
    """Q5 chart: top-20 turnout increases if available; else 2021 regional turnout."""
    fig, ax = plt.subplots(figsize=(10, 5.5), facecolor=BG)
    if not turnout_top.empty:
        df = turnout_top.sort_values("turnout_delta", ascending=True).tail(20)
        ax.barh(df["constituency"], df["turnout_delta"], color=ORANGE)
        ax.set_xlabel("Turnout change 2021 → 2026 (percentage points)")
        ax.set_title("Top 20 constituencies by turnout increase (Q5)", fontsize=13, pad=12)
    else:
        ax.barh(region_avg["region"], region_avg["avg_turnout_pct"], color=BLUE)
        ax.set_xlabel("Average turnout 2021 (%)")
        ax.set_title(
            "2021 average turnout by macro-region — 2026 per-AC turnout not sourced (Q5 limitation)",
            fontsize=12,
            pad=12,
        )
    _style_ax(ax)
    fig.tight_layout()
    fig.savefig(path, dpi=180, facecolor=BG, edgecolor="none")
    plt.close(fig)
    return path


def save_enp_chart(enp_reg: pd.DataFrame, path: Path) -> Path:
    """Grouped bar chart — ENP per region, 2021 vs 2026."""
    regions = ["Chennai Metro", "North", "Central", "Kongu", "Delta", "South"]
    regions = [r for r in regions if r in set(enp_reg["region"])]
    sub = enp_reg.set_index("region").reindex(regions)
    x = np.arange(len(regions))
    w = 0.4
    fig, ax = plt.subplots(figsize=(10, 5.5), facecolor=BG)
    ax.bar(x - w / 2, sub["enp_2021"], w, label="2021", color=BLUE)
    ax.bar(x + w / 2, sub["enp_2026"], w, label="2026", color=ORANGE)
    ax.set_xticks(x)
    ax.set_xticklabels(regions, rotation=15, ha="right")
    ax.set_ylabel("Effective Number of Parties")
    ax.set_title("Fragmentation rose: Effective number of parties by region (Laakso–Taagepera)", fontsize=12, pad=12)
    ax.legend(facecolor=PANEL, edgecolor="#334155", labelcolor=TEXT)
    _style_ax(ax)
    fig.tight_layout()
    fig.savefig(path, dpi=180, facecolor=BG, edgecolor="none")
    plt.close(fig)
    return path


def save_swing_heatmap(swing: pd.DataFrame, path: Path) -> Path:
    """Heatmap — party vote-share swing (pp) by region. Diverging palette."""
    parties = ["DMK", "AIADMK", "TVK", "INC", "BJP", "NTK", "PMK", "VCK"]
    regions = ["Chennai Metro", "North", "Central", "Kongu", "Delta", "South"]
    parties = [p for p in parties if p in set(swing["party_norm"])]
    regions = [r for r in regions if r in set(swing["region"])]

    matrix = np.zeros((len(parties), len(regions)))
    for i, p in enumerate(parties):
        for j, r in enumerate(regions):
            row = swing[(swing["party_norm"] == p) & (swing["region"] == r)]
            matrix[i, j] = float(row["swing_pp"].iloc[0]) if len(row) else 0.0

    fig, ax = plt.subplots(figsize=(10, 5.5), facecolor=BG)
    vmax = max(np.abs(matrix).max(), 1)
    im = ax.imshow(matrix, cmap="RdYlGn", aspect="auto", vmin=-vmax, vmax=vmax)
    ax.set_xticks(np.arange(len(regions)))
    ax.set_xticklabels(regions, rotation=20, ha="right")
    ax.set_yticks(np.arange(len(parties)))
    ax.set_yticklabels(parties)
    for i in range(len(parties)):
        for j in range(len(regions)):
            v = matrix[i, j]
            if abs(v) >= 1:
                ax.text(j, i, f"{v:+.0f}", ha="center", va="center", color="black" if abs(v) > vmax * 0.4 else "white", fontsize=9)
    ax.set_title("Vote-share swing (percentage points) — 2021 → 2026", fontsize=13, pad=12)
    cbar = fig.colorbar(im, ax=ax, fraction=0.03, pad=0.02)
    cbar.set_label("Swing (pp)", color=TEXT)
    cbar.ax.tick_params(colors=TEXT)
    _style_ax(ax)
    fig.tight_layout()
    fig.savefig(path, dpi=180, facecolor=BG, edgecolor="none")
    plt.close(fig)
    return path


def save_representation_gap(rep26: pd.DataFrame, path: Path) -> Path:
    """Horizontal grouped bar — vote share vs seat share (2026)."""
    sub = rep26[(rep26["vote_share_pct"] > 0.5) | (rep26["seat_share_pct"] > 0.5)].head(10)
    sub = sub.sort_values("vote_share_pct", ascending=True)
    parties = sub["party_norm"].tolist()
    y = np.arange(len(parties))
    h = 0.35
    fig, ax = plt.subplots(figsize=(10, 5.5), facecolor=BG)
    ax.barh(y - h / 2, sub["vote_share_pct"], h, label="Vote share %", color=BLUE)
    ax.barh(y + h / 2, sub["seat_share_pct"], h, label="Seat share %", color=ORANGE)
    ax.set_yticks(y)
    ax.set_yticklabels(parties)
    ax.set_xlabel("% of state (votes vs seats)")
    ax.set_title("Representation gap — 2026 first-past-the-post amplification (Gallagher LSq)", fontsize=12, pad=12)
    ax.legend(facecolor=PANEL, edgecolor="#334155", labelcolor=TEXT)
    _style_ax(ax)
    fig.tight_layout()
    fig.savefig(path, dpi=180, facecolor=BG, edgecolor="none")
    plt.close(fig)
    return path


def export_all_slide_images(out_dir: Path, metrics: StoryMetrics) -> dict[str, Path]:
    from src.load_data import PROCESSED, ensure_processed

    ensure_processed()
    comp = pd.read_csv(PROCESSED / "ac_comparison.csv")
    sankey = pd.read_csv(PROCESSED / "sankey_edges.csv")
    v21 = pd.read_csv(PROCESSED / "vote_share_2021.csv")
    v26 = pd.read_csv(PROCESSED / "vote_share_2026.csv")
    v26reg = pd.read_csv(PROCESSED / "vote_share_by_region_2026.csv")
    breakdown = pd.read_csv(PROCESSED / "reserved_breakdown.csv")

    try:
        turnout_top = pd.read_csv(PROCESSED / "turnout_top_changes.csv")
    except FileNotFoundError:
        turnout_top = pd.DataFrame()
    region_avg = (
        comp.groupby("region", observed=True)["turnout_pct_2021"].mean().round(1).reset_index()
        .rename(columns={"turnout_pct_2021": "avg_turnout_pct"})
    )

    def _opt(name: str) -> pd.DataFrame:
        p = PROCESSED / f"{name}.csv"
        return pd.read_csv(p) if p.exists() else pd.DataFrame()

    enp_reg = _opt("enp_by_region")
    swing = _opt("swing_by_region")
    rep26 = _opt("representation_gap_2026")

    out_dir.mkdir(parents=True, exist_ok=True)
    images = {
        "margins": save_margin_comparison(comp, out_dir / "slide_margins.png"),
        "sankey": save_sankey_bars(sankey, out_dir / "slide_sankey.png"),
        "vote_share": save_vote_share_bars(v21, v26, out_dir / "slide_vote_share.png"),
        "vote_share_region": save_regional_vote_share(v26reg, out_dir / "slide_vote_share_region.png"),
        "mosaic": save_tile_mosaic(comp, out_dir / "slide_mosaic.png"),
        "reserved": save_reserved_compare(breakdown, out_dir / "slide_reserved.png"),
        "turnout": save_turnout_chart(turnout_top, region_avg, out_dir / "slide_turnout.png"),
    }
    if not enp_reg.empty:
        images["enp"] = save_enp_chart(enp_reg, out_dir / "slide_enp.png")
    if not swing.empty:
        images["swing"] = save_swing_heatmap(swing, out_dir / "slide_swing.png")
    if not rep26.empty:
        images["representation_gap"] = save_representation_gap(rep26, out_dir / "slide_repgap.png")
    return images
