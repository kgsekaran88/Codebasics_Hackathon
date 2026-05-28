import { useApi } from "./useApi";
import { api } from "../lib/api";
import type { Year } from "../components/YearToggle";

export type InsightPage =
  | "overview"
  | "flows"
  | "geography"
  | "margins"
  | "reserved"
  | "depth"
  | "explorer"
  | "deep";

export function usePageInsights(page: InsightPage, year: Year = "2026") {
  const { data } = useApi(() => api.insights(year), [year]);
  return {
    bullets: data?.pages[page] ?? [],
    headline: data?.headline,
    researchNotes: data?.research_notes,
    dataScope: data?.data_scope,
    loading: !data,
  };
}
