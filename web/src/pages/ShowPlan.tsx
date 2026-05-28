import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useApi } from "../hooks/useApi";
import DashboardShell from "../components/DashboardShell";
import { TurnoutDataNote } from "../components/StoryFocusBanner";

export default function ShowPlan() {
  const { data: plan, error } = useApi(() => api.editorial(), []);

  if (error) {
    return (
      <div className="panel p-6 text-center text-sm">
        <p className="text-red-400" data-testid="api-error">
          Cannot reach the data service. Start the API on port 8000 and refresh.
        </p>
      </div>
    );
  }

  if (!plan) {
    return (
      <DashboardShell title="Editorial brief" subtitle="Loading…">
        <p className="text-[var(--color-muted)] text-sm">Loading…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Editorial brief"
      subtitle="Recommended structure for AtliQ Media’s 60-minute Tamil Nadu assembly special (ECI data, neutral framing)."
    >
      <div className="panel px-4 py-3 shrink-0" data-testid="briefing-intro">
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">{plan.briefing_intro}</p>
      </div>

      {plan.headline && (
        <p
          className="text-sm text-white/90 border-l-2 border-[var(--color-accent)] pl-3 shrink-0 font-medium"
          data-testid="show-headline"
        >
          {plan.headline}
        </p>
      )}

      <section className="shrink-0" data-testid="core-narratives">
        <h2 className="text-sm font-semibold text-white">Three core threads</h2>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          Build the on-air segment and slides around these; other views are supporting material.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          {plan.core_narratives.map((n) => (
            <Link
              key={n.path}
              to={n.path}
              className="panel p-4 hover:bg-[var(--color-panel-hover)] transition-colors block"
            >
              <p className="text-sm font-medium text-white">{n.label}</p>
              <p className="text-xs text-[var(--color-muted)] mt-2 leading-relaxed">{n.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="shrink-0" data-testid="show-segments">
        <h2 className="text-sm font-semibold text-white">Run of show (~60 min)</h2>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          Suggested order and timing; adjust with the producer.
        </p>
        <div className="mt-3 space-y-2">
          {plan.run_of_show.map((s, i) => (
            <div
              key={s.title}
              className="panel px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3"
            >
              <div className="shrink-0 flex items-center gap-2 tabular-nums">
                <span className="text-sm font-medium text-[var(--color-accent)]">{i + 1}</span>
                <span className="text-xs text-[var(--color-muted)]">{s.minutes} min</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{s.title}</p>
                <p className="text-xs text-[var(--color-muted)] mt-1 leading-relaxed">{s.why}</p>
                <Link
                  to={s.path}
                  className="inline-block mt-1.5 text-xs text-[var(--color-accent)] hover:underline"
                >
                  Open charts →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel px-4 py-3 shrink-0">
        <h2 className="text-sm font-semibold text-white">Constituency explorer</h2>
        <p className="text-xs text-[var(--color-muted)] mt-1 leading-relaxed">
          {plan.explorer.description}
        </p>
        <Link
          to={plan.explorer.path}
          className="inline-block mt-2 text-sm text-[var(--color-accent)] hover:underline"
        >
          Open explorer →
        </Link>
      </section>

      <TurnoutDataNote />

      {plan.supporting_views.length > 0 && (
        <section className="shrink-0" data-testid="supporting-views">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Supporting views
          </h2>
          <ul className="mt-2 space-y-2">
            {plan.supporting_views.map((v) => (
              <li key={v.path} className="text-sm">
                <Link to={v.path} className="text-[var(--color-accent)] hover:underline">
                  {v.label}
                </Link>
                <span className="text-[var(--color-muted)]"> — {v.summary}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel px-4 py-3 shrink-0" data-testid="limitations-block">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/80">
          Data caveats (closing segment)
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm text-[var(--color-muted)] list-disc pl-4">
          {plan.limitations.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </DashboardShell>
  );
}
