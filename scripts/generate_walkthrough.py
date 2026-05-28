#!/usr/bin/env python3
"""
Generate a 5–7 minute video walkthrough script, slide cues, teleprompter HTML,
and recording checklist for the RPC video deliverable.

Usage:
  python scripts/generate_walkthrough.py
  python scripts/generate_walkthrough.py --minutes 6
"""

from __future__ import annotations

import argparse
import html
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.story_metrics import StoryMetrics, load_story_metrics

OUT_DIR = ROOT / "outputs" / "walkthrough"


def _flow_sentence(metrics: StoryMetrics) -> str:
    parts = []
    for src, tgt, n in metrics.top_sankey_flows[:4]:
        parts.append(f"{src} to {tgt} in {n} seats")
    return "; ".join(parts) if parts else "multiple party-to-party transitions"


def _tvk_region_sentence(metrics: StoryMetrics) -> str:
    items = sorted(metrics.tvk_by_region.items(), key=lambda x: -x[1])[:3]
    return ", ".join(f"{r} ({n} seats)" for r, n in items)


def build_sections(metrics: StoryMetrics, total_minutes: float = 6.0) -> list[dict]:
    """Timed sections for ~6 minute walkthrough."""
    m = metrics
    return [
        {
            "id": "hook",
            "slide": 1,
            "start": "0:00",
            "duration_sec": 30,
            "title": "Hook — headline",
            "script": (
                f"Hi — I'm pitching story ideas for AtliQ's Tamil Nadu 2026 election hour. "
                f"Here's the headline in one sentence: {m.headline} "
                f"We'll unpack three visuals — margins, seat transitions, and where TVK won — "
                f"using only Election Commission data."
            ),
            "on_screen": "Title slide",
            "tips": "Smile, no script reading. Look at camera for first 10 seconds.",
        },
        {
            "id": "brief",
            "slide": 2,
            "start": "0:35",
            "duration_sec": 35,
            "title": "Context — the brief",
            "script": (
                "AtliQ wants the opposite of a debate show — clean facts, no predictions, no commentary. "
                "I'm treating this like a producer briefing: what should go on air, in what order, "
                "and what the numbers actually show across all 234 assembly constituencies."
            ),
            "on_screen": "The brief slide",
            "tips": "Keep energy conversational.",
        },
        {
            "id": "kpis",
            "slide": 3,
            "start": "1:15",
            "duration_sec": 45,
            "title": "Headline numbers",
            "script": (
                f"Five numbers to anchor the show. First — TVK is recorded as the winner in {m.tvk_seats} constituencies. "
                f"Second — {m.flips_norm} seats, or {m.flips_pct} percent, show a different winning party than in 2021. "
                f"Third — the average winning margin fell from {m.avg_margin_2021} percent to {m.avg_margin_2026} percent. "
                f"Fourth — in {m.winner_under_35_2026} seats, the winner received less than 35 percent of valid votes — "
                f"that's a fragmented pattern. And fifth — only {m.winner_over_50_2026} seats had a majority winner above 50 percent."
            ),
            "on_screen": "KPI slide — point to each bullet",
            "tips": "Count on fingers 1–5. Pause half-second between stats.",
        },
        {
            "id": "margins",
            "slide": 4,
            "start": "2:10",
            "duration_sec": 55,
            "title": "Story 1 — margins",
            "script": (
                "Story one is about how close races became. This chart compares winning margins in 2021 versus 2026. "
                f"The statewide average dropped about {m.margin_drop} percentage points. "
                "For viewers, that means more seats where the runner-up was competitive — "
                "good for segment producers who want tension without speculation. "
                "We are not explaining why — only showing the distribution shifted down."
            ),
            "on_screen": "Margin chart + optional dashboard Margins page (/margins)",
            "tips": "Screen-share dashboard here if recording hybrid.",
        },
        {
            "id": "flows",
            "slide": 5,
            "start": "3:20",
            "duration_sec": 60,
            "title": "Story 2 — seat flows",
            "script": (
                "Story two is the transition picture — who held seats in 2021 versus who holds them in 2026. "
                f"The largest flows in our data include: {_flow_sentence(m)}. "
                "In the interactive dashboard, the Sankey view shows this as flows between party labels — "
                "normalized for long ECI party names. "
                "Language matters: say constituencies changed hands, not voters defected."
            ),
            "on_screen": "Sankey bar chart or dashboard Seat flows tab",
            "tips": "Trace one flow with cursor slowly.",
        },
        {
            "id": "tvk",
            "slide": 6,
            "start": "4:35",
            "duration_sec": 50,
            "title": "Story 3 — vote share & TVK",
            "script": (
                "Story three is TVK's footprint and statewide vote share shifts. "
                "This bar chart compares top parties' share of valid votes in 2021 and 2026. "
                f"TVK's regional seat concentration includes {_tvk_region_sentence(m)}. "
                "We report where TVK won and how shares changed — we do not claim whose votes moved, "
                "because that would require voter-level data we don't have."
            ),
            "on_screen": "Vote share chart",
            "tips": "Neutral tone — no praise or criticism of any party.",
        },
        {
            "id": "mosaic",
            "slide": 7,
            "start": "5:40",
            "duration_sec": 35,
            "title": "Geographic mosaic",
            "script": (
                "For geography, we use a regional mosaic — each square is one constituency, same visual weight. "
                "That avoids the misleading big-map problem where land area dominates. "
                "Producers can zoom Chennai Metro, Kongu, or South blocks for B-roll. "
                "The pattern is descriptive: where colors cluster, not why."
            ),
            "on_screen": "Mosaic slide or dashboard Mosaic tab",
            "tips": "Quick pass — don't linger on every region.",
        },
        {
            "id": "editorial",
            "slide": 8,
            "start": "6:25",
            "duration_sec": 45,
            "title": "Editorial recommendation",
            "script": (
                "My recommendation for the 60-minute show: open twelve minutes on statewide arithmetic — "
                "TVK seats, flip count, margin shift. "
                "Then eighteen minutes on regional mosaic plus transition flows. "
                "Twelve minutes on the closest races — use the explorer table for margins under five percent. "
                "Close eight minutes on data caveats — live ECI versus final Form-20, and how we normalized party labels. "
                "That order moves from simple to detailed, and ends with trust."
            ),
            "on_screen": "Editorial recommendation slide",
            "tips": "This is the scored slide — be crisp and confident.",
        },
        {
            "id": "limits",
            "slide": 9,
            "start": "7:20",
            "duration_sec": 25,
            "title": "Limitations",
            "script": (
                "Quick limitations: 2026 data is from the live ECI portal; audited Form-20 may differ slightly. "
                "Party labels are normalized in code — see the public GitHub README. "
                "Turnout for 2026 wasn't in the starter file — add an ECI scrape if you want a turnout segment."
            ),
            "on_screen": "Limitations slide",
            "tips": "Don't rush — honesty scores points.",
        },
        {
            "id": "close",
            "slide": 10,
            "start": "7:45",
            "duration_sec": 20,
            "title": "Close",
            "script": (
                "Thanks for your time — the full notebook, dashboard, and this deck are on GitHub. "
                "Happy to walk through any constituency in the explorer. Thank you."
            ),
            "on_screen": "Thank you slide",
            "tips": "End on camera, not on silent dashboard.",
        },
    ]


