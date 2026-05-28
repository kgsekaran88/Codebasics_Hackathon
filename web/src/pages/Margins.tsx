import { useMemo, useState } from "react";
import { api } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { usePageInsights } from "../hooks/usePageInsights";
import DashboardShell, { ChartViewport, Panel } from "../components/DashboardShell";
import FixedChartPanel from "../components/FixedChartPanel";
import BubbleScatterControls from "../components/BubbleScatterControls";
import InsightPanel from "../components/InsightPanel";
import StoryFocusBanner from "../components/StoryFocusBanner";
import EChart from "../components/EChart";
import {
  marginBeeswarmOption,
  bucketOption,
  type MarginBubbleSizeMode,
} from "../charts/options";
import ChartTakeaway from "../components/ChartTakeaway";
import { panelBody, tableScroll } from "../lib/panelLayout";

const H = {
  scatter: 440,
  buckets: 300,
  table: 300,
} as const;

const SCATTER_SUBTITLE: Record<MarginBubbleSizeMode, string> = {
  margin_shift:
    "Bubble area ∝ |margin change| (2026−2021 pp) · larger = bigger shift in competitiveness",
  fragmentation:
    "Bubble area ∝ fragmentation (100% − winner vote share) · larger = more fragmented win",
  ballot_size:
    "Bubble area ∝ candidates on 2026 ballot · larger = more crowded race",
  fixed: "Fixed bubble size · dashed line = no change in margin",
};

export default function Margins() {
  const [sizeMode, setSizeMode] = useState<MarginBubbleSizeMode>("margin_shift");
  const [fixedSize, setFixedSize] = useState(14);
  const [scaleMax, setScaleMax] = useState(24);
  const { bullets, chartTakeaway } = usePageInsights("margins");
  const { data: comparison } = useApi(() => api.comparison(new URLSearchParams()), []);
  const { data: buckets } = useApi(() => api.winnerBuckets(), []);
  const { data: closest } = useApi(() => api.closestRaces(), []);

  const scatterRows = useMemo(
    () =>
      comparison?.map((r) => ({
        margin_pct_2021: r.margin_pct_2021,
        margin_pct_2026: r.margin_pct_2026,
        margin_delta: r.margin_delta,
        winner_share_pct_2026: r.winner_share_pct_2026,
        n_candidates_2026: r.n_candidates_2026,
        region: r.region,
        ac_number: r.ac_number,
        ac_name: r.ac_name,
      })) ?? [],
    [comparison]
  );

  const scatterOption = useMemo(
    () =>
      marginBeeswarmOption(scatterRows, {
        sizeMode,
        sizeRange: [6, scaleMax],
        symbolSize: fixedSize,
      }),
    [scatterRows, sizeMode, scaleMax, fixedSize]
  );

  return (
    <DashboardShell
      title="Margins & fragmentation"
      subtitle="How tight races were in 2026 compared with 2021."
    >
      <StoryFocusBanner focus="margins" />
      {bullets.length > 0 && <InsightPanel bullets={bullets} />}

      <ChartViewport className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 pb-2">
        <FixedChartPanel
          title="2021 vs 2026 margin"
          subtitle={`Each dot = one AC · ${SCATTER_SUBTITLE[sizeMode]} · pan/zoom enabled`}
          heightPx={H.scatter}
          testId="margin-scatter-chart"
          takeaway={chartTakeaway("scatter")}
          toolbar={
            <BubbleScatterControls
              sizeMode={sizeMode}
              onSizeModeChange={setSizeMode}
              fixedSize={fixedSize}
              onFixedSizeChange={setFixedSize}
              scaleMax={scaleMax}
              onScaleMaxChange={setScaleMax}
            />
          }
        >
          {scatterRows.length > 0 && <EChart option={scatterOption} height="fill" />}
        </FixedChartPanel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
          <FixedChartPanel
            title="Winner vote share buckets"
            subtitle="2026 — share of valid votes for the winner"
            heightPx={H.buckets}
            takeaway={chartTakeaway("buckets")}
          >
            {buckets && <EChart option={bucketOption(buckets)} height="fill" />}
          </FixedChartPanel>

          <Panel
            title="Closest races"
            subtitle="Lowest 2026 margins"
            className={`${panelBody} overflow-hidden`}
            style={{ height: H.table }}
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
            {chartTakeaway("closest") && (
              <ChartTakeaway text={chartTakeaway("closest")} />
            )}
          </Panel>
        </div>
      </ChartViewport>
    </DashboardShell>
  );
}
