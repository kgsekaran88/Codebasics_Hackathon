import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

import streamlit as st
from dashboard.components import insight, setup_page
from src.charts import fig_margin_beeswarm, fig_margin_violin

data, comp, filtered = setup_page()

st.title("Fragmentation — margins & winner share")
insight(
    f"<strong>{int((filtered['winner_share_pct_2026'] < 35).sum())}</strong> filtered seats have winner below 35% of valid votes. "
    f"<strong>{int((filtered['margin_pct_2026'] < 5).sum())}</strong> seats decided by &lt;5% margin."
)

st.plotly_chart(fig_margin_violin(comp), use_container_width=True)
st.plotly_chart(fig_margin_beeswarm(filtered), use_container_width=True)

st.subheader("Closest races (2026)")
st.dataframe(data["closest_races"], use_container_width=True, hide_index=True)

st.subheader("Winner vote-share buckets (2026)")
st.dataframe(data["winner_share_buckets"], use_container_width=True, hide_index=True)

st.subheader("Landslides (margin ≥ 20%)")
st.dataframe(
    data["landslides_2026"][["ac_number", "constituency", "region", "winner_party_norm_2026", "margin_pct_2026"]].head(20),
    use_container_width=True,
    hide_index=True,
)