def write_markdown_script(sections: list[dict], metrics: StoryMetrics, path: Path) -> None:
    total_sec = sum(s["duration_sec"] for s in sections)
    lines = [
        "# Video walkthrough script — TN Assembly 2026",
        "",
        f"**Target length:** ~{total_sec // 60}:{total_sec % 60:02d} ({total_sec} seconds)",
        "",
        f"**Headline:** {metrics.headline}",
        "",
        "---",
        "",
    ]
    for s in sections:
        lines.extend(
            [
                f"## [{s['start']}] {s['title']} (Slide {s['slide']}, ~{s['duration_sec']}s)",
                "",
                f"**On screen:** {s['on_screen']}",
                "",
                f"**Delivery tip:** {s['tips']}",
                "",
                s["script"],
                "",
                "---",
                "",
            ]
        )
    lines.append("## Full script (read-through)\n")
    lines.append("\n\n".join(s["script"] for s in sections))
    path.write_text("\n".join(lines), encoding="utf-8")


def write_slide_cues(sections: list[dict], path: Path) -> None:
    lines = ["# Slide cues — sync deck with video\n", "| Time | Slide | Action |\n|------|-------|--------|\n"]
    for s in sections:
        lines.append(f"| {s['start']} | {s['slide']} | Advance to: **{s['title']}** |\n")
    path.write_text("\n".join(lines), encoding="utf-8")


def write_checklist(path: Path) -> None:
    path.write_text(
        """# Video recording checklist — RPC #21

## Before recording
- [ ] Run `python scripts/build_all_deliverables.py`
- [ ] Open deck: `deck/TN_2026_AtliQ_Briefing.pptx`
- [ ] Open teleprompter: `outputs/walkthrough/teleprompter.html` on second monitor (optional)
- [ ] Test microphone — external mic preferred
- [ ] Close notifications; 1080p display scaling at 100%
- [ ] Dashboard ready: `uvicorn api.main:app --port 8000` (after `cd web && npm run build`) or `npm run dev` on :5173

## During recording (5–7 min)
- [ ] Webcam on for hook and close (at minimum)
- [ ] Do not read word-for-word — use bullet memory + chart pointing
- [ ] Neutral language — no party praise/criticism
- [ ] Show dashboard Sankey + Mosaic for 30–60 seconds total

## After recording
- [ ] Upload YouTube (unlisted) or Google Drive public link
- [ ] Push GitHub repo with README
- [ ] LinkedIn post: video + repo + @codebasics + required tags
- [ ] Submit LinkedIn URL on RPC page before 28 May 2026

## Rubric self-test
- [ ] Viewer can state your headline after watching once
- [ ] Editorial recommendation is explicit (segment order + duration)
- [ ] Limitations mentioned aloud
""",
        encoding="utf-8",
    )


