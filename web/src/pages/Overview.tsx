import { useMemo, useState } from "react";
import { api, type AcRow } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { usePageInsights } from "../hooks/usePageInsights";
import { useYear } from "../context/YearContext";
import DashboardShell, { ChartViewport, Panel } from "../components/DashboardShell";
import ChartPanel from "../components/ChartPanel";
import InsightPanel from "../components/InsightPanel";
import MosaicGrid from "../components/MosaicGrid";
import AcDetailCard from "../components/AcDetailCard";
import PartyLegend from "../components/PartyLegend";
import EChart from "../components/EChart";
import YearToggle from "../components/YearToggle";
import StoryFocusBanner from "../components/StoryFocusBanner";
import RegionChips from "../components/RegionChips";
import ChartTakeaway from "../components/ChartTakeaway";
import { seatTallyOption, voteShareBarOption } from "../charts/options";
import {
  chartAreaMosaic,
  chartStack,
  pageChartGridSplit,
  panelBody,
  panelHeightLg,
} from "../lib/panelLayout";

export default function Overview() {
  const { year, setYear } = useYear();
  const [regions, setRegions] = useState<string[]>([]);
  const [selected, setSelected] = useState<AcRow | null>(null);
  const { bullets, chartTakeaway } = usePageInsights("overview", year);

  const { data: kpis, error: ek } = useApi(() => api.kpis(year), [year]);
  const { data: tally } = useApi(() => api.seatTally(), []);
  const { data: vote } = useApi(() => api.voteShare(), []);
  const { data: meta } = useApi(() => api.filterMeta(), []);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    regions.forEach((r) => p.append("region", r));
    return p;
  }, [regions]);

  const { data: comparison } = useApi(() => api.comparison(params), [params.toString()]);

  if (ek) {
    return (
      <div className="panel p-6 text-center text-sm">
        <p className="text-red-400" data-testid="api-error">
          API offline — run: uvicorn api.main:app --reload --port 8000
        </p>
      </div>
    );
  }

  const tallyRows = tally?.[year] ?? [];
  const voteRows = vote?.[year] ?? [];

  return (
    <DashboardShell
      title="Statewide totals"
      subtitle="Seat tally, vote share, and constituency mosaic — 2021 vs 2026."
      toolbar={
        <div className="flex flex-wrap items-center gap-4">
          <YearToggle value={year} onChange={setYear} />
          {meta && (
            <RegionChips regions={meta.regions} selected={regions} onChange={setRegions} />
          )}
        </div>
      }
    >
      <StoryFocusBanner focus="overview" />

      {bullets.length > 0 && (
        <InsightPanel bullets={bullets} yearLabel={`Year: ${year}`} />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 shrink-0" data-testid="kpi-strip">
        {kpis && <OverviewKpis kpis={kpis} year={year} />}
      </div>

      <ChartViewport className={pageChartGridSplit}>
        <Panel
          title={`Mosaic — ${comparison?.length ?? 0} constituencies`}
          subtitle={`Equal-weight tiles · ${year} winners · click for AC detail`}
          className={`${panelHeightLg} ${panelBody}`}
        >
          <PartyLegend />
          <div className={`${chartAreaMosaic} mt-1 flex flex-col min-h-0`}>
            <div className="flex-1 min-h-0">
              {comparison && (
                <MosaicGrid rows={comparison} year={year} onSelect={setSelected} />
              )}
            </div>
            {chartTakeaway("mosaic") && (
              <ChartTakeaway text={chartTakeaway("mosaic")} />
            )}
          </div>
          {selected && (
            <div className="shrink-0 mt-2 max-h-[130px] overflow-auto">
              <AcDetailCard ac={selected} />
            </div>
          )}
        </Panel>

        <div className={chartStack}>
          <ChartPanel
            title="Seat tally"
            subtitle="Assembly seats by party"
            height="fill"
            testId="seat-tally-chart"
            takeaway={chartTakeaway("seat_tally")}
          >
            {tallyRows.length > 0 && (
              <EChart option={seatTallyOption(tallyRows, year)} height="fill" />
            )}
          </ChartPanel>
          <ChartPanel
            title="Vote share"
            subtitle="Statewide valid votes (horizontal bars)"
            height="fill"
            testId="vote-share-chart"
            takeaway={chartTakeaway("vote_share")}
          >
            {voteRows.length > 0 && (
              <EChart option={voteShareBarOption(voteRows, year)} height="fill" />
            )}
          </ChartPanel>
        </div>
      </ChartViewport>
    </DashboardShell>
  );
}

function OverviewKpis({
  kpis,
  year,
}: {
  kpis: NonNullable<Awaited<ReturnType<typeof api.kpis>>>;
  year: "2021" | "2026";
}) {
  if (year === "2021") {
    return (
      <>
        <KpiCompact
          label={`${kpis.leading_party} seats`}
          value={String(kpis.leading_party_seats)}
          hint="/ 234"
          accent
          testId="kpi-leading-seats"
          valueTestId="kpi-leading-seats-value"
        />
        <KpiCompact
          label="Runner-up"
          value={`${kpis.second_party ?? "—"} ${kpis.second_party_seats ?? 0}`}
          hint="seats"
        />
        <KpiCompact label="Avg margin" value={`${kpis.avg_margin}%`} hint={year} />
        <KpiCompact
          label="Under 35% share"
          value={String(kpis.under_35_share)}
          hint="plurality wins"
        />
      </>
    );
  }
  return (
    <>
      <KpiCompact
        label="TVK seats"
        value={String(kpis.tvk_seats ?? 0)}
        hint="/ 234"
        accent
      />
      <KpiCompact
        label="Flips"
        value={String(kpis.flips ?? 0)}
        hint={`${kpis.flip_pct ?? 0}%`}
      />
      <KpiCompact
        label="Avg margin"
        value={`${kpis.avg_margin}%`}
        hint={
          kpis.avg_margin_2021 != null
            ? `2021: ${kpis.avg_margin_2021}%`
            : undefined
        }
      />
      <KpiCompact
        label="Under 35% share"
        value={String(kpis.under_35_share)}
        hint="plurality wins"
        testId="kpi-under-35"
      />
    </>
  );
}

function KpiCompact({
  label,
  value,
  hint,
  accent,
  testId,
  valueTestId,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  testId?: string;
  valueTestId?: string;
}) {
  return (
    <div className="panel px-3 py-2" data-testid={testId}>
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">{label}</span>
      <p
        data-testid={valueTestId}
        className={`text-xl font-semibold tabular-nums leading-tight ${
          accent ? "text-[var(--color-accent)]" : "text-white"
        }`}
      >
        {value}
      </p>
      {hint && <p className="text-[10px] text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}
