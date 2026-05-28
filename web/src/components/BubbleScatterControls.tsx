import DotSizeControl from "./DotSizeControl";
import type { MarginBubbleSizeMode } from "../charts/options";
import { MARGIN_BUBBLE_SIZE_LABELS } from "../charts/options";

const MODES: MarginBubbleSizeMode[] = [
  "margin_shift",
  "fragmentation",
  "ballot_size",
  "fixed",
];

/** Controls for margin scatter: encode bubble area by a metric or fixed size. */
export default function BubbleScatterControls({
  sizeMode,
  onSizeModeChange,
  fixedSize,
  onFixedSizeChange,
  scaleMax,
  onScaleMaxChange,
}: {
  sizeMode: MarginBubbleSizeMode;
  onSizeModeChange: (m: MarginBubbleSizeMode) => void;
  fixedSize: number;
  onFixedSizeChange: (n: number) => void;
  scaleMax: number;
  onScaleMaxChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-1.5 text-[10px] text-[var(--color-muted)]">
        <span className="whitespace-nowrap">Size by</span>
        <select
          value={sizeMode}
          onChange={(e) => onSizeModeChange(e.target.value as MarginBubbleSizeMode)}
          className="rounded-md border border-[var(--color-border)] bg-[#141a24] text-white text-[10px] py-1 px-2 max-w-[11rem]"
          aria-label="Bubble size encoding"
        >
          {MODES.map((m) => (
            <option key={m} value={m}>
              {MARGIN_BUBBLE_SIZE_LABELS[m]}
            </option>
          ))}
        </select>
      </label>
      {sizeMode === "fixed" ? (
        <DotSizeControl value={fixedSize} onChange={onFixedSizeChange} />
      ) : (
        <label className="flex items-center gap-2 text-[10px] text-[var(--color-muted)]">
          <span className="whitespace-nowrap">Max size</span>
          <input
            type="range"
            min={14}
            max={36}
            step={1}
            value={scaleMax}
            onChange={(e) => onScaleMaxChange(Number(e.target.value))}
            className="w-16 accent-[var(--color-accent)]"
            aria-label="Maximum bubble size"
          />
          <span className="tabular-nums text-white w-5 text-right">{scaleMax}</span>
        </label>
      )}
    </div>
  );
}
