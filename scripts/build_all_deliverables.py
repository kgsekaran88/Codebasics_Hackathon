#!/usr/bin/env python3
"""
One command to rebuild data, charts, PowerPoint deck, and walkthrough materials.

  python scripts/build_all_deliverables.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PY = sys.executable


def run(cmd: list[str], label: str) -> None:
    print(f"\n=== {label} ===")
    subprocess.run(cmd, cwd=ROOT, check=True)


def main():
    run([PY, "scripts/build_processed_data.py"], "Processed data")
    run([PY, "scripts/export_charts.py"], "Plotly HTML charts")
    run([PY, "scripts/build_presentation.py"], "PowerPoint deck")
    run([PY, "scripts/generate_walkthrough.py"], "Walkthrough script & teleprompter")
    print("\nAll deliverables ready.")
    print("  Deck:      deck/TN_2026_AtliQ_Briefing.pptx")
    print("  Walkthrough: outputs/walkthrough/")
    print("  Dashboard: uvicorn api.main:app --port 8000  (after: cd web && npm run build)")


if __name__ == "__main__":
    main()
