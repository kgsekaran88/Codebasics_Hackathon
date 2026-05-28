import { REGION_COLORS } from "../lib/colors";

interface Props {
  regions: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function RegionChips({ regions, selected, onChange }: Props) {
  const toggle = (r: string) => {
    onChange(selected.includes(r) ? selected.filter((x) => x !== r) : [...selected, r]);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] mr-1">
        Region
      </span>
      <button
        type="button"
        onClick={() => onChange([])}
        className={`text-[10px] px-2 py-0.5 rounded border ${
          selected.length === 0
            ? "border-[var(--color-accent)] text-[var(--color-accent)]"
            : "border-[var(--color-border)] text-[var(--color-muted)]"
        }`}
      >
        All
      </button>
      {regions.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => toggle(r)}
          className="text-[10px] px-2 py-0.5 rounded border transition-colors"
          style={{
            borderColor: selected.includes(r) ? REGION_COLORS[r] : "var(--color-border)",
            color: selected.includes(r) ? REGION_COLORS[r] : "var(--color-muted)",
            backgroundColor: selected.includes(r) ? `${REGION_COLORS[r]}22` : "transparent",
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
