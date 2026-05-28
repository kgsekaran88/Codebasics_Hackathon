import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

import streamlit as st
from dashboard.components import setup_page

data, comp, _ = setup_page()

st.title("Methods & data dictionary")
st.markdown(
    """
### Sources
- `tn_2021_results.csv` — Trivedi Centre / ECI (2021 Assembly)
- `tn_2026_results.csv` — ECI live results portal (May 2026)
- `constituency_master.csv` — 234 ACs, districts, editorial regions

### Definitions
| Metric | Definition |
|--------|------------|
| Valid votes | Sum of candidate votes **excluding NOTA** |
| Winner | Highest votes among non-NOTA candidates per AC |
| Margin % | (Winner − Runner-up) / Valid votes × 100 |
| Flip | Normalized winner party differs 2021 vs 2026 |
| Vote share % | Party votes / statewide valid votes |

### Neutrality
Descriptive statistics only. No causal claims, predictions, or party commentary.

### Known gaps
- 2026 **turnout** not in starter CSV (2021 available)
- Party labels **normalized** in code — see `src/party_normalize.py`
- Form-20 audited data may differ slightly from live portal
    """
)

st.subheader("Margin summary (computed)")
st.dataframe(data["margin_summary"], use_container_width=True, hide_index=True)

st.subheader("Where TVK did not win (2026 winner party)")
st.dataframe(data["tvk_non_wins"], use_container_width=True, hide_index=True)

st.subheader("Highest NOTA % (2026)")
st.dataframe(data["nota_2026"].head(15), use_container_width=True, hide_index=True)
