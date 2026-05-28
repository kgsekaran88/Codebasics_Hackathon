/** Party colors — ECI-normalized short codes */
export const PARTY_COLORS: Record<string, string> = {
  TVK: "#F4C430",
  DMK: "#E53935",
  AIADMK: "#1E88E5",
  BJP: "#FF8F00",
  INC: "#43A047",
  PMK: "#8E24AA",
  VCK: "#00897B",
  NTK: "#5D4037",
  CPI: "#C62828",
  CPM: "#B71C1C",
  MDMK: "#6D4C41",
  AMMK: "#7B1FA2",
  DMDK: "#3949AB",
  MNM: "#00ACC1",
  OTHER: "#78909C",
};

export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? PARTY_COLORS.OTHER;
}

export const REGION_COLORS: Record<string, string> = {
  "Chennai Metro": "#64B5F6",
  North: "#81C784",
  Central: "#FFB74D",
  Kongu: "#BA68C8",
  Delta: "#4DD0E1",
  South: "#F06292",
};

/** Consistent macro-region order for charts (west → east / north → south). */
export const REGION_ORDER = [
  "Chennai Metro",
  "North",
  "Central",
  "Kongu",
  "Delta",
  "South",
] as const;

export const REGION_SHORT: Record<string, string> = {
  "Chennai Metro": "Chennai",
  North: "North",
  Central: "Central",
  Kongu: "Kongu",
  Delta: "Delta",
  South: "South",
};
