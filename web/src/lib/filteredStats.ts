import type { AcRow } from "./api";

export function filteredSeatTally(rows: AcRow[]): { party: string; seats: number }[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const p = r.winner_party_norm_2026;
    counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([party, seats]) => ({ party, seats }))
    .sort((a, b) => b.seats - a.seats);
}

export function filteredSummary(rows: AcRow[]) {
  const flips = rows.filter((r) => r.flip_norm).length;
  const margins = rows.map((r) => r.margin_pct_2026).filter((m) => m != null) as number[];
  const avgMargin =
    margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;
  return { total: rows.length, flips, avgMargin };
}
