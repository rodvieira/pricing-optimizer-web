import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing page renders the hero and has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /three pricing pages/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /open the studio/i })).toBeVisible();

  // color-contrast is disabled by an owner-approved decision to match the
  // design mock's warm palette exactly, some of whose small accent/muted text
  // falls below WCAG AA 4.5:1. See features/theme/pricing-optimizer-theme.ts.
  const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});

test("theme toggle switches data-theme on <html>", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /switch to/i }).click();
  await page.getByRole("button", { name: /switch to/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
