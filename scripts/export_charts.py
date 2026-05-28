#!/usr/bin/env python3
"""Export hero charts to outputs/charts/ for deck."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.charts import (
    fig_margin_beeswarm,
    fig_regional_seats,
    fig_sankey,
    fig_tile_mosaic,
    fig_vote_share_compare,
)
from src.load_data import ensure_processed, load_processed

OUT = ROOT / "outputs" / "charts"


def main():
    ensure_processed()
    OUT.mkdir(parents=True, exist_ok=True)
    comp = load_processed("ac_comparison.csv")
    charts = {
        "01_tile_mosaic_2026": fig_tile_mosaic(comp),
        "02_sankey_seat_flows": fig_sankey(load_processed("sankey_edges.csv")),
        "03_margin_beeswarm": fig_margin_beeswarm(comp),
        "04_regional_seats": fig_regional_seats(
            load_processed("regional_seats_2021.csv"),
            load_processed("regional_seats_2026.csv"),
        ),
        "05_vote_share": fig_vote_share_compare(
            load_processed("vote_share_2021.csv"),
            load_processed("vote_share_2026.csv"),
        ),
    }
    for name, fig in charts.items():
        html_path = OUT / f"{name}.html"
        fig.write_html(str(html_path), include_plotlyjs="cdn")
        print(f"Wrote {html_path}")
        png_path = OUT / f"{name}.png"
        try:
            fig.write_image(str(png_path), width=1920, height=1080, scale=2)
            print(f"Wrote {png_path}")
        except Exception as exc:
            print(f"PNG skip {name}: {exc} (open HTML in browser to screenshot for deck)")


if __name__ == "__main__":
    main()
