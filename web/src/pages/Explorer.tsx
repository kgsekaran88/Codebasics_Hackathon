import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type AcRow, type FilterMeta } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { usePageInsights } from "../hooks/usePageInsights";
import DashboardShell, { ChartViewport, Panel } from "../components/DashboardShell";
import ChartPanel from "../components/ChartPanel";
import InsightPanel from "../components/InsightPanel";
import FilterBar, { type FilterState } from "../components/FilterBar";
import AcDetailCard from "../components/AcDetailCard";
import EChart from "../components/EChart";
import { marginBeeswarmOption, seatTallyOption } from "../charts/options";
import { filteredSeatTally, filteredSummary } from "../lib/filteredStats";
import { pageChartGrid2, panelBody, tableScroll } from "../lib/panelLayout";

const defaultFilters: FilterState = {
  regions: [],
  reserved: [],
  parties: [],
  flipOnly: false,
  maxMargin: 100,
};

function buildParams(state: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  state.regions.forEach((r) => p.append("region", r));
  state.reserved.forEach((r) => p.append("reserved", r));
  state.parties.forEach((x) => p.append("party_2026", x));
  if (state.flipOnly) p.set("flip_only", "true");
  p.set("max_margin", String(state.maxMargin));
  return p;
}

export default function Explorer() {
  const { bullets } = usePageInsights("explorer");
  const { data: meta } = useApi(() => api.filterMeta(), []);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selected, setSelected] = useState<AcRow | null>(null);

  const paramsKey = useMemo(() => buildParams(filters).toString(), [filters]);
  const fetchRows = useCallback(() => api.comparison(buildParams(filters)), [paramsKey]);
  const { data: rows, loading } = useApi(fetchRows, [paramsKey]);

  useEffect(() => {
    setSelected(null);
  }, [paramsKey]);

  const tally = useMemo(() => (rows ? filteredSeatTally(rows) : []), [rows]);
  const summary = useMemo(() => (rows ? filteredSummary(rows) : null), [rows]);

  const scatterRows = useMemo(
    () =>
      rows?.map((r) => ({
        margin_pct_2021: r.margin_pct_2021,
        margin_pct_2026: r.margin_pct_2026,
        region: r.region,
        ac_number: r.ac_number,
        ac_name: r.ac_name,
      })) ?? [],
    [rows]
  );

  const handleScatterClick = useCallback(
    (params: unknown) => {
      const p = params as { data?: { ac_number?: number } };
      const acNum = p.data?.ac_number;
      if (acNum == null || !rows) return;
      const row = rows.find((r) => r.ac_number === acNum);
      if (row) setSelected(row);
    },
    [rows]
  );

  if (!meta) {
    return (
      <DashboardShell title="Constituency explorer" subtitle="Loading filters…">
        <p className="text-[var(--color-muted)]">Loading filters…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Constituency explorer"
      subtitle="Filter constituencies and inspect matching charts and the full AC list."
    >
      <p className="text-xs text-[var(--color-muted)] shrink-0 leading-relaxed">
        Drill-down for follow-up questions during production. Filters apply to charts and the table
        together.
      </p>
      {bullets.length > 0 && <InsightPanel bullets={bullets} />}

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 w-full min-w-0">
        <FilterBar meta={meta as FilterMeta} state={filters} onChange={setFilters} />

        <div className="flex-1 flex flex-col gap-4 min-h-0 min-w-0 w-full">
          {summary && (
            <div className="grid grid-cols-3 gap-2 text-center shrink-0">
              <div className="panel px-3 py-2">
                <p className="text-[10px] uppercase text-[var(--color-muted)]">Matching ACs</p>
                <p className="text-xl font-semibold tabular-nums">{summary.total}</p>
              </div>
              <div className="panel px-3 py-2">
                <p className="text-[10px] uppercase text-[var(--color-muted)]">Flips in set</p>
                <p className="text-xl font-semibold tabular-nums">{summary.flips}</p>
              </div>
              <div className="panel px-3 py-2">
                <p className="text-[10px] uppercase text-[var(--color-muted)]">Avg margin 2026</p>
                <p className="text-xl font-semibold tabular-nums">{summary.avgMargin.toFixed(1)}%</p>
              </div>
            </div>
          )}

          <ChartViewport className={pageChartGrid2}>
            <ChartPanel
              title="Filtered seat tally"
              subtitle="2026 winners in current filter · hover bars for counts"
              height="fill"
              testId="explorer-tally-chart"
            >
              {loading ? (
                <p className="text-[var(--color-muted)] text-sm">Loading…</p>
              ) : tally.length > 0 ? (
                <EChart option={seatTallyOption(tally, "Filtered")} height="fill" />
              ) : (
                <p className="text-[var(--color-muted)] text-sm">No constituencies match filters.</p>
              )}
            </ChartPanel>

            <ChartPanel
              title="Margin shift (filtered)"
              subtitle="Each dot = one AC · scroll/zoom · click dot or table row for detail"
              height="fill"
              testId="explorer-scatter-chart"
            >
              {loading ? (
                <p className="text-[var(--color-muted)] text-sm">Loading…</p>
              ) : scatterRows.length > 0 ? (
                <EChart
                  option={marginBeeswarmOption(scatterRows)}
                  height="fill"
                  onEvents={{ click: handleScatterClick }}
                />
              ) : (
                <p className="text-[var(--color-muted)] text-sm">No constituencies match filters.</p>
              )}
            </ChartPanel>
          </ChartViewport>

          {selected && <AcDetailCard ac={selected} />}

          <Panel
            title="All constituencies"
            subtitle="Click a row for detail"
            className={`flex-1 min-h-[200px] min-h-0 ${panelBody}`}
          >
            <div className={tableScroll} data-testid="explorer-table">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--color-panel)] text-[var(--color-muted)]">
                  <tr>
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">AC</th>
                    <th className="text-left p-2">2021</th>
                    <th className="text-left p-2">2026</th>
                    <th className="text-right p-2">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {rows?.map((r) => (
                    <tr
                      key={r.ac_number}
                      className={`border-t border-[var(--color-border)]/50 hover:bg-[var(--color-panel-hover)] cursor-pointer ${
                        selected?.ac_number === r.ac_number ? "bg-[var(--color-panel-hover)]" : ""
                      }`}
                      onClick={() => setSelected(r)}
                    >
                      <td className="p-2">{r.ac_number}</td>
                      <td className="p-2">{r.ac_name}</td>
                      <td className="p-2">{r.winner_party_norm_2021}</td>
                      <td className="p-2">{r.winner_party_norm_2026}</td>
                      <td className="p-2 text-right tabular-nums">{r.margin_pct_2026?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
