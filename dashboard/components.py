"""Shared dashboard utilities."""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
import streamlit as st

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.load_data import PROCESSED, ensure_processed

CUSTOM_CSS = """
<style>
    .stApp { background: linear-gradient(180deg, #0f1419 0%, #1a2332 100%); }
    h1, h2, h3 { color: #f1f5f9 !important; font-weight: 700 !important; }
    [data-testid="stMetricValue"] { font-size: 1.55rem !important; color: #38bdf8 !important; }
    [data-testid="stMetricLabel"] { color: #94a3b8 !important; }
    .hero { font-size: 1.05rem; color: #94a3b8; line-height: 1.55; }
    .insight-box {
        background: #1e293b; border-left: 4px solid #3b82f6;
        padding: 0.85rem 1.1rem; border-radius: 8px; margin: 0.5rem 0 1rem 0;
        color: #cbd5e1; font-size: 0.95rem;
    }
    .glossary { font-size: 0.8rem; color: #64748b; margin-top: 0.5rem; }
</style>
"""


def apply_theme():
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


@st.cache_data(show_spinner="Loading election data…")
def load_dashboard_data() -> dict:
    ensure_processed()
    data = {}
    for path in PROCESSED.glob("*.csv"):
        data[path.stem] = pd.read_csv(path)
    return data


def filter_comparison(comp: pd.DataFrame, *, key_prefix: str = "") -> pd.DataFrame:
    st.sidebar.header("Filters")
    regions = sorted(comp["region"].dropna().unique())
    p = key_prefix
    sel_reg = st.sidebar.multiselect("Region", regions, default=regions, key=f"{p}reg")
    reserved = st.sidebar.multiselect(
        "Reservation", ["GEN", "SC", "ST"], default=["GEN", "SC", "ST"], key=f"{p}res"
    )
    parties_2026 = sorted(comp["winner_party_norm_2026"].dropna().unique())
    sel_party = st.sidebar.multiselect("2026 winner party", parties_2026, default=parties_2026, key=f"{p}pty")
    flip_only = st.sidebar.checkbox("Flipped seats only", value=False, key=f"{p}flip")
    margin_max = st.sidebar.slider("Max margin % (2026)", 0.0, 50.0, 50.0, 0.5, key=f"{p}mar")

    out = comp[
        comp["region"].isin(sel_reg)
        & comp["reserved"].isin(reserved)
        & comp["winner_party_norm_2026"].isin(sel_party)
        & (comp["margin_pct_2026"] <= margin_max)
    ]
    if flip_only:
        out = out[out["flip_norm"]]
    return out


def render_kpis(comp: pd.DataFrame, s26: pd.DataFrame, margin_summary: pd.DataFrame | None = None):
    ms = {r.metric: r.value for _, r in margin_summary.iterrows()} if margin_summary is not None else {}
    c1, c2, c3, c4, c5, c6 = st.columns(6)
    c1.metric("TVK seats (2026)", int((s26["winner_party_norm"] == "TVK").sum()))
    c2.metric("Seat flips", int(comp["flip_norm"].sum()), help="Different normalized winner vs 2021")
    c3.metric("Avg margin 2026", f"{comp['margin_pct_2026'].mean():.1f}%")
    c4.metric("Median margin 2026", f"{ms.get('median_margin_2026', comp['margin_pct_2026'].median()):.1f}%")
    c5.metric("Winner share <35%", int((s26["winner_share_pct"] < 35).sum()))
    c6.metric("Margin <5%", int((comp["margin_pct_2026"] < 5).sum()))


def insight(text: str):
    st.markdown(f'<div class="insight-box">{text}</div>', unsafe_allow_html=True)


def setup_page():
    """Call once per page: theme + data + filters."""
    apply_theme()
    data = load_dashboard_data()
    comp = data["ac_comparison"]
    filtered = filter_comparison(comp, key_prefix=__name__)
    return data, comp, filtered
