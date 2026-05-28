/** Shared helpers — richer tooltips and reference lines without cluttering charts. */

export const AC_TOTAL = 234;
export const MAJORITY_SEATS = 118;

export function pctOfAssembly(n: number, total = AC_TOTAL): string {
  return `${((n / total) * 100).toFixed(1)}% of ${total}`;
}

export function avgMarkLineX(value: number, label: string) {
  return {
    silent: true,
    symbol: "none" as const,
    lineStyle: { color: "#e8b84a", type: "dashed" as const, width: 1, opacity: 0.65 },
    label: {
      formatter: label,
      color: "#e8b84a",
      fontSize: 9,
      position: "end" as const,
    },
    data: [{ xAxis: Math.round(value * 10) / 10 }],
  };
}

export function avgMarkLineY(value: number, label: string) {
  return {
    silent: true,
    symbol: "none" as const,
    lineStyle: { color: "#e8b84a", type: "dashed" as const, width: 1, opacity: 0.65 },
    label: {
      formatter: label,
      color: "#e8b84a",
      fontSize: 9,
      position: "end" as const,
    },
    data: [{ yAxis: Math.round(value * 10) / 10 }],
  };
}

/** Mean reference lines for margin scatter (one series only). */
export function marginAvgMarkLines(avg2021: number, avg2026: number) {
  const x = Math.round(avg2021 * 10) / 10;
  const y = Math.round(avg2026 * 10) / 10;
  const lineStyle = { color: "#e8b84a", type: "dashed" as const, width: 1, opacity: 0.65 };
  const labelStyle = { color: "#e8b84a", fontSize: 9 };
  return {
    silent: true,
    symbol: "none" as const,
    lineStyle,
    data: [
      {
        xAxis: x,
        label: { formatter: `Avg 2021 (${x}%)`, ...labelStyle, position: "end" as const },
      },
      {
        yAxis: y,
        label: { formatter: `Avg 2026 (${y}%)`, ...labelStyle, position: "end" as const },
      },
    ],
  };
}

export function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
