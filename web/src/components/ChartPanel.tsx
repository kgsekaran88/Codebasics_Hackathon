import type { ReactNode } from "react";
import { Panel } from "./DashboardShell";
import ChartTakeaway from "./ChartTakeaway";
import {
  chartAreaCompact,
  panelBody,
  panelHeightLg,
  panelHeightMd,
  panelHeightXl,
} from "../lib/panelLayout";

type Height = "md" | "lg" | "xl" | "fill";

const heightClass: Record<Height, string> = {
  md: panelHeightMd,
  lg: panelHeightLg,
  xl: panelHeightXl,
  /** Parent grid/flex row sets height */
  fill: "min-h-0 h-full flex-1 overflow-hidden",
};

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: Height;
  testId?: string;
  nonChart?: boolean;
  takeaway?: string;
}

/** Standard chart panel: fixed height + compact chart slot (no overlap). */
export default function ChartPanel({
  title,
  subtitle,
  children,
  height = "md",
  testId,
  nonChart,
  takeaway,
}: Props) {
  return (
    <Panel
      title={title}
      subtitle={subtitle}
      className={`h-full ${heightClass[height]} ${panelBody}`}
    >
      {nonChart ? (
        children
      ) : (
        <div className={`${chartAreaCompact} flex flex-col`} data-testid={testId}>
          <div className="flex-1 min-h-0">{children}</div>
          {takeaway && <ChartTakeaway text={takeaway} />}
        </div>
      )}
    </Panel>
  );
}
