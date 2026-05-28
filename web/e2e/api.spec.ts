import { test, expect } from "@playwright/test";

const API = "http://127.0.0.1:8000/api";

const endpoints = [
  "health",
  "kpis",
  "filters/meta",
  "comparison",
  "seat-tally",
  "vote-share",
  "sankey",
  "flips-by-region",
  "party-retention",
  "regional-seats",
  "editorial",
  "insights",
];

test.describe("API contract (parallel to UI)", () => {
  for (const ep of endpoints) {
    test(`GET /${ep} returns 200 JSON`, async ({ request }) => {
      const res = await request.get(`${API}/${ep}`);
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body).toBeTruthy();
    });
  }

  test("comparison supports region filter", async ({ request }) => {
    const all = await request.get(`${API}/comparison`);
    const filtered = await request.get(
      `${API}/comparison?${new URLSearchParams({ region: "Chennai Metro" })}`
    );
    const allRows = await all.json();
    const filteredRows = await filtered.json();
    expect(filteredRows.length).toBeLessThan(allRows.length);
    expect(filteredRows.length).toBe(32);
  });
});
