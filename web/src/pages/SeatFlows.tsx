import { useState } from "react";
import { api } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { usePageInsights } from "../hooks/usePageInsights";
import DashboardShell, { ChartViewport } from "../components/DashboardShell";
import ChartPanel from "../components/ChartPanel";
import InsightPanel from "../components/InsightPanel";
import StoryFocusBanner from "../components/StoryFocusBanner";
import EChart from "../components/EChart";
import { sankeyOption, retentionOption } from "../charts/options";
import { chartPageStackRows } from "../lib/panelLayout";

export default function SeatFlows() {
  const [full, setFull] = useState(false);
  const { bullets, chartTakeaway } = usePageInsights("flows");
  const { data: sankey } = useApi(() => api.sankey(full), [full]);
  const { data: retention } = useApi(() => api.partyRetention(), []);

  return (
    <DashboardShell
      title="Seat flows"
      subtitle="2021 winning parties mapped to 2026 winners — seat counts, not vote transfers."
      toolbar={
        <label className="flex items-center gap-2 text-xs text-[var(--color-muted)] cursor-pointer">
          <input
            type="checkbox"
            checked={full}
            onChange={(e) => setFull(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          All flows (default: top paths)
        </label>
      }
    >
      <StoryFocusBanner focus="flows" />
      {bullets.length > 0 && <InsightPanel bullets={bullets} />}

      <ChartViewport className={chartPageStackRows}>
        <ChartPanel
          title="Seat flow Sankey"
          subtitle="Band width = constituencies · hover for counts"
          height="fill"
          testId="sankey-chart"
          takeaway={chartTakeaway("sankey")}
        >
          {sankey && sankey.length > 0 && (
            <EChart option={sankeyOption(sankey)} height="fill" />
          )}
        </ChartPanel>

        <ChartPanel
          title="Incumbent retention"
          subtitle="Share of 2021 seats each party still held in 2026"
          height="fill"
          testId="retention-chart"
          takeaway={chartTakeaway("retention")}
        >
          {retention && <EChart option={retentionOption(retention)} height="fill" />}
        </ChartPanel>
      </ChartViewport>
    </DashboardShell>
  );
}
