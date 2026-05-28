import { useState } from "react";
import { api } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { usePageInsights } from "../hooks/usePageInsights";
import { useYear } from "../context/YearContext";
import DashboardShell, { ChartViewport, Panel } from "../components/DashboardShell";
import ChartPanel from "../components/ChartPanel";
import InsightPanel from "../components/InsightPanel";
import EChart from "../components/EChart";
import DistrictMapChart from "../components/DistrictMapChart";
import PartyLegend from "../components/PartyLegend";
import YearToggle from "../components/YearToggle";
import { SupplementaryBanner } from "../components/StoryFocusBanner";
import type { DistrictMapMode } from "../charts/options";
import { regionalStackOption, flipBarOption, regionalVoteShareOption } from "../charts/options";
import {
  chartStack,
  pageChartGridSplit,
  panelBody,
  panelHeightLg,
} from "../lib/panelLayout";

export default function Geography() {
  const { year, setYear } = useYear();
  const [mapMode, setMapMode] = useState<DistrictMapMode>("party");
  const { bullets } = usePageInsights("geography", year);
  const { data: regional } = useApi(() => api.regionalSeats(), []);
  const { data: flips } = useApi(() => api.flipsByRegion(), []);
  const { data: voteRegion } = useApi(() => api.voteShareByRegion(), []);

  const regionalRows = regional?.[year] ?? [];
  const voteRows = voteRegion?.[year] ?? [];

  return (
    <DashboardShell
      title="Geography"
      subtitle="District map, regional seat split, and flip rates by macro-region."
      toolbar={
        <div className="flex flex-wrap items-center gap-3">
          <YearToggle value={year} onChange={setYear} />
          <div
            className="flex rounded-lg border border-[var(--color-border)] overflow-hidden text-xs"
            role="group"
            aria-label="Map coloring"
          >
            {(
              [
                ["party", "2026 winner"],
                ["flip", "Flip rate"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMapMode(id)}
                className={`px-3 py-1.5 transition-colors ${
                  mapMode === id
                    ? "bg-[var(--color-accent)] text-[#0c0f14] font-medium"
                    : "text-[var(--color-muted)] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <SupplementaryBanner topic="regional patterns" />

      {bullets.length > 0 && (
        <InsightPanel bullets={bullets} yearLabel={`Regional charts: ${year}`} />
      )}

      {year === "2021" && (
        <p
          className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 shrink-0"
          data-testid="map-year-note"
        >
          District map always shows 2026 winners (or flip rates). Regional seat chart below reflects{" "}
          <strong>2021</strong>.
        </p>
      )}

      <ChartViewport className="grid grid-rows-[minmax(0,1.55fr)_minmax(0,1fr)] gap-3">
      <div className={pageChartGridSplit}>
        <Panel
          title="Tamil Nadu — district map"
          subtitle={
            mapMode === "party"
              ? "Each district colored by 2026 winning party · pinch/scroll to zoom"
              : "Darker = more seats flipped 2021→2026"
          }
          className={`${panelHeightLg} ${panelBody}`}
        >
          <div className="flex-1 min-h-0 relative w-full" data-testid="district-map">
            <DistrictMapChart mode={mapMode} />
          </div>
          {mapMode === "party" ? (
            <div className="shrink-0 pt-2 border-t border-[var(--color-border)]/40 mt-1">
              <PartyLegend />
            </div>
          ) : (
            <p className="shrink-0 text-[10px] text-[var(--color-muted)] pt-1">
              Gradient = % of ACs with changed winner in district
            </p>
          )}
        </Panel>

        <div className={chartStack}>
          <ChartPanel
            title={`Seats by macro-region — ${year}`}
            subtitle="Party seat count per region · totals above each bar · click legend to hide parties"
            height="fill"
            testId="regional-seats-chart"
          >
            {regionalRows.length > 0 && (
              <EChart option={regionalStackOption(regionalRows)} height="fill" />
            )}
          </ChartPanel>

          <ChartPanel
            title="Flip rate by macro-region"
            subtitle="% of constituencies with a different winner vs 2021"
            height="fill"
            testId="regional-flip-chart"
          >
            {flips && <EChart option={flipBarOption(flips, "region")} height="fill" />}
          </ChartPanel>
        </div>
      </div>

        <ChartPanel
          title={`Vote share by region — ${year}`}
          subtitle="Stacked party vote share within each macro-region (Q3 by-region)"
          height="fill"
          testId="regional-vote-share-chart"
        >
          {voteRows.length > 0 && (
            <EChart option={regionalVoteShareOption(voteRows, year)} height="fill" />
          )}
        </ChartPanel>
      </ChartViewport>
    </DashboardShell>
  );
}
