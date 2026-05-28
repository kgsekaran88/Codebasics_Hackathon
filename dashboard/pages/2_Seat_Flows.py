import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

import streamlit as st
from dashboard.components import insight, setup_page
from src.charts import fig_sankey, fig_transition_bars

data, comp, filtered = setup_page()

st.title("Seat flows & party retention")
insight(
    f"<strong>{int(comp['flip_norm'].sum())}</strong> constituencies changed normalized winning party. "
    "Bars show exact constituency counts — not vote transfer."
)

st.plotly_chart(fig_sankey(data["sankey"]), use_container_width=True)
st.plotly_chart(fig_transition_bars(data["sankey_full"], top=12), use_container_width=True)

st.subheader("Party retention (seats held 2021→2026)")
st.dataframe(
    data["party_retention"],
    use_container_width=True,
    hide_index=True,
    column_config={
        "retention_pct": st.column_config.NumberColumn("Retention %", format="%.1f"),
    },
)

st.subheader("Full transition table")
st.dataframe(data["sankey_full"], use_container_width=True, hide_index=True)
