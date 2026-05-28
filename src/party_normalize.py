"""Map raw ECI party strings to normalized labels for analysis."""

from __future__ import annotations

import re
from pathlib import Path

import pandas as pd

# Substring rules (order matters — first match wins)
_SUBSTRING_RULES: list[tuple[str, str]] = [
    ("NOTA", "NOTA"),
    ("THANTHAI PERIYAR", "PT"),
    ("PURATCHI THALAIVAR", "AIADMK"),
    ("DRAVIDA MUNNETRA", "DMK"),
    ("DRAVIDA MUNNETRA KAZHAGAM", "DMK"),
    ("ANNA DRAVIDA", "AIADMK"),
    ("ALL INDIA ANNA", "AIADMK"),
    ("ALL INDIA PURATCHI", "AIADMK"),
    ("AIADMK", "AIADMK"),
    ("DMK", "DMK"),
    ("TVK", "TVK"),
    ("BHARATIYA JANATA", "BJP"),
    ("BJP", "BJP"),
    ("INDIAN NATIONAL CONGRESS", "INC"),
    ("CONGRESS", "INC"),
    ("INC", "INC"),
    ("NAAM TAMILAR", "NTK"),
    ("NTK", "NTK"),
    ("VIDUTHALAI CHIRUTHAIGAL", "VCK"),
    ("VCK", "VCK"),
    ("PATTALI MAKKAL", "PMK"),
    ("PMK", "PMK"),
    ("BAHUJAN SAMAJ", "BSP"),
    ("BSP", "BSP"),
    ("COMMUNIST PARTY OF INDIA (MARXIST)", "CPI(M)"),
    ("COMMUNIST PARTY OF INDIA (M", "CPI(M)"),
    ("CPI(M)", "CPI(M)"),
    ("CPI(MARXIST)", "CPI(M)"),
    ("COMMUNIST PARTY OF INDIA", "CPI"),
    ("CPI", "CPI"),
    ("DMDK", "DMDK"),
    ("AMMK", "AMMK"),
    ("MDMK", "MDMK"),
    ("PUTHIYA TAMILAGAM", "PT"),
    ("TAMIZHAGA VAZHURIM", "TVK"),
    ("KONGUNADU MAKKAL", "KMDK"),
    ("INDEPENDENT", "IND"),
]

# Exact overrides for common 2021 labels
_EXACT: dict[str, str] = {
    "DMK": "DMK",
    "AIADMK": "AIADMK",
    "TVK": "TVK",
    "INC": "INC",
    "BJP": "BJP",
    "NTK": "NTK",
    "VCK": "VCK",
    "PMK": "PMK",
    "CPI": "CPI",
    "CPI(M)": "CPI(M)",
    "DMDK": "DMDK",
    "AMMK": "AMMK",
    "MDMK": "MDMK",
    "BSP": "BSP",
    "NOTA": "NOTA",
    "IND": "IND",
    "IJK": "OTH",
    "MNM": "MNM",
    "NMK": "NMK",
}


def normalize_party(raw: str) -> str:
    if not isinstance(raw, str) or not raw.strip():
        return "OTH"
    s = raw.strip()
    upper = s.upper()
    if s in _EXACT:
        return _EXACT[s]
    if upper == "IND" or upper == "INDEPENDENT":
        return "IND"
    for needle, label in _SUBSTRING_RULES:
        if needle in upper:
            return label
  # Short all-caps tokens
    if re.fullmatch(r"[A-Z0-9()/. -]{2,20}", upper) and len(upper) <= 12:
        return upper.replace(" ", "")[:10] if upper not in ("NOTA",) else "NOTA"
    return "OTH"


def apply_party_column(df: pd.DataFrame, col: str = "party") -> pd.DataFrame:
    out = df.copy()
    out["party_norm"] = out[col].map(normalize_party)
    return out


def load_party_map_csv(path: Path | None = None) -> pd.DataFrame | None:
    if path is None:
        path = Path(__file__).resolve().parents[1] / "data" / "party_normalize.csv"
    if path.exists():
        return pd.read_csv(path)
    return None
