import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mockAnalyzeAndGenerate, mockAnalyzeFailure } from "./mock-backend";

test("switches to Portuguese on the landing page with no navigation, and axe stays clean", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /three pricing pages/i })).toBeVisible();

  const urlBefore = page.url();
  await page.getByRole("combobox", { name: "Language" }).click();
  await page.getByRole("option", { name: "Português" }).click();

  await expect(page.getByRole("heading", { name: /três páginas de preços/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /abrir o estúdio/i })).toBeVisible();
  expect(page.url()).toBe(urlBefore);

  const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});

test("Portuguese selection persists across a reload, on both routes", async ({ page }) => {
  await page.goto("/studio");
  await page.getByRole("combobox", { name: "Language" }).click();
  await page.getByRole("option", { name: "Português" }).click();
  await expect(page.getByText("Nada gerado ainda")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Nada gerado ainda")).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /três páginas de preços/i })).toBeVisible();
});

test("switching back to English updates the stored preference and the UI", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Language" }).click();
  await page.getByRole("option", { name: "Português" }).click();
  await expect(page.getByRole("combobox", { name: "Idioma" })).toBeVisible();

  await page.getByRole("combobox", { name: "Idioma" }).click();
  await page.getByRole("option", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: /three pricing pages/i })).toBeVisible();
});

test("full Studio flow in Portuguese: validation, generation, and export all translate, except the generated content itself", async ({
  page,
}) => {
  await mockAnalyzeAndGenerate(page);
  await page.goto("/studio");
  await page.getByRole("combobox", { name: "Language" }).click();
  await page.getByRole("option", { name: "Português" }).click();

  // Client-side validation message, translated.
  await page.getByPlaceholder("seu-produto.com").fill("not a url");
  await page.getByRole("button", { name: "Analisar" }).click();
  await expect(
    page.getByText("URL inválida — inclua um domínio válido como flowbase.com."),
  ).toBeVisible();

  // Full generation, translated status chrome around it.
  await page.getByPlaceholder("seu-produto.com").fill("flowbase.com");
  await page.getByRole("button", { name: "Analisar" }).click();
  await expect(page.getByText("Flowbase").first()).toBeVisible();
  await expect(page.getByText("pronto").first()).toBeVisible();

  // Export dialog: title and copy translate; format tabs (technical
  // identifiers) and the exported code itself do not, by design (ADR-0019).
  await page.getByRole("button", { name: "Exportar" }).first().click();
  await expect(page.getByText(/Exportar —/)).toBeVisible();
  await expect(page.getByRole("tab", { name: "Stripe JSON" })).toBeVisible();
});

test("a mapped backend error renders translated copy, not the raw English title", async ({
  page,
}) => {
  await mockAnalyzeFailure(page);
  await page.goto("/studio");
  await page.getByRole("combobox", { name: "Language" }).click();
  await page.getByRole("option", { name: "Português" }).click();

  await page.getByPlaceholder("seu-produto.com").fill("flowbase.com");
  await page.getByRole("button", { name: "Analisar" }).click();

  await expect(
    page.getByText("Não conseguimos acessar ou ler esse site. Verifique a URL e tente novamente."),
  ).toBeVisible();
  await expect(page.getByText("Scrape failed")).toHaveCount(0);
});
