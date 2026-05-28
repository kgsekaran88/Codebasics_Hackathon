import { api } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { usePageInsights } from "../hooks/usePageInsights";
import DashboardShell, { Panel } from "../components/DashboardShell";
import EChart from "../components/EChart";
import InsightPanel from "../components/InsightPanel";
import {
  enpRegionOption,
  swingHeatmapOption,
  antiIncumbencyOption,
  representationGapOption,
  raceTypeOption,
} from "../charts/options";

/**
 * Deep insights — designed as a multi-panel scrolling page.
 *
 * Each chart panel has an explicit pixel height so ECharts can measure properly.
 * This page is intentionally not a viewport-fit layout (8+ panels).
 */
export default function DeepInsights() {
  const { data: summary } = useApi(() => api.advancedSummary(), []);
  const { data: enp } = useApi(() => api.enpByRegion(), []);
  const { data: pedersen } = useApi(() => api.pedersenByRegion(), []);
  const { data: swing } = useApi(() => api.swingByRegion(), []);
  const { data: anti } = useApi(() => api.antiIncumbency(), []);
  const { data: gap } = useApi(() => api.representationGap(), []);
  const { data: races } = useApi(() => api.raceTypes(), []);
  const { data: districts } = useApi(() => api.districtFlips(), []);
  const { bullets } = usePageInsights("deep", "2026");

  return (
    <DashboardShell
      title="Deep insights — electoral arithmetic"
      subtitle="Political-science indices applied to ECI data. All measures are descriptive."
    >
      {bullets.length > 0 && <InsightPanel bullets={bullets} yearLabel="2021 vs 2026" />}

      <section className="panel p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Headline indices · 2026 vs 2021</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Kpi
            label="ENP — vote"
            value={summary ? `${summary.enp_statewide_2021} → ${summary.enp_statewide_2026}` : "—"}
            hint="Effective parties (Laakso–Taagepera)"
          />
          <Kpi
            label="Pedersen volatility"
            value={summary ? `${summary.pedersen_statewide}` : "—"}
            hint="Net vote-share churn (0–100)"
            accent
          />
          <Kpi
            label="Gallagher LSq"
            value={summary ? `${summary.gallagher_lsq_2021} → ${summary.gallagher_lsq_2026}` : "—"}
            hint="Disproportionality (lower = fairer)"
          />
          <Kpi
            label="Incumbent loss"
            value={summary ? `${summary.incumbent_loss_pct}%` : "—"}
            hint="Seats where 2021 winner party lost"
          />
          <Kpi
            label="Multi-cornered races"
            value={races ? `${races.find((r) => r.race_type.includes("Multi"))?.count ?? 0}` : "—"}
            hint="Top-2 share below 70%"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard
          title="Effective Number of Parties by region"
          subtitle="Higher = more fragmented contest (Laakso–Taagepera)"
          heightPx={320}
        >
          {enp && enp.length > 0 && <EChart option={enpRegionOption(enp)} height="fill" />}
        </ChartCard>

        <ChartCard
          title="Pedersen volatility by region"
          subtitle="Net share churn between elections — 20+ = high in academic literature"
          heightPx={320}
        >
          {pedersen && pedersen.length > 0 && (
            <EChart
              option={{
                backgroundColor: "transparent",
                grid: { left: 90, right: 64, top: 16, bottom: 28, containLabel: false },
                xAxis: {
                  type: "value",
                  axisLabel: { color: "#8b9bb4", fontSize: 10 },
                  splitLine: { lineStyle: { color: "#1a2230" } },
                },
                yAxis: {
                  type: "category",
                  data: pedersen.map((p) => p.region),
                  axisLine: { lineStyle: { color: "#2a3548" } },
                  axisLabel: { color: "#e8edf5", fontSize: 11 },
                },
                tooltip: {
                  trigger: "axis",
                  axisPointer: { type: "shadow" },
                  backgroundColor: "#141a24",
                  borderColor: "#2a3548",
                  textStyle: { color: "#e8edf5", fontSize: 11 },
                  confine: true,
                },
                series: [
                  {
                    type: "bar",
                    barMaxWidth: 22,
                    data: pedersen.map((p) => ({
                      value: p.pedersen,
                      itemStyle: { color: "#E69F00", borderRadius: [0, 3, 3, 0] },
                    })),
                    label: {
                      show: true,
                      position: "right",
                      color: "#e8edf5",
                      fontSize: 10,
                      distance: 4,
                    },
                  },
                ],
              }}
              height="fill"
            />
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Party swing (pp) by region · 2021 → 2026"
        subtitle="Heatmap of vote-share change in percentage points. Green = gain, red = loss."
        heightPx={420}
      >
        {swing && swing.length > 0 && <EChart option={swingHeatmapOption(swing)} height="fill" />}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard
          title="Anti-incumbency by region"
          subtitle="Share of seats where the 2021 winning party did not win in 2026"
          heightPx={320}
        >
          {anti && anti.length > 0 && (
            <EChart option={antiIncumbencyOption(anti)} height="fill" />
          )}
        </ChartCard>

        <ChartCard
          title="Vote share vs seat share · 2026"
          subtitle="Gap indicates first-past-the-post amplification or under-representation"
          heightPx={320}
        >
          {gap?.["2026"] && gap["2026"].length > 0 && (
            <EChart option={representationGapOption(gap["2026"])} height="fill" />
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard
          title="Race competitiveness · 2026"
          subtitle="Bucketed by combined top-2 vote share"
          heightPx={300}
        >
          {races && races.length > 0 && <EChart option={raceTypeOption(races)} height="fill" />}
        </ChartCard>

        <Panel
          title="Districts with highest churn"
          subtitle="Share of ACs that changed winner (normalized party)"
          className="min-h-[300px]"
        >
          <div className="text-xs max-h-[260px] overflow-y-auto">
            <table className="w-full">
              <thead className="text-[var(--color-muted)] sticky top-0 bg-[var(--color-panel)]">
                <tr>
                  <th className="text-left py-1">District</th>
                  <th className="text-right">ACs</th>
                  <th className="text-right">Flips</th>
                  <th className="text-right">Flip %</th>
                </tr>
              </thead>
              <tbody>
                {districts?.slice(0, 20).map((d) => (
                  <tr key={d.district} className="border-t border-[var(--color-border)]/40">
                    <td className="py-1 pr-2">
                      {d.district}
                      {d.all_flipped && (
                        <span className="ml-1.5 text-[9px] uppercase tracking-wider text-[var(--color-accent)]">
                          full sweep
                        </span>
                      )}
                    </td>
                    <td className="text-right tabular-nums">{d.acs}</td>
                    <td className="text-right tabular-nums">{d.flips}</td>
                    <td className="text-right tabular-nums">{d.flip_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <section className="panel p-4 text-xs leading-relaxed text-[var(--color-muted)]">
        <h3 className="text-sm font-semibold text-white mb-2">What these indices mean</h3>
        <ul className="space-y-1.5 list-disc pl-4">
          <li>
            <span className="text-white">ENP (Laakso–Taagepera, 1979)</span> — effective number of parties weighted by
            vote share. 2 = pure bipolar; 4+ = highly fragmented multi-party system.
          </li>
          <li>
            <span className="text-white">Pedersen index (1979)</span> — half-sum of absolute change in party vote share.
            Values above 20 are considered very high in academic literature.
          </li>
          <li>
            <span className="text-white">Gallagher LSq (1991)</span> — disproportionality between votes and seats under
            first-past-the-post. Lower = closer match between votes cast and seats awarded.
          </li>
          <li>
            <span className="text-white">Anti-incumbency</span> — descriptive label for the share of seats where the
            party that held the seat in 2021 did not retain it in 2026. No causal claim.
          </li>
        </ul>
        <p className="mt-3 text-[10px]">
          Sources: ECI public results for TN 2021 &amp; 2026. Indices computed on normalized party labels (NOTA excluded).
        </p>
      </section>
    </DashboardShell>
  );
}

/**
 * Chart card with explicit pixel height — used on multi-panel scrolling pages.
 * Avoids the flex-1 collapse problem of ChartPanel in non-viewport layouts.
 */
function ChartCard({
  title,
  subtitle,
  heightPx,
  children,
}: {
  title: string;
  subtitle?: string;
  heightPx: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="panel flex flex-col min-w-0 overflow-hidden"
      style={{ height: heightPx }}
    >
      <header className="shrink-0 px-3 pt-2.5 pb-1.5 border-b border-[var(--color-border)]/40">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {subtitle && (
          <p className="text-[10px] text-[var(--color-muted)] mt-0.5 leading-snug">{subtitle}</p>
        )}
      </header>
      <div className="flex-1 min-h-0 px-3 py-2 overflow-hidden">{children}</div>
    </section>
  );
}

function Kpi({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="panel px-3 py-2">
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">{label}</span>
      <p
        className={`text-base font-semibold tabular-nums leading-tight ${
          accent ? "text-[var(--color-accent)]" : "text-white"
        }`}
      >
        {value}
      </p>
      {hint && <p className="text-[10px] text-[var(--color-muted)] mt-0.5">{hint}</p>}
    </div>
  );
}
