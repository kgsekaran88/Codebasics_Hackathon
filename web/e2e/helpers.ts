import { type Page, expect } from "@playwright/test";

export const ROUTES = [
  { testId: "nav-show-plan", title: "Editorial brief", path: "/" },
  { testId: "nav-margins", title: "Margins", path: "/margins" },
  { testId: "nav-seat-flows", title: "Seat flows", path: "/flows" },
  { testId: "nav-overview", title: "Statewide", path: "/overview" },
  { testId: "nav-explorer", title: "Constituency explorer", path: "/explorer" },
  { testId: "nav-geography", title: "Geography", path: "/geography" },
  { testId: "nav-reserved", title: "Reserved seats", path: "/reserved" },
  { testId: "nav-depth", title: "Ballots & turnout", path: "/depth" },
  { testId: "nav-deep", title: "Deep insights", path: "/deep" },
  { testId: "nav-methods", title: "Sources", path: "/methods" },
] as const;

export async function waitForDashboard(page: Page) {
  await expect(page.getByTestId("api-error")).toHaveCount(0);
  await expect(page.getByTestId("page-title")).toBeVisible();
}

export async function expectChartCanvas(page: Page, minCount = 1) {
  const canvases = page.locator("canvas");
  await expect(async () => {
    const n = await canvases.count();
    expect(n).toBeGreaterThanOrEqual(minCount);
  }).toPass({ timeout: 20_000 });
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 2;
  });
  expect(overflow).toBe(false);
}
