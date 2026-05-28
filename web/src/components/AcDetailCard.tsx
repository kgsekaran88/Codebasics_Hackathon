import type { AcRow } from "../lib/api";
import { partyColor } from "../lib/colors";

export default function AcDetailCard({ ac }: { ac: AcRow }) {
  return (
    <div
      className="panel p-4 border-l-4"
      style={{ borderColor: partyColor(ac.winner_party_norm_2026) }}
      data-testid="ac-detail"
    >
      <h3 className="font-semibold text-lg">
        {ac.ac_number}. {ac.ac_name}
      </h3>
      <p className="text-sm text-[var(--color-muted)]">
        {ac.district} · {ac.region} · {ac.reserved}
      </p>
      <dl className="grid grid-cols-2 gap-2 mt-3 text-sm">
        <dt className="text-[var(--color-muted)]">2021 winner</dt>
        <dd>{ac.winner_party_norm_2021}</dd>
        <dt className="text-[var(--color-muted)]">2026 winner</dt>
        <dd>{ac.winner_party_norm_2026}</dd>
        <dt className="text-[var(--color-muted)]">Margin 2026</dt>
        <dd>{ac.margin_pct_2026?.toFixed(2)}%</dd>
        <dt className="text-[var(--color-muted)]">Flip</dt>
        <dd>{ac.flip_norm ? "Yes" : "No"}</dd>
      </dl>
    </div>
  );
}
