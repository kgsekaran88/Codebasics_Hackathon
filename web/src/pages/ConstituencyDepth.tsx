import { api } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { usePageInsights } from "../hooks/usePageInsights";
import DashboardShell, { ChartViewport } from "../components/DashboardShell";
import ChartPanel from "../components/ChartPanel";
import InsightPanel from "../components/InsightPanel";
import { SupplementaryBanner, TurnoutDataNote } from "../components/StoryFocusBanner";
import EChart from "../components/EChart";
import { pageChartGrid4 } from "../lib/panelLayout";
import {
  turnoutByRegionOption,
  turnoutMarginOption,
  candidateBucketOption,
  notaBarOption,
  turnoutDeltaOption,
} from "../charts/options";

export default function ConstituencyDepth() {
  const { bullets, dataScope, chartTakeaway } = usePageInsights("depth");
  const { data: turnout } = useApi(() => api.turnoutByRegion(), []);
  const { data: buckets } = useApi(() => api.candidateBuckets(), []);
  const { data: nota } = useApi(() => api.notaAll(), []);
  const { data: comparison } = useApi(() => api.comparison(new URLSearchParams()), []);
  const { data: turnoutTop } = useApi(() => api.turnoutTopChanges(), []);

  const turnoutScatter =
    comparison
      ?.filter((r) => r.turnout_pct_2021 != null)
      .map((r) => ({
        turnout_pct_2021: r.turnout_pct_2021 as number,
        margin_pct_2026: r.margin_pct_2026,
        region: r.region,
      })) ?? [];

  return (
    <DashboardShell
      title="Ballots & turnout"
      subtitle="Turnout (2021), ballot size, and NOTA — constituency-level fields in the ECI files."
    >
      <TurnoutDataNote />
      <SupplementaryBanner topic="turnout and ballot detail" />
      {bullets.length > 0 && (
        <InsightPanel bullets={bullets} note={dataScope?.note} />
      )}

      <ChartViewport className={pageChartGrid4}>
        <ChartPanel
          title={
            turnoutTop?.has_2026_turnout
              ? "Top 20 turnout increases (2021 → 2026)"
              : "Average turnout by macro-region"
          }
          subtitle={
            turnoutTop?.has_2026_turnout
              ? "ACs with largest 2026 turnout gain vs 2021 (Q5)"
              : "2021 constituency-level turnout · 2026 field blank in starter CSV"
          }
          height="fill"
          testId="turnout-headline-chart"
          takeaway={
            turnoutTop?.has_2026_turnout
              ? chartTakeaway("turnout_delta")
              : chartTakeaway("turnout_region")
          }
        >
          {turnoutTop?.has_2026_turnout && turnoutTop.rows.length > 0 ? (
            <EChart option={turnoutDeltaOption(turnoutTop.rows)} height="fill" />
          ) : (
            turnout && <EChart option={turnoutByRegionOption(turnout)} height="fill" />
          )}
        </ChartPanel>

        <ChartPanel
          title="Turnout vs 2026 margin"
          subtitle="Each dot = one AC · scroll/pinch to zoom · legend by macro-region"
          height="fill"
          testId="turnout-margin-chart"
          takeaway={chartTakeaway("turnout_margin")}
        >
          {turnoutScatter.length > 0 && (
            <EChart option={turnoutMarginOption(turnoutScatter)} height="fill" />
          )}
        </ChartPanel>

        <ChartPanel
          title="Candidates on the 2026 ballot"
          subtitle="How many names appeared per constituency (not booth-level)"
          height="fill"
          testId="candidate-buckets-chart"
          takeaway={chartTakeaway("candidates")}
        >
          {buckets && <EChart option={candidateBucketOption(buckets)} height="fill" />}
        </ChartPanel>

        <ChartPanel
          title="Highest NOTA share (2026)"
          subtitle="NOTA votes as % of valid votes · top 12 constituencies"
          height="fill"
          testId="nota-chart"
          takeaway={chartTakeaway("nota")}
        >
          {nota && <EChart option={notaBarOption(nota)} height="fill" />}
        </ChartPanel>
      </ChartViewport>

      {!turnoutTop?.has_2026_turnout && (
        <p
          className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 shrink-0"
          data-testid="turnout-source-hint"
        >
          State record 2026 turnout: <strong>{turnoutTop?.state_record_2026_pct ?? 85.1}%</strong> (ECI).
          Per-AC values not yet sourced — fill <code>data/external/turnout_2026.csv</code> and
          rebuild to enable the Top-20 turnout-increase chart.
        </p>
      )}
    </DashboardShell>
  );
}
