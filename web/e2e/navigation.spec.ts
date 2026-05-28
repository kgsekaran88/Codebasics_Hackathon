import { test, expect } from "@playwright/test";
import { ROUTES, waitForDashboard, expectChartCanvas, expectNoHorizontalOverflow } from "./helpers";

test.describe("Navigation & page load", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  for (const route of ROUTES) {
    test(`${route.title} loads without API error`, async ({ page }) => {
      await page.getByTestId(route.testId).click();
      await expect(page).toHaveURL(new RegExp(`${route.path.replace("/", "\\/")}$`));
      await waitForDashboard(page);
      const title = page.getByTestId("page-title");
      if (route.path === "/") {
        await expect(title).toContainText("Editorial brief");
      } else if (route.path === "/methods") {
        await expect(title).toContainText("Methods");
      } else if (route.path === "/overview") {
        await expect(title).toContainText("Statewide");
      } else if (route.path === "/margins") {
        await expect(title).toContainText("Margins");
      } else if (route.path === "/depth") {
        await expect(title).toContainText("Ballots");
      } else if (route.path === "/flows") {
        await expect(title).toContainText("Seat flows");
      } else {
        await expect(title).toContainText(route.title.split(" ")[0]);
      }
    });
  }

  test("sidebar brand visible", async ({ page }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar.getByText("TN Assembly 2026")).toBeVisible();
    await expect(sidebar.getByText("AtliQ Media")).toBeVisible();
  });
});

test.describe("Charts render per page", () => {
  test("Editorial brief loads run of show", async ({ page }) => {
    await page.goto("/");
    await waitForDashboard(page);
    await expect(page.getByTestId("briefing-intro")).toBeVisible();
    await expect(page.getByTestId("core-narratives")).toBeVisible();
    await expect(page.getByTestId("show-segments")).toBeVisible();
  });

  test("Overview has KPIs, mosaic, and charts", async ({ page }) => {
    await page.goto("/overview");
    await waitForDashboard(page);
    await expect(page.getByTestId("kpi-strip")).toBeVisible();
    await expect(page.getByText("TVK seats")).toBeVisible();
    await expect(page.getByTestId("constituency-mosaic")).toBeVisible();
    const tiles = page.getByTestId("constituency-mosaic").locator("button");
    await expect(tiles).toHaveCount(234);
    await expectChartCanvas(page, 2);
    await expectNoHorizontalOverflow(page);
  });

  test("Seat flows renders Sankey and retention", async ({ page }) => {
    await page.goto("/flows");
    await waitForDashboard(page);
    await expectChartCanvas(page, 2);
    await expectNoHorizontalOverflow(page);
  });

  test("Geography renders map and bar charts", async ({ page }) => {
    await page.goto("/geography");
    await waitForDashboard(page);
    await expect(page.getByTestId("district-map")).toBeVisible();
    await expectChartCanvas(page, 3);
  });

  test("Margins renders scatter and bucket charts", async ({ page }) => {
    await page.goto("/margins");
    await waitForDashboard(page);
    await expectChartCanvas(page, 2);
    await expect(page.getByRole("columnheader", { name: "AC" })).toBeVisible();
  });

  test("Depth renders four charts", async ({ page }) => {
    await page.goto("/depth");
    await waitForDashboard(page);
    await expectChartCanvas(page, 4);
    await expectNoHorizontalOverflow(page);
  });

  test("Explorer renders filtered charts and table", async ({ page }) => {
    await page.goto("/explorer");
    await waitForDashboard(page);
    await expectChartCanvas(page, 2);
    await expect(page.getByTestId("explorer-table")).toBeVisible();
  });

  test("Reserved shows flip chart and table", async ({ page }) => {
    await page.goto("/reserved");
    await waitForDashboard(page);
    await expectChartCanvas(page, 1);
    await expect(page.getByRole("columnheader", { name: "GEN" })).toBeVisible();
  });
});
