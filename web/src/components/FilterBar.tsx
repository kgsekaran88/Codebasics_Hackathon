import type { FilterMeta } from "../lib/api";

export interface FilterState {
  regions: string[];
  reserved: string[];
  parties: string[];
  flipOnly: boolean;
  maxMargin: number;
}

interface Props {
  meta: FilterMeta;
  state: FilterState;
  onChange: (s: FilterState) => void;
}

function toggle(arr: string[], v: string): string[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export default function FilterBar({ meta, state, onChange }: Props) {
  return (
    <aside className="panel p-4 space-y-4 w-full lg:w-64 shrink-0">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
        Filters
      </h3>

      <fieldset>
        <legend className="text-sm mb-2">Region</legend>
        <div className="flex flex-wrap gap-1.5">
          {meta.regions.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ ...state, regions: toggle(state.regions, r) })}
              className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                state.regions.includes(r)
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-white/30"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm mb-2">Reserved</legend>
        <div className="flex gap-1.5">
          {meta.reserved.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ ...state, reserved: toggle(state.reserved, r) })}
              className={`text-xs px-2.5 py-1 rounded-md border ${
                state.reserved.includes(r)
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20"
                  : "border-[var(--color-border)] text-[var(--color-muted)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={state.flipOnly}
          onChange={(e) => onChange({ ...state, flipOnly: e.target.checked })}
          className="rounded border-[var(--color-border)]"
        />
        Flipped seats only
      </label>

      <label className="block text-sm">
        Max margin % ({state.maxMargin})
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={state.maxMargin}
          onChange={(e) => onChange({ ...state, maxMargin: Number(e.target.value) })}
          className="w-full mt-1 accent-[var(--color-accent)]"
        />
      </label>
    </aside>
  );
}
