import { PARTY_COLORS } from "../lib/colors";

const MAIN = ["TVK", "DMK", "AIADMK", "BJP", "INC", "PMK", "VCK", "NTK"];

export default function PartyLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {MAIN.map((p) => (
        <span key={p} className="inline-flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: PARTY_COLORS[p] }}
          />
          {p}
        </span>
      ))}
      <span className="text-[var(--color-muted)]">+ others</span>
    </div>
  );
}
