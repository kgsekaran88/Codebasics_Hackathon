/**
 * Dashboard panel + chart layout primitives.
 * Rule: never put min-h-[240px] chart slots inside panels shorter than that (causes overlap).
 */

/** Panel body — flex column; clips overflow from mis-sized charts. */
export const panelBody =
  "flex flex-col min-h-0 overflow-hidden [&>div:last-child]:flex [&>div:last-child]:flex-col [&>div:last-child]:flex-1 [&>div:last-child]:min-h-0";

/** Flex panels — grow to fill ChartViewport (min height keeps ResizeObserver stable). */
export const panelHeightXl = "flex-1 min-h-0 h-full";
export const panelHeightLg = "flex-1 min-h-0 h-full";
export const panelHeightMd = "flex-1 min-h-0 h-full";

/** Single full-size ECharts slot inside a sized panel. */
export const chartArea = "flex flex-1 flex-col min-h-0 h-full w-full min-w-0 overflow-hidden";

/** Stacked / half-height charts — no minimum height beyond parent. */
export const chartAreaCompact = chartArea;

/** Mosaic / map — non-ECharts. */
export const chartAreaMosaic = "flex-1 min-h-0 w-full overflow-hidden";

/** Scrollable table inside a panel row. */
export const tableScroll = "flex-1 min-h-0 overflow-auto text-sm";

/** Page grids */
export const pageChartGrid = "grid grid-cols-1 gap-3 items-start w-full";

export const pageChartGrid2 =
  "grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0 h-full w-full items-stretch auto-rows-minmax(0,1fr)";

export const pageChartGridSplit =
  "grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_1fr] gap-3 flex-1 min-h-0 h-full w-full lg:items-stretch";

/** Two equal rows — right column on Overview / Geography / Margins */
export const chartStack =
  "grid grid-rows-2 gap-3 flex-1 min-h-0 h-full w-full min-w-0";

/** 2×2 chart grid — Depth */
export const pageChartGrid4 =
  "grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-3 flex-1 min-h-0 h-full w-full auto-rows-minmax(0,1fr)";

/** Vertical stack — Seat flows (Sankey larger, retention below) */
export const chartPageStackRows =
  "grid grid-rows-[minmax(0,1.35fr)_minmax(0,1fr)] gap-3 flex-1 min-h-0 h-full w-full min-w-0";

/** @deprecated use chartPageStackRows */
export const chartPageStack = chartPageStackRows;
