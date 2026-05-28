const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export interface Kpis {
  year: "2021" | "2026";
  leading_party: string;
  leading_party_seats: number;
  second_party?: string | null;
  second_party_seats?: number;
  avg_margin: number;
  median_margin?: number;
  under_35_share: number;
  under_5_margin: number;
  over_50_share: number;
  total_acs: number;
  tvk_seats: number | null;
  flips: number | null;
  flip_pct: number | null;
  avg_margin_2021?: number | null;
  avg_margin_2026?: number | null;
}

export interface AcRow {
  ac_number: number;
  ac_name: string;
  district: string;
  region: string;
  reserved: string;
  winner_party_norm_2021: string;
  winner_party_norm_2026: string;
  margin_pct_2021: number;
  margin_pct_2026: number;
  /** 2026 margin − 2021 margin (percentage points). */
  margin_delta?: number;
  winner_share_pct_2021?: number;
  winner_share_pct_2026?: number;
  turnout_pct_2021?: number | null;
  turnout_pct_2026?: number | null;
  n_candidates_2026?: number;
  flip_norm: boolean;
}

export interface FilterMeta {
  regions: string[];
  reserved: string[];
  parties_2026: string[];
}

export interface DataScope {
  has_booth_level: boolean;
  has_age_demographics: boolean;
  has_turnout_2026: boolean;
  has_turnout_2021: boolean;
  has_constituency_level: boolean;
  note: string;
}

export interface ResearchNote {
  title: string;
  bullets: string[];
}

export interface EditorialPlan {
  headline: string;
  briefing_intro: string;
  core_narratives: { title: string; summary: string; path: string; label: string }[];
  supporting_views: { label: string; summary: string; path: string }[];
  run_of_show: { minutes: number; title: string; why: string; path: string }[];
  explorer: { path: string; description: string };
  limitations: string[];
}

export interface InsightsPayload {
  year: string;
  headline: string;
  data_scope: DataScope;
  pages: Record<string, string[]>;
  chart_takeaways?: Record<string, Record<string, string>>;
  research_notes: Record<string, ResearchNote>;
}

export const api = {
  health: () => get<{ status: string }>("/health"),
  kpis: (year: "2021" | "2026" = "2026") => get<Kpis>(`/kpis?year=${year}`),
  meta: () => get<Record<string, unknown>>("/meta"),
  filterMeta: () => get<FilterMeta>("/filters/meta"),
  comparison: (params: URLSearchParams) =>
    get<AcRow[]>(`/comparison?${params}`),
  seatTally: () =>
    get<{
      "2021": { party: string; seats: number }[];
      "2026": { party: string; seats: number }[];
    }>("/seat-tally"),
  voteShare: () =>
    get<{ "2021": { party: string; vote_share_pct: number }[]; "2026": { party: string; vote_share_pct: number }[] }>(
      "/vote-share"
    ),
  sankey: (full = false) =>
    get<{ source: string; target: string; value: number }[]>(`/sankey?full=${full}`),
  flipsByRegion: () => get<{ region: string; flips: number; total: number; flip_pct: number }[]>("/flips-by-region"),
  flipsByReserved: () =>
    get<{ reserved: string; flips: number; total: number; flip_pct: number }[]>("/flips-by-reserved"),
  reservedBreakdown: () =>
    get<{ reserved: string; party: string; seats: number }[]>("/reserved-breakdown"),
  reservedBreakdownFull: () =>
    get<Record<string, { reserved: string; party: string; seats: number }[]>>(
      "/reserved-breakdown-full"
    ),
  reservedMarginSummary: () =>
    get<
      {
        reserved: string;
        acs: number;
        avg_margin_2021: number;
        avg_margin_2026: number;
        flip_pct: number;
        under_35_2026: number;
      }[]
    >("/reserved-margin-summary"),
  voteShareByRegion: () =>
    get<{
      "2021": { region: string; party: string; vote_share_pct: number }[];
      "2026": { region: string; party: string; vote_share_pct: number }[];
    }>("/vote-share-by-region"),
  advancedSummary: () => get<Record<string, number>>("/advanced/summary"),
  enpByRegion: () =>
    get<{ region: string; enp_2021: number; enp_2026: number }[]>("/advanced/enp-by-region"),
  pedersenByRegion: () =>
    get<{ region: string; pedersen: number }[]>("/advanced/pedersen-by-region"),
  swingByRegion: () =>
    get<{ region: string; party_norm: string; share_2021: number; share_2026: number; swing_pp: number }[]>(
      "/advanced/swing-by-region"
    ),
  antiIncumbency: () =>
    get<{ slice: string; label: string; incumbent_lost_pct: number; n: number }[]>(
      "/advanced/anti-incumbency"
    ),
  representationGap: () =>
    get<{
      "2021": { party_norm: string; vote_share_pct: number; seat_share_pct: number; representation_gap_pp: number }[];
      "2026": { party_norm: string; vote_share_pct: number; seat_share_pct: number; representation_gap_pp: number }[];
    }>("/advanced/representation-gap"),
  districtFlips: () =>
    get<{ district: string; acs: number; flips: number; flip_pct: number; all_flipped: boolean }[]>(
      "/advanced/district-flips"
    ),
  bellwethers: () =>
    get<{ ac_number: number; constituency: string; region: string; winner_party_norm_2021: string; winner_party_norm_2026: string; margin_pct_2026: number }[]>(
      "/advanced/bellwethers"
    ),
  raceTypes: () => get<{ race_type: string; count: number }[]>("/advanced/race-types"),
  turnoutTopChanges: () =>
    get<{
      rows: {
        ac_number: number;
        constituency: string;
        region: string;
        reserved: string;
        turnout_pct_2021: number;
        turnout_pct_2026: number;
        turnout_delta: number;
      }[];
      has_2026_turnout: boolean;
      state_record_2026_pct: number;
      source_hint: string;
    }>("/turnout-top-changes"),
  partyRetention: () =>
    get<{ party: string; held_2021: number; retained_2026: number; retention_pct: number }[]>("/party-retention"),
  closestRaces: () => get<AcRow[]>("/closest-races"),
  winnerBuckets: () => get<{ bucket: string; count: number }[]>("/winner-share-buckets"),
  marginSummary: () => get<{ metric: string; value: number }[]>("/margin-summary"),
  regionalSeats: () =>
    get<{
      "2021": { region: string; party: string; seats: number }[];
      "2026": { region: string; party: string; seats: number }[];
    }>("/regional-seats"),
  tvkNonWins: () => get<AcRow[]>("/tvk-non-wins"),
  nota: () => get<{ ac_name: string; nota_pct: number }[]>("/nota"),
  notaAll: () =>
    get<{ ac_number: number; ac_name: string; region: string; nota_pct: number }[]>("/nota-all"),
  insights: (year: "2021" | "2026" = "2026") =>
    get<InsightsPayload>(`/insights?year=${year}`),
  editorial: () => get<EditorialPlan>("/editorial"),
  turnoutByRegion: () =>
    get<{ region: string; avg_turnout_pct: number }[]>("/turnout-by-region"),
  candidateBuckets: () => get<{ bucket: string; count: number }[]>("/candidate-buckets"),
  ac: (n: number) => get<AcRow>(`/ac/${n}`),
};
