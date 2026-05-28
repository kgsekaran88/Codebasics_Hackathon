import { partyColor } from "../lib/colors";
import type { AcRow } from "../lib/api";
import type { Year } from "./YearToggle";

interface Props {
  rows: AcRow[];
  year: Year;
  onSelect?: (ac: AcRow) => void;
}

function winnerForYear(ac: AcRow, year: Year): string {
  return year === "2021" ? ac.winner_party_norm_2021 : ac.winner_party_norm_2026;
}

export default function MosaicGrid({ rows, year, onSelect }: Props) {
  const sorted = [...rows].sort((a, b) => a.ac_number - b.ac_number);

  return (
    <div>
      <div
        className="grid gap-[2px] rounded-lg overflow-hidden border border-[var(--color-border)] w-full max-h-full aspect-[18/13] sm:aspect-[18/13]"
        style={{
          gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
          gridTemplateRows: "repeat(13, minmax(0, 1fr))",
        }}
        data-testid="constituency-mosaic"
        data-year={year}
        role="img"
        aria-label={`234 constituency tiles colored by ${year} winner`}
      >
        {sorted.map((ac) => {
          const party = winnerForYear(ac, year);
          return (
            <button
              key={ac.ac_number}
              type="button"
              title={`${ac.ac_number} ${ac.ac_name} — ${party}`}
              data-party={party}
              onClick={() => onSelect?.(ac)}
              className="aspect-square w-full min-h-[8px] sm:min-h-[10px] hover:ring-2 hover:ring-white/50 hover:z-10 transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ backgroundColor: partyColor(party) }}
            />
          );
        })}
      </div>
      <p className="text-xs text-[var(--color-muted)] mt-2">
        Each tile = one AC (sorted by number). Showing {year} winners.
        {onSelect ? " Click for detail." : ""}
      </p>
    </div>
  );
}
