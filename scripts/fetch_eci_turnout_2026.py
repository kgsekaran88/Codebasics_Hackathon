#!/usr/bin/env python3
"""
Fetch 2026 Tamil Nadu Assembly per-AC turnout from ECI public sources.

The hackathon brief explicitly says the 2026 turnout column is blank in the
starter CSV and that participants must source it from results.eci.gov.in or
ECI Form-20. This script attempts an automated fetch from the ECI portal.

Output: data/external/turnout_2026.csv with columns: ac_number, turnout_pct_2026

If the ECI portal endpoint changes or is unreachable in this environment,
the script writes a template CSV with all 234 ACs and a note column so the
analyst can paste values manually.

Usage:
  python scripts/fetch_eci_turnout_2026.py
  python scripts/fetch_eci_turnout_2026.py --template-only
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.load_data import load_master

EXTERNAL = ROOT / "data" / "external"
OUT = EXTERNAL / "turnout_2026.csv"

ECI_BASE = "https://results.eci.gov.in"


def write_template(reason: str = "") -> Path:
    """Write a 234-row template CSV the user can hand-fill from ECI."""
    EXTERNAL.mkdir(parents=True, exist_ok=True)
    master = load_master()[["ac_number", "constituency", "district", "region"]]
    master = master.sort_values("ac_number").reset_index(drop=True)
    master["turnout_pct_2026"] = ""
    master["source"] = ""
    master.to_csv(OUT, index=False)
    msg = f"Template written to {OUT}"
    if reason:
        msg += f" ({reason})"
    print(msg)
    print("Fill the `turnout_pct_2026` column from results.eci.gov.in (per AC) or ECI Form-20.")
    print("Then re-run: python scripts/build_processed_data.py")
    return OUT


def try_fetch_eci() -> bool:
    """Best-effort live fetch. Returns True on success, False otherwise.

    Implementation note: results.eci.gov.in serves JS-rendered pages and
    rotates endpoints between elections. We attempt the documented JSON
    feeds; if unavailable, we fall back to the template.
    """
    try:
        import requests
    except ImportError:
        print("requests not installed; install with: pip install requests")
        return False

    candidate_endpoints = [
        f"{ECI_BASE}/AcResultGenJune2026/election-overviews22.htm?st=S22",
        f"{ECI_BASE}/AcResultGenJune2026/statewise-S22.htm",
    ]
    headers = {"User-Agent": "Mozilla/5.0 (RPC analyst — TN 2026 turnout fetch)"}

    for url in candidate_endpoints:
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200 and "turnout" in resp.text.lower():
                # ECI page structure changes each cycle; parsing here would
                # be brittle. Leave hook for analyst customization.
                print(f"Reached {url} ({len(resp.text)} bytes) — parser not implemented.")
                print("Manual step: open the page, copy per-AC turnout into the template.")
                return False
        except Exception as e:
            print(f"  · {url} unreachable ({e.__class__.__name__})")

    return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch ECI 2026 TN turnout")
    parser.add_argument("--template-only", action="store_true", help="Skip network fetch")
    args = parser.parse_args()

    if args.template_only:
        write_template("requested template")
        return 0

    if try_fetch_eci():
        return 0

    write_template("ECI portal not parsed automatically — fill manually")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
