import { test, expect } from "@playwright/test";
import { waitForDashboard } from "./helpers";

test.describe("Overview interactivity", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/overview");
    await waitForDashboard(page);
  });

  test("year toggle updates KPIs, mosaic, and bar charts", async ({ page }) => {
    const toggle = page.getByTestId("year-toggle");
    const mosaic = page.getByTestId("constituency-mosaic");
    await expect(toggle).toBeVisible();

    await toggle.getByRole("button", { name: "2021" }).click();
    await expect(mosaic).toHaveAttribute("data-year", "2021");
    await expect(page.getByTestId("kpi-leading-seats-value")).toHaveText("133");
    await expect(page.locator("canvas").first()).toBeVisible();

    const tvkTiles = await mosaic.locator('button[data-party="TVK"]').count();
    expect(tvkTiles).toBe(0);

    await toggle.getByRole("button", { name: "2026" }).click();
    await expect(mosaic).toHaveAttribute("data-year", "2026");
    await expect(page.getByText("TVK seats")).toBeVisible();
    const tvk2026 = await mosaic.locator('button[data-party="TVK"]').count();
    expect(tvk2026).toBeGreaterThan(50);
  });

  test("region filter reduces mosaic tile count", async ({ page }) => {
    const mosaic = page.getByTestId("constituency-mosaic");
    await expect(mosaic.locator("button")).toHaveCount(234);

    const comparisonDone = page.waitForResponse(
      (r) => r.url().includes("/api/comparison") && r.status() === 200
    );
    await page.getByRole("button", { name: "Chennai Metro", exact: true }).click();
    await comparisonDone;

    const count = await mosaic.locator("button").count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(234);

    const resetDone = page.waitForResponse(
      (r) => r.url().includes("/api/comparison") && r.status() === 200
    );
    await page.getByRole("button", { name: "All", exact: true }).click();
    await resetDone;
    await expect(mosaic.locator("button")).toHaveCount(234, { timeout: 10_000 });
  });
});

test.describe("Seat flows interactivity", () => {
  test("full flows checkbox toggles Sankey", async ({ page }) => {
    await page.goto("/flows");
    await waitForDashboard(page);

    const checkbox = page.getByRole("checkbox", { name: /All flows/i });
    await expect(checkbox).toBeVisible();
    await expect(page.locator("canvas").first()).toBeVisible();

    await checkbox.check();
    await page.waitForTimeout(800);
    await expect(page.locator("canvas").first()).toBeVisible();

    await checkbox.uncheck();
    await page.waitForTimeout(800);
    await expect(page.locator("canvas").first()).toBeVisible();
  });
});

test.describe("Explorer interactivity", () => {
  test("flip filter and table row selection", async ({ page }) => {
    await page.goto("/explorer");
    await waitForDashboard(page);

    await page.getByLabel("Flipped seats only").check();
    await page.waitForTimeout(600);

    await page.locator("tbody tr").first().click();
    await expect(page.getByTestId("ac-detail")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("dl").getByText("2026 winner")).toBeVisible();
  });
});

test.describe("Overview mosaic click", () => {
  test("tile click shows AC detail", async ({ page }) => {
    await page.goto("/overview");
    await waitForDashboard(page);

    await page.getByTestId("constituency-mosaic").locator("button").first().click();
    await expect(page.getByTestId("ac-detail")).toBeVisible({ timeout: 10_000 });
  });
});
