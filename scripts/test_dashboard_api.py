#!/usr/bin/env python3
"""Smoke-test all dashboard API endpoints. Run while API is up on :8000."""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:8000/api"
ENDPOINTS = [
    "health",
    "kpis",
    "kpis?year=2021",
    "kpis?year=2026",
    "meta",
    "filters/meta",
    "comparison",
    "seat-tally",
    "vote-share",
    "sankey",
    "sankey?full=true",
    "flips-by-region",
    "flips-by-reserved",
    "reserved-breakdown",
    "party-retention",
    "closest-races",
    "winner-share-buckets",
    "margin-summary",
    "regional-seats",
    "tvk-non-wins",
    "nota",
    "nota-all",
    "insights",
    "insights?year=2021",
    "insights?year=2026",
    "turnout-by-region",
    "candidate-buckets",
    "ac/1",
]


def check(path: str) -> tuple[bool, str]:
    url = f"{BASE}/{path}"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            body = resp.read()
            if resp.status != 200:
                return False, f"HTTP {resp.status}"
            json.loads(body)
            return True, f"OK ({len(body)} bytes)"
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}"
    except Exception as e:
        return False, str(e)


def main() -> int:
    failed = []
    print("TN Election API smoke test\n" + "=" * 40)
    for path in ENDPOINTS:
        ok, msg = check(path)
        status = "PASS" if ok else "FAIL"
        print(f"  [{status}] /{path} — {msg}")
        if not ok:
            failed.append(path)
    print("=" * 40)
    if failed:
        print(f"\n{len(failed)} failed. Is uvicorn running?")
        return 1
    print("\nAll endpoints OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
