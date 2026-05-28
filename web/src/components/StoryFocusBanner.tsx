import { Link } from "react-router-dom";

const NARRATIVES = [
  { label: "Margins", path: "/margins" },
  { label: "Seat flows", path: "/flows" },
  { label: "Statewide", path: "/overview" },
] as const;

type Focus = "margins" | "flows" | "overview";

const FOCUS_COPY: Record<Focus, string> = {
  margins: "winning margins and how tight races became in 2026",
  flows: "how seats moved between parties from 2021 to 2026",
  overview: "statewide seat totals, vote share, and the constituency mosaic",
};

interface Props {
  focus: Focus;
}

export default function StoryFocusBanner({ focus }: Props) {
  return (
    <div
      className="shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]/50 px-3 py-2.5"
      data-testid="story-focus-banner"
    >
      <p className="text-xs text-[var(--color-muted)] leading-relaxed">
        This view covers <span className="text-white/90">{FOCUS_COPY[focus]}</span> — one of three
        threads in the editorial brief.
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {NARRATIVES.map(({ label, path }) => (
          <Link
            key={path}
            to={path}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
              (focus === "margins" && path === "/margins") ||
              (focus === "flows" && path === "/flows") ||
              (focus === "overview" && path === "/overview")
                ? "border-[var(--color-accent)]/50 text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
        <Link
          to="/"
          className="text-xs px-2.5 py-1 rounded-md border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white"
        >
          Editorial brief
        </Link>
      </div>
    </div>
  );
}

export function SupplementaryBanner({ topic }: { topic: string }) {
  return (
    <div
      className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted)] leading-relaxed"
      data-testid="supplementary-banner"
    >
      Supplementary — <span className="text-white/85">{topic}</span>. Use if the producer wants a
      short extra segment; not part of the three core threads.{" "}
      <Link to="/" className="text-[var(--color-accent)] hover:underline">
        See run-of-show
      </Link>
    </div>
  );
}

export function TurnoutDataNote() {
  return (
    <div
      className="shrink-0 rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2.5 text-xs text-amber-100/85 leading-relaxed"
      data-testid="turnout-data-note"
    >
      <p className="font-medium text-amber-200/90">Turnout data note</p>
      <p className="mt-1">
        The 2026 results file does not include turnout percentages. Charts here use 2021
        constituency-level turnout only. Do not compare turnout across cycles until 2026 figures are
        sourced from ECI and merged into the dataset.
      </p>
    </div>
  );
}
