"""FastAPI backend for the TN Assembly election briefing dashboard."""

from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from api import services

app = FastAPI(title="TN Assembly Briefing API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.ngrok-free\.(app|dev)|https://.*\.ngrok\.io",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    services.ensure_data()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/kpis")
def kpis(year: str = Query("2026", pattern="^(2021|2026)$")):
    return services.get_kpis(year)


@app.get("/api/meta")
def meta():
    return services.get_election_meta()


@app.get("/api/filters/meta")
def filter_meta():
    return services.filter_meta()


@app.get("/api/comparison")
def comparison(
    region: list[str] | None = Query(None),
    reserved: list[str] | None = Query(None),
    party_2026: list[str] | None = Query(None),
    flip_only: bool = False,
    max_margin: float = 100.0,
):
    return services.get_comparison(region, reserved, party_2026, flip_only, max_margin)


@app.get("/api/seat-tally")
def seat_tally():
    return services.get_seat_tally()


@app.get("/api/vote-share")
def vote_share():
    return services.get_vote_share()


@app.get("/api/sankey")
def sankey(full: bool = False):
    return services.get_sankey(full)


@app.get("/api/flips-by-region")
def flips_region():
    return services.get_flips_by_region()


@app.get("/api/flips-by-reserved")
def flips_reserved():
    return services.get_flips_by_reserved()


@app.get("/api/reserved-breakdown")
def reserved_breakdown():
    return services.get_reserved_breakdown()


@app.get("/api/reserved-breakdown-full")
def reserved_breakdown_full():
    return services.get_reserved_breakdown_full()


@app.get("/api/reserved-margin-summary")
def reserved_margin_summary():
    return services.get_reserved_margin_summary()


@app.get("/api/vote-share-by-region")
def vote_share_by_region():
    return services.get_vote_share_by_region()


@app.get("/api/turnout-top-changes")
def turnout_top_changes():
    return services.get_turnout_top_changes()


@app.get("/api/advanced/summary")
def advanced_summary():
    return services.get_advanced_summary()


@app.get("/api/advanced/enp-by-region")
def enp_by_region():
    return services.get_enp_by_region()


@app.get("/api/advanced/pedersen-by-region")
def pedersen_by_region():
    return services.get_pedersen_by_region()


@app.get("/api/advanced/swing-by-region")
def swing_by_region():
    return services.get_swing_by_region()


@app.get("/api/advanced/anti-incumbency")
def anti_incumbency():
    return services.get_anti_incumbency()


@app.get("/api/advanced/representation-gap")
def representation_gap():
    return services.get_representation_gap()


@app.get("/api/advanced/district-flips")
def district_full_flips():
    return services.get_district_full_flips()


@app.get("/api/advanced/bellwethers")
def bellwethers():
    return services.get_bellwether_acs()


@app.get("/api/advanced/race-types")
def race_types():
    return services.get_race_type_summary()


@app.get("/api/party-retention")
def party_retention():
    return services.get_party_retention()


@app.get("/api/closest-races")
def closest_races():
    rows = services.df_to_records(services.load("closest_races"))
    for row in rows:
        row["ac_name"] = row.get("constituency", "")
    return rows


@app.get("/api/winner-share-buckets")
def winner_buckets():
    return services.get_winner_buckets()


@app.get("/api/margin-summary")
def margin_summary():
    return services.df_to_records(services.load("margin_summary"))


@app.get("/api/regional-seats")
def regional_seats():
    return services.get_regional_seats()


@app.get("/api/tvk-non-wins")
def tvk_non_wins():
    return services.df_to_records(services.load("tvk_non_wins"))


@app.get("/api/nota")
def nota(limit: int = 20):
    df = services.load("nota_2026").head(limit)
    return services.df_to_records(df)


@app.get("/api/ac/{ac_number}")
def ac_detail(ac_number: int):
    row = services.get_ac(ac_number)
    if row is None:
        return {"error": "not found"}
    return row


@app.get("/api/insights")
def insights(year: str = Query("2026", pattern="^(2021|2026)$")):
    return services.get_insights(year)


@app.get("/api/editorial")
def editorial():
    return services.get_editorial_plan()


@app.get("/api/turnout-by-region")
def turnout_by_region():
    return services.get_turnout_by_region()


@app.get("/api/candidate-buckets")
def candidate_buckets():
    return services.get_candidate_buckets()


@app.get("/api/nota-all")
def nota_all():
    return services.get_nota_all()


_DIST = ROOT / "web" / "dist"
if _DIST.is_dir() and (_DIST / "index.html").is_file():

    @app.get("/")
    def spa_index():
        return FileResponse(_DIST / "index.html")

    app.mount("/assets", StaticFiles(directory=_DIST / "assets"), name="assets")
    if (_DIST / "geo").is_dir():
        app.mount("/geo", StaticFiles(directory=_DIST / "geo"), name="geo")

    @app.get("/{spa_path:path}")
    def spa_fallback(spa_path: str):
        if spa_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Not found")
        candidate = _DIST / spa_path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(_DIST / "index.html")
