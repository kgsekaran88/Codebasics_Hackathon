/** One-line chart insight — sits below the plot, keeps the chart area clean. */
export default function ChartTakeaway({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p
      className="shrink-0 text-[10px] leading-snug text-[var(--color-muted)] border-t border-[var(--color-border)]/40 pt-2 mt-1"
      data-testid="chart-takeaway"
    >
      <span className="text-[var(--color-accent)] font-medium">Insight · </span>
      {text}
    </p>
  );
}
