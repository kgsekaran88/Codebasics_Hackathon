/**
 * Safe ECharts grid / series margins — prevents axis and bar labels clipping at panel edges.
 * Bar labels with position: "right" render OUTSIDE the grid; reserve grid.right accordingly.
 */

export const grid = {
  /** Category x-axis, value bars upward */
  barVertical: { left: 12, right: 16, top: 24, bottom: 36, containLabel: true },
  /** Horizontal bars — party names on y-axis */
  barHorizontal: { left: 12, right: 20, top: 32, bottom: 24, containLabel: true },
  /** Horizontal bars + value labels to the right of bars */
  barHorizontalLabeled: { left: 12, right: 52, top: 32, bottom: 28, containLabel: true },
  /** Horizontal bars + long right labels (%, fractions) */
  barHorizontalLongRight: { left: 12, right: 112, top: 16, bottom: 32, containLabel: true },
  /** Stacked horizontal (regions) */
  stackHorizontal: { left: 12, right: 24, top: 44, bottom: 28, containLabel: true },
  /** Scatter / beeswarm with axis names */
  scatter: { left: 12, right: 20, top: 48, bottom: 44, containLabel: true },
  /** Vertical bars with value labels on top */
  barVerticalTopLabel: { left: 12, right: 16, top: 24, bottom: 40, containLabel: true },
} as const;

/** Sankey uses series box — not grid */
export const sankeyBox = { left: 72, right: 72, top: 20, bottom: 20 };
