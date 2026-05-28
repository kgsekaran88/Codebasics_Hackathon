"""
TN Assembly 2026 — Deep Analysis Dashboard
Run: streamlit run dashboard/app.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st

st.set_page_config(
    page_title="TN Election 2026 | AtliQ Deep Dive",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

from dashboard.components import insight, render_kpis, setup_page
from src.charts import fig_flip_heatmap, fig_margin_violin, fig_seat_tally, fig_vote_share_compare

data, comp, _filtered = setup_page()

st.title("Overview — TN Assembly 2026")
st.markdown(
    '<p class="hero">Neutral ECI-based analytics for AtliQ Media. '
    "Use sidebar filters and left navigation for deep dives.</p>",
    unsafe_allow_html=True,
)

render_kpis(comp, data["ac_summary_2026"], data.get("margin_summary"))

flips = int(comp["flip_norm"].sum())
tvk = int((data["ac_summary_2026"]["winner_party_norm"] == "TVK").sum())
insight(
    f"<strong>Headline:</strong> {flips}/234 constituencies ({100*flips/234:.0f}%) flipped. "
    f"TVK won {tvk} seats. Avg margin {comp['margin_pct_2021'].mean():.1f}% → {comp['margin_pct_2026'].mean():.1f}%."
)

st.plotly_chart(fig_seat_tally(data["seat_tally"]), use_container_width=True)
st.plotly_chart(fig_vote_share_compare(data["vote_share_2021"], data["vote_share_2026"]), use_container_width=True)
c1, c2 = st.columns(2)
with c1:
    st.plotly_chart(fig_flip_heatmap(data["flips_by_region"]), use_container_width=True)
with c2:
    st.plotly_chart(fig_margin_violin(comp), use_container_width=True)
st.dataframe(data["seat_tally"], use_container_width=True, hide_index=True)
