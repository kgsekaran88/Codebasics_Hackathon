interface Props {
  title?: string;
  bullets: string[];
  note?: string;
  yearLabel?: string;
}

export default function InsightPanel({
  title = "Key insights",
  bullets,
  note,
  yearLabel,
}: Props) {
  return (
    <aside
      className="panel px-4 py-3 shrink-0 border-l-2 border-[var(--color-accent)]/50"
      data-testid="insight-panel"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          {title}
        </h2>
        {yearLabel && (
          <span className="text-[10px] text-[var(--color-muted)] tabular-nums">{yearLabel}</span>
        )}
      </div>
      <ul className="mt-2 space-y-1.5 text-sm text-[var(--color-muted)] leading-relaxed list-disc pl-4">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      {note && (
        <p className="mt-2 text-[10px] text-[var(--color-muted)]/80 leading-snug border-t border-[var(--color-border)]/40 pt-2">
          {note}
        </p>
      )}
    </aside>
  );
}
