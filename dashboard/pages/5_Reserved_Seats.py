import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

import streamlit as st
import plotly.express as px
from dashboard.components import setup_page
from src.charts import fig_reserved_comparison, _LAYOUT  # noqa: SLF001

data, comp, filtered = setup_page()

st.title("Reserved constituencies (SC / ST / GEN)")
st.plotly_chart(fig_reserved_comparison(data["reserved_breakdown"]), use_container_width=True)

st.subheader("Flip rate by reservation")
st.dataframe(data["flips_by_reserved"], use_container_width=True, hide_index=True)

# Heatmap: party x reserved for 2026
pivot = data["reserved_breakdown"][data["reserved_breakdown"]["year"] == "2026"].pivot_table(
    index="party", columns="reserved", values="seats", fill_value=0
)
fig = px.imshow(pivot, text_auto=True, color_continuous_scale="Blues", aspect="auto")
fig.update_layout(**_LAYOUT, title="2026 seats won — party × reservation", height=400)
st.plotly_chart(fig, use_container_width=True)
