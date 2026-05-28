import { api } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { usePageInsights } from "../hooks/usePageInsights";
import DashboardShell, { ChartViewport, Panel } from "../components/DashboardShell";
import ChartPanel from "../components/ChartPanel";
import InsightPanel from "../components/InsightPanel";
import StoryFocusBanner from "../components/StoryFocusBanner";
import EChart from "../components/EChart";
import { marginBeeswarmOption, bucketOption } from "../charts/options";
import {
  chartArea,
  chartStack,
  pageChartGridSplit,
  panelBody,
  panelHeightLg,
  tableScroll,
} from "../lib/panelLayout";

export default function Margins() {
  const { bullets } = usePageInsights("margins");
  const { data: comparison } = useApi(() => api.comparison(new URLSearchParams()), []);
  const { data: buckets } = useApi(() => api.winnerBuckets(), []);
  const { data: closest } = useApi(() => api.closestRaces(), []);

  return (
    <DashboardShell
      title="Margins & fragmentation"
      subtitle="How tight races were in 2026 compared with 2021."
    >
      <StoryFocusBanner focus="margins" />
      {bullets.length > 0 && <InsightPanel bullets={bullets} />}

      <ChartViewport className={pageChartGridSplit}>
        <Panel
          title="2021 vs 2026 margin"
          subtitle="Each dot = one AC · hover · scroll/zoom"
          className={`${panelHeightLg} ${panelBody}`}
        >
          <div className={chartArea} data-testid="margin-scatter-chart">
            {comparison && (
              <EChart
                option={marginBeeswarmOption(
                  comparison.map((r) => ({
                    margin_pct_2021: r.margin_pct_2021,
                    margin_pct_2026: r.margin_pct_2026,
                    region: r.region,
                    ac_number: r.ac_number,
                    ac_name: r.ac_name,
                  }))
                )}
                height="fill"
              />
            )}
          </div>
        </Panel>

        <div className={chartStack}>
          <ChartPanel title="Winner vote share buckets" subtitle="2026" height="fill">
            {buckets && <EChart option={bucketOption(buckets)} height="fill" />}
          </ChartPanel>
          <Panel
            title="Closest races"
            subtitle="Lowest 2026 margins"
            className={`flex-1 min-h-0 h-full ${panelBody}`}
          >
            <div className={tableScroll}>
              <table className="w-full">
                <thead className="sticky top-0 bg-[var(--color-panel)] text-[var(--color-muted)] text-xs">
                  <tr>
                    <th className="text-left p-2">AC</th>
                    <th className="text-left p-2">Winner</th>
                    <th className="text-right p-2">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {closest?.slice(0, 14).map((r) => (
                    <tr key={r.ac_number} className="border-t border-[var(--color-border)]/40">
                      <td className="p-2">{r.ac_name}</td>
                      <td className="p-2">{r.winner_party_norm_2026}</td>
                      <td className="p-2 text-right tabular-nums">{r.margin_pct_2026?.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </ChartViewport>
    </DashboardShell>
  );
}
