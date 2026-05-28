import { test, expect } from "@playwright/test";
import { ROUTES, waitForDashboard, expectNoHorizontalOverflow } from "./helpers";

const VIEWPORTS = [
  { name: "laptop", width: 1440, height: 900 },
  { name: "hd", width: 1280, height: 720 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
] as const;

for (const vp of VIEWPORTS) {
  test.describe(`Viewport ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of ROUTES.slice(0, 5)) {
      test(`${route.title} fits without horizontal scroll`, async ({ page }) => {
        await page.goto(route.path);
        await waitForDashboard(page);
        await expectNoHorizontalOverflow(page);
        // Pages scroll vertically by design — no fixed viewport trap.
      });
    }
  });
}