def write_teleprompter_html(sections: list[dict], metrics: StoryMetrics, path: Path) -> None:
    blocks = []
    for s in sections:
        blocks.append(
            f"""
<section class="block" data-duration="{s['duration_sec']}">
  <div class="meta">Slide {s['slide']} · {s['start']} · ~{s['duration_sec']}s · {html.escape(s['title'])}</div>
  <p class="script">{html.escape(s['script'])}</p>
  <p class="tip">Tip: {html.escape(s['tips'])}</p>
</section>"""
        )
    body = "\n".join(blocks)

    doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>TN 2026 Walkthrough Teleprompter</title>
  <style>
    body {{ background:#0f1419; color:#e2e8f0; font-family: system-ui, sans-serif; margin:0; padding:2rem; max-width: 900px; margin-inline:auto; }}
    h1 {{ color:#38bdf8; font-size:1.4rem; }}
    .headline {{ color:#94a3b8; font-size:1rem; margin-bottom:2rem; line-height:1.5; }}
    .block {{ margin-bottom:2.5rem; padding-bottom:2rem; border-bottom:1px solid #334155; }}
    .meta {{ color:#38bdf8; font-size:0.85rem; margin-bottom:0.75rem; text-transform:uppercase; letter-spacing:0.05em; }}
    .script {{ font-size:1.35rem; line-height:1.65; }}
    .tip {{ font-size:0.9rem; color:#94a3b8; margin-top:1rem; font-style:italic; }}
    .controls {{ position:fixed; bottom:1rem; right:1rem; display:flex; gap:0.5rem; }}
    button {{ background:#3b82f6; color:#fff; border:none; padding:0.6rem 1rem; border-radius:8px; cursor:pointer; font-size:1rem; }}
    .active .script {{ color:#fbbf24; }}
  </style>
</head>
<body>
  <h1>Teleprompter — AtliQ TN 2026 pitch</h1>
  <p class="headline">{html.escape(metrics.headline)}</p>
  {body}
  <div class="controls">
    <button onclick="prev()">Previous</button>
    <button onclick="next()">Next section</button>
  </div>
  <script>
    const blocks = document.querySelectorAll('.block');
    let i = 0;
    function show() {{
      blocks.forEach((b,j) => b.classList.toggle('active', j===i));
      blocks[i].scrollIntoView({{behavior:'smooth', block:'center'}});
    }}
    function next() {{ i = Math.min(i+1, blocks.length-1); show(); }}
    function prev() {{ i = Math.max(i-1, 0); show(); }}
    show();
  </script>
</body>
</html>"""
    path.write_text(doc, encoding="utf-8")


def write_speaker_notes_deck(sections: list[dict], path: Path) -> None:
    """Plain-text speaker notes export for printing."""
    lines = ["SPEAKER NOTES — Print or tablet side-by-side\n" + "=" * 50 + "\n"]
    for s in sections:
        lines.append(f"\n[{s['start']}] SLIDE {s['slide']} — {s['title']}\n")
        lines.append(f"ON SCREEN: {s['on_screen']}\n")
        lines.append(f"TIP: {s['tips']}\n\n")
        lines.append(s["script"] + "\n")
        lines.append("-" * 50)
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--minutes", type=float, default=6.0, help="Target length (informational)")
    parser.add_argument("--out", type=Path, default=OUT_DIR)
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    metrics = load_story_metrics()
    sections = build_sections(metrics, args.minutes)

    write_markdown_script(sections, metrics, args.out / "WALKTHROUGH_SCRIPT.md")
    write_slide_cues(sections, args.out / "SLIDE_CUES.md")
    write_checklist(args.out / "RECORDING_CHECKLIST.md")
    write_speaker_notes_deck(sections, args.out / "SPEAKER_NOTES.txt")
    write_teleprompter_html(sections, metrics, args.out / "teleprompter.html")

    total = sum(s["duration_sec"] for s in sections)
    print(f"Walkthrough outputs → {args.out}")
    print(f"  WALKTHROUGH_SCRIPT.md")
    print(f"  SLIDE_CUES.md")
    print(f"  SPEAKER_NOTES.txt")
    print(f"  teleprompter.html")
    print(f"  RECORDING_CHECKLIST.md")
    print(f"Estimated duration: {total // 60}m {total % 60}s")


if __name__ == "__main__":
    main()
