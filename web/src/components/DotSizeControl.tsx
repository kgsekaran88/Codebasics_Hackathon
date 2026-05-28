/** Slider for scatter / bubble symbol size (ECharts symbolSize). */
export default function DotSizeControl({
  value,
  onChange,
  min = 6,
  max = 28,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex items-center gap-2 text-[10px] text-[var(--color-muted)]">
      <span className="whitespace-nowrap">Dot size</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 accent-[var(--color-accent)]"
        aria-label="Scatter dot size"
      />
      <span className="tabular-nums text-white w-5 text-right">{value}</span>
    </label>
  );
}
