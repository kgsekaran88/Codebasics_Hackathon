import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

import streamlit as st
from dashboard.components import setup_page
from src.charts import fig_regional_seats, fig_tile_mosaic

data, comp, filtered = setup_page()

st.title("Geography — regions & districts")
st.plotly_chart(fig_tile_mosaic(filtered), use_container_width=True)
st.plotly_chart(
    fig_regional_seats(data["regional_seats_2021"], data["regional_seats_2026"]),
    use_container_width=True,
)

c1, c2 = st.columns(2)
with c1:
    st.subheader("Flips by region")
    st.dataframe(data["flips_by_region"], use_container_width=True, hide_index=True)
with c2:
    st.subheader("TVK seats by region (2026)")
    tvk = (
        data["regional_seats_2026"][data["regional_seats_2026"]["winner_party_norm"] == "TVK"]
        .rename(columns={"seats": "TVK seats"})
    )
    st.dataframe(tvk, use_container_width=True, hide_index=True)

st.subheader("Top districts by TVK seats (2026)")
st.dataframe(
    data["district_seats_2026"][data["district_seats_2026"]["party"] == "TVK"].sort_values(
        "seats", ascending=False
    ).head(20),
    use_container_width=True,
    hide_index=True,
)
