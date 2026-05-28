interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export default function KpiCard({ label, value, sub, accent }: Props) {
  return (
    <div
      className={`panel p-4 ${accent ? "panel-glow border-[var(--color-accent)]/30" : ""}`}
    >
      <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)]">{label}</p>
      <p
        className={`kpi-value text-3xl font-semibold mt-1 ${
          accent ? "text-[var(--color-accent)]" : "text-white"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-[var(--color-muted)] mt-1">{sub}</p>}
    </div>
  );
}
