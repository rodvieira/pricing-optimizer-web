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
  // falls below WCAG AA 4.5:1. See the color tokens in src/app/globals.css.
  const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});

test("theme toggle switches data-theme on <html>", async ({ page }) => {
  await page.goto("/");
  // Theme toggle lives inside the header's settings popover (issue #44).
  await page.getByRole("button", { name: "Settings" }).click();
  // Binary light <-> dark toggle (no "system" option) — one click is enough
  // from the default light state.
  await page.getByRole("button", { name: /switch to/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("settings popover has no serious accessibility violations while open", async ({ page }) => {
  // A dedicated, explicit scan with the popover open — not relying on it
  // incidentally staying open at the end of some other test. Radix's
  // Popover.Content renders role="dialog" with no accessible name of its
  // own; this is the regression guard for that (ADR-0022).
  await page.goto("/");
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("button", { name: /switch language to/i })).toBeVisible();

  const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});
