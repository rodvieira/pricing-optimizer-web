import { expect, test } from "@playwright/test";
import { mockAnalyzeAndGenerate } from "./mock-backend";

/**
 * Regression coverage for a real bug: the header's nav pill + theme toggle
 * had no wrap/shrink handling, overflowing ~96px past a 375px viewport on
 * every page. Asserts the concrete, objective symptom (horizontal overflow)
 * rather than pixel positions, so it stays meaningful across visual tweaks.
 */
async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `scrollWidth (${scrollWidth}) should not exceed clientWidth (${clientWidth})`,
  ).toBeLessThanOrEqual(clientWidth);
}

test.describe("no horizontal overflow at mobile viewport (375px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("landing page", async ({ page }) => {
    await page.goto("/");
    await expectNoHorizontalOverflow(page);
  });

  test("empty studio state", async ({ page }) => {
    await page.goto("/studio");
    await expectNoHorizontalOverflow(page);
  });

  test("studio with a completed generation", async ({ page }) => {
    await mockAnalyzeAndGenerate(page);
    await page.goto("/studio");
    await page.getByPlaceholder("your-product.com").fill("flowbase.com");
    await page.getByRole("button", { name: /analyze/i }).click();
    await expect(page.getByRole("button", { name: "Export" }).first()).toBeEnabled();
    await expectNoHorizontalOverflow(page);
  });
});

test("variation grid stacks to a single column below the 1024px breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await mockAnalyzeAndGenerate(page);
  await page.goto("/studio");
  await page.getByPlaceholder("your-product.com").fill("flowbase.com");
  await page.getByRole("button", { name: /analyze/i }).click();
  await expect(page.getByRole("button", { name: "Export" }).first()).toBeEnabled();

  const cards = page.locator("text=STRATEGY RATIONALE");
  await expect(cards).toHaveCount(3);
  const firstBox = await cards.nth(0).boundingBox();
  const secondBox = await cards.nth(1).boundingBox();
  // Stacked (not side-by-side): the second card starts below, not beside, the first.
  expect(firstBox && secondBox && secondBox.y).toBeGreaterThan(
    (firstBox?.y ?? 0) + (firstBox?.height ?? 0) - 1,
  );
});
