"""Load raw and processed datasets."""

from __future__ import annotations

from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"


def load_raw_results(year: int) -> pd.DataFrame:
    path = RAW / f"tn_{year}_results.csv"
    return pd.read_csv(path)


def load_master() -> pd.DataFrame:
    return pd.read_csv(RAW / "constituency_master.csv")


def load_processed(name: str) -> pd.DataFrame:
    return pd.read_csv(PROCESSED / name)


def ensure_processed() -> None:
    """Build processed CSVs if missing."""
    if not (PROCESSED / "ac_comparison.csv").exists():
        from scripts.build_processed_data import main

        main()
