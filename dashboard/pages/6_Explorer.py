import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

import pandas as pd
import streamlit as st
from dashboard.components import setup_page

data, comp, filtered = setup_page()

st.title("Constituency explorer")

search = st.text_input("Search constituency name", "")
ac = st.number_input("Assembly constituency number (1–234)", min_value=1, max_value=234, value=1)

view = filtered.copy()
if search:
    view = view[view["constituency"].str.contains(search, case=False, na=False)]

st.dataframe(
    view[
        [
            "ac_number",
            "constituency",
            "district",
            "region",
            "reserved",
            "winner_party_norm_2021",
            "winner_party_norm_2026",
            "margin_pct_2021",
            "margin_pct_2026",
            "winner_share_pct_2026",
            "flip_norm",
        ]
    ].sort_values("margin_pct_2026"),
    use_container_width=True,
    hide_index=True,
)

row = comp[comp["ac_number"] == ac]
if row.empty:
    st.warning("No data for this AC.")
else:
    r = row.iloc[0]
    st.subheader(f"AC {ac}: {r.get('constituency', '')} ({r.get('district', '')})")
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("2021 winner", r["winner_party_norm_2021"])
    m2.metric("2026 winner", r["winner_party_norm_2026"])
    m3.metric("Margin 2026", f"{r['margin_pct_2026']}%")
    m4.metric("Flip", "Yes" if r["flip_norm"] else "No")
    if "turnout_pct_2021" in r and pd.notna(r["turnout_pct_2021"]):
        st.write(f"Turnout 2021: {r['turnout_pct_2021']}%")

import pandas as pd
