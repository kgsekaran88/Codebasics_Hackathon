import { api } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { usePageInsights } from "../hooks/usePageInsights";
import DashboardShell, { ChartViewport, Panel } from "../components/DashboardShell";
import ChartPanel from "../components/ChartPanel";
import InsightPanel from "../components/InsightPanel";
import { SupplementaryBanner } from "../components/StoryFocusBanner";
import EChart from "../components/EChart";
import { flipBarOption } from "../charts/options";
import { partyColor } from "../lib/colors";
import { pageChartGrid2, panelBody, panelHeightMd, tableScroll } from "../lib/panelLayout";

const CATEGORIES = ["GEN", "SC", "ST"] as const;

export default function Reserved() {
  const { bullets } = usePageInsights("reserved");
  const { data: flips } = useApi(() => api.flipsByReserved(), []);
  const { data: full } = useApi(() => api.reservedBreakdownFull(), []);
  const { data: marginSummary } = useApi(() => api.reservedMarginSummary(), []);

  const rows2021 = full?.["2021"] ?? [];
  const rows2026 = full?.["2026"] ?? [];
  const parties = Array.from(
    new Set([...rows2021, ...rows2026].map((r) => r.party))
  ).sort();

  function seatsFor(year: typeof rows2021, party: string, cat: string): number | null {
    const row = year.find((r) => r.party === party && r.reserved === cat);
    return row ? row.seats : null;
  }

  return (
    <DashboardShell
      title="Reserved seats"
      subtitle="GEN / SC / ST outcomes — 2021 vs 2026 (Q4)."
    >
      <SupplementaryBanner topic="reserved constituencies" />
      {bullets.length > 0 && <InsightPanel bullets={bullets} />}

      <ChartViewport className="grid grid-rows-[minmax(0,0.85fr)_minmax(0,1fr)] gap-3">
        <div className={pageChartGrid2}>
          <ChartPanel
            title="Flip rate by reserved category"
            subtitle="% of ACs with changed normalized winner (2021→2026)"
            height="fill"
            testId="reserved-flip-chart"
          >
            {flips && <EChart option={flipBarOption(flips, "reserved")} height="fill" />}
          </ChartPanel>

          <Panel
            title="Margin & fragmentation by category"
            subtitle="Average winning margin and plurality wins"
            className={`${panelHeightMd} ${panelBody}`}
          >
            <div className={tableScroll}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--color-panel)] text-[var(--color-muted)] text-xs">
                  <tr>
                    <th className="text-left p-2">Category</th>
                    <th className="text-right p-2">ACs</th>
                    <th className="text-right p-2">Avg margin 2021</th>
                    <th className="text-right p-2">Avg margin 2026</th>
                    <th className="text-right p-2">Flip %</th>
                    <th className="text-right p-2">&lt;35% (2026)</th>
                  </tr>
                </thead>
                <tbody>
                  {marginSummary?.map((row) => (
                    <tr key={row.reserved} className="border-t border-[var(--color-border)]/40">
                      <td className="p-2 font-medium">{row.reserved}</td>
                      <td className="p-2 text-right tabular-nums">{row.acs}</td>
                      <td className="p-2 text-right tabular-nums">{row.avg_margin_2021}%</td>
                      <td className="p-2 text-right tabular-nums">{row.avg_margin_2026}%</td>
                      <td className="p-2 text-right tabular-nums">{row.flip_pct}%</td>
                      <td className="p-2 text-right tabular-nums">{row.under_35_2026}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel
          title="Seats by party × reserved — 2021 vs 2026"
          subtitle="Each row shows 2021 → 2026 seat counts per category"
          className={`${panelHeightMd} ${panelBody}`}
        >
          <div className={tableScroll}>
            <table className="w-full text-sm" data-testid="reserved-comparison-table">
              <thead className="sticky top-0 bg-[var(--color-panel)] text-[var(--color-muted)] text-xs">
                <tr>
                  <th rowSpan={2} className="text-left p-2 align-bottom">Party</th>
                  {CATEGORIES.map((cat) => (
                    <th
                      key={cat}
                      colSpan={2}
                      className="text-center p-2 border-b border-[var(--color-border)]/40"
                    >
                      {cat}
                    </th>
                  ))}
                </tr>
                <tr>
                  {CATEGORIES.flatMap((cat) => [
                    <th key={`${cat}-21`} className="text-right p-1 text-[10px]">
                      2021
                    </th>,
                    <th key={`${cat}-26`} className="text-right p-1 text-[10px]">
                      2026
                    </th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {parties.map((party) => (
                  <tr key={party} className="border-t border-[var(--color-border)]/40">
                    <td className="p-2 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: partyColor(party) }}
                      />
                      {party}
                    </td>
                    {CATEGORIES.flatMap((cat) => {
                      const a = seatsFor(rows2021, party, cat);
                      const b = seatsFor(rows2026, party, cat);
                      return [
                        <td key={`${cat}-21`} className="text-right p-1 tabular-nums text-[var(--color-muted)]">
                          {a ?? "—"}
                        </td>,
                        <td key={`${cat}-26`} className="text-right p-1 tabular-nums">
                          {b ?? "—"}
                        </td>,
                      ];
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </ChartViewport>
    </DashboardShell>
  );
}
