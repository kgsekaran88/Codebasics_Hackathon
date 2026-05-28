export type Year = "2021" | "2026";

interface Props {
  value: Year;
  onChange: (y: Year) => void;
}

export default function YearToggle({ value, onChange }: Props) {
  return (
    <div
      data-testid="year-toggle"
      className="inline-flex rounded-lg border border-[var(--color-border)] p-0.5 text-xs"
      role="group"
      aria-label="Election year"
    >
      {(["2021", "2026"] as Year[]).map((y) => (
        <button
          key={y}
          type="button"
          onClick={() => onChange(y)}
          className={`px-3 py-1 rounded-md transition-colors ${
            value === y
              ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-medium"
              : "text-[var(--color-muted)] hover:text-white"
          }`}
        >
          {y}
        </button>
      ))}
    </div>
  );
}
