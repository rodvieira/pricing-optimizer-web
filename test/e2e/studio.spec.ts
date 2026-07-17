import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mockAnalyzeAndGenerate, mockAnalyzeFailure } from "./mock-backend";

test("empty studio state has no serious accessibility violations", async ({ page }) => {
  await page.goto("/studio");
  await expect(page.getByText("Nothing generated yet")).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});

test("blocks an invalid URL client-side, with no network call", async ({ page }) => {
  let analyzeCalled = false;
  await page.route("http://localhost:8080/v1/analyze", (route) => {
    analyzeCalled = true;
    route.abort();
  });

  await page.goto("/studio");
  await page.getByRole("textbox", { name: "Product URL" }).fill("not a url");
  await page.getByRole("button", { name: "Analyze" }).click();

  await expect(page.getByText(/invalid url/i)).toBeVisible();
  expect(analyzeCalled).toBe(false);
});

test("happy path: analyze then stream three variations to completion", async ({ page }) => {
  await mockAnalyzeAndGenerate(page);
  await page.goto("/studio");

  await page.getByRole("textbox", { name: "Product URL" }).fill("flowbase.com");
  await page.getByRole("button", { name: "Analyze" }).click();

  await expect(page.getByText("Product-led B2B teams")).toBeVisible();
  await expect(page.getByText("ready")).toHaveCount(3, { timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Export" }).first()).toBeEnabled();
});

test("shows a distinct error banner with retry when analyze fails", async ({ page }) => {
  await mockAnalyzeFailure(page);
  await page.goto("/studio");

  await page.getByRole("textbox", { name: "Product URL" }).fill("flowbase.com");
  await page.getByRole("button", { name: "Analyze" }).click();

  await expect(page.getByText("Scrape failed")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
});

test("export dialog shows JSX/HTML/Stripe tabs and defaults back to JSX for a new variation", async ({
  page,
}) => {
  await mockAnalyzeAndGenerate(page);
  await page.route("http://localhost:8080/v1/export/*", async (route) => {
    const body = route.request().postDataJSON() as { format: string };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        format: body.format,
        filename: `export.${body.format}`,
        contentType: "text/plain",
        content: `// ${body.format} export`,
      }),
    });
  });

  await page.goto("/studio");
  await page.getByRole("textbox", { name: "Product URL" }).fill("flowbase.com");
  await page.getByRole("button", { name: "Analyze" }).click();
  await expect(page.getByText("ready")).toHaveCount(3, { timeout: 10_000 });

  await page.getByRole("button", { name: "Export" }).first().click();
  await expect(page.getByRole("button", { name: "Stripe JSON" })).toBeVisible();
  await page.getByRole("button", { name: "Stripe JSON" }).click();
  await expect(page.getByText("// stripe export")).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Export" }).nth(1).click();
  await expect(page.getByText("// jsx export")).toBeVisible();
});
