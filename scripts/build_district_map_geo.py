#!/usr/bin/env python3
"""Build TN district GeoJSON for dashboard map (party winner + flip rate per district)."""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
GEO_IN = ROOT / "data" / "geo" / "tn_districts.geojson"
MAP_PATH = ROOT / "data" / "geo" / "district_to_geo.json"
COMP_PATH = ROOT / "data" / "processed" / "ac_comparison.csv"
OUT_WEB = ROOT / "web" / "public" / "geo" / "tn_districts_map.geojson"
OUT_DATA = ROOT / "data" / "geo" / "tn_districts_map.geojson"


def aggregate_by_geo(comp: pd.DataFrame, name_map: dict[str, str]) -> dict[str, dict]:
    """Merge AC rows that share one polygon (several data districts → one geo name)."""
    geo_to_data: dict[str, list[str]] = defaultdict(list)
    for data_name in comp["district"].dropna().unique():
        geo_name = name_map.get(data_name)
        if geo_name:
            geo_to_data[geo_name].append(data_name)

    out: dict[str, dict] = {}
    for geo_name, data_districts in geo_to_data.items():
        grp = comp[comp["district"].isin(data_districts)]
        ac_count = len(grp)
        flips = int(grp["flip_norm"].sum())
        winners = grp["winner_party_norm_2026"].value_counts()
        winner = winners.index[0] if len(winners) else "OTHER"
        out[geo_name] = {
            "ac_count": ac_count,
            "flips": flips,
            "flip_pct": round(100 * flips / ac_count, 1) if ac_count else 0,
            "winner_party_norm_2026": winner,
            "leading_seats": int(winners.iloc[0]) if len(winners) else 0,
            "data_districts": data_districts,
        }
    return out


def main() -> None:
    name_map = json.loads(MAP_PATH.read_text())
    name_map.pop("_note", None)
    comp = pd.read_csv(COMP_PATH)
    by_geo = aggregate_by_geo(comp, name_map)

    geo = json.loads(GEO_IN.read_text())
    for feat in geo["features"]:
        geo_name = feat["properties"]["NAME_2"]
        row = by_geo.get(geo_name, {})
        feat["properties"]["name"] = geo_name
        label = geo_name
        if geo_name == "Tirunelveli Kattabo":
            label = "Tirunelveli"
        elif geo_name == "Tiruchchirappalli":
            label = "Tiruchirappalli"
        elif geo_name == "Thiruvallur":
            label = "Tiruvallur"
        elif geo_name == "Thiruvarur":
            label = "Tiruvarur"
        elif geo_name == "Kancheepuram":
            label = "Kanchipuram"
        feat["properties"]["label"] = label
        feat["properties"]["winner_party_norm_2026"] = row.get("winner_party_norm_2026", "OTHER")
        feat["properties"]["ac_count"] = row.get("ac_count", 0)
        feat["properties"]["flips"] = row.get("flips", 0)
        feat["properties"]["flip_pct"] = row.get("flip_pct", 0)
        feat["properties"]["data_districts"] = ", ".join(row.get("data_districts", []))

    OUT_WEB.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(geo, separators=(",", ":"))
    OUT_WEB.write_text(text)
    OUT_DATA.write_text(text)
    print(f"Wrote {OUT_WEB} ({len(geo['features'])} districts, {len(text) // 1024} KB)")


if __name__ == "__main__":
    main()
