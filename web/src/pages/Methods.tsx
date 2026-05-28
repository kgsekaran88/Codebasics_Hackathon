import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";

export default function Methods() {
  const { data: insights } = useApi(() => api.insights(), []);

  return (
    <div className="space-y-8 max-w-3xl pb-8">
      <header>
        <h1 data-testid="page-title" className="font-display text-4xl text-white">
          Methods & sources
        </h1>
        <p className="text-[var(--color-muted)] mt-2">
          Sources, definitions, and caveats for the briefing. ECI data only; descriptive counts with
          no predictions or causal claims.{" "}
          <Link to="/" className="text-[var(--color-accent)] hover:underline">
            Editorial brief
          </Link>
        </p>
        {insights?.headline && (
          <p className="text-sm text-white/90 mt-3 border-l-2 border-[var(--color-accent)] pl-3">
            {insights.headline}
          </p>
        )}
      </header>

      <section className="panel p-6 space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold text-white">Data in this dashboard</h2>
        <ul className="list-disc pl-5 text-[var(--color-muted)] space-y-2">
          <li>2021 results: Trivedi Centre / ECI tabulation (starter CSV)</li>
          <li>2026 results: ECI live results portal (starter CSV)</li>
          <li>234 AC master: district, six editorial macro-regions, reserved category (GEN / SC / ST)</li>
        </ul>

        <h2 className="text-lg font-semibold text-white pt-2">What is not in the starter files</h2>
        <p className="text-[var(--color-muted)]">
          {insights?.data_scope?.note ??
            "Booth-level and voter-age tables are not included. Analysis stays at constituency level."}
        </p>
        <ul className="list-disc pl-5 text-[var(--color-muted)] space-y-1">
          <li>
            <strong className="text-white">Polling booth</strong> — not available
            {insights?.data_scope?.has_booth_level === false ? " ✗" : ""}
          </li>
          <li>
            <strong className="text-white">Voter age / demographics</strong> — not available
            {insights?.data_scope?.has_age_demographics === false ? " ✗" : ""}
          </li>
          <li>
            <strong className="text-white">2026 turnout</strong> — blank in starter CSV; Depth page uses
            2021 turnout where shown
          </li>
          <li>
            <strong className="text-white">Candidate lists per AC</strong> — available (used on Depth for
            ballot size & NOTA)
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-white pt-2">Metrics</h2>
        <ul className="list-disc pl-5 text-[var(--color-muted)] space-y-2">
          <li>
            <strong className="text-white">Winner</strong> — highest valid votes; party strings
            normalized (e.g. DMK+, INC+ → bloc codes)
          </li>
          <li>
            <strong className="text-white">Margin %</strong> — (winner votes − runner-up votes) /
            valid votes × 100
          </li>
          <li>
            <strong className="text-white">Flip</strong> — normalized 2021 winner ≠ normalized 2026
            winner
          </li>
          <li>
            <strong className="text-white">Vote share</strong> — party votes / statewide valid votes
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-white pt-2">Stack</h2>
        <p className="text-[var(--color-muted)]">
          Python pipeline (<code className="text-white/80">scripts/build_processed_data.py</code>
          ) → FastAPI → React + Apache ECharts.
        </p>

        <h2 className="text-lg font-semibold text-white pt-2">Limitations</h2>
        <p className="text-[var(--color-muted)]">
          District map uses open GADM polygons; newer districts may not match 2026 ECI names exactly.
          Sankey shows top flows unless “all flows” is enabled. Key insight lines are computed from
          the same processed tables as the charts. 2026 turnout is absent from the results file
          provided for this analysis.
        </p>
      </section>
    </div>
  );
}
