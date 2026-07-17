import type { Page } from "@playwright/test";

const API_BASE_URL = "http://localhost:8080";

const SITE_PROFILE = {
  url: "https://flowbase.com",
  title: "Flowbase",
  valueProposition: "Ship pricing pages that convert.",
  industry: "developer-tools",
  audience: {
    segment: "Product-led B2B teams",
    sophistication: "high",
    pricePosition: "mid_market",
  },
  sourceType: "static",
  analyzedAt: "2026-07-16T00:00:00Z",
};

function variation(strategy: string, headline: string) {
  return {
    id: `var-${strategy}`,
    strategy,
    headline,
    tiers: [
      {
        name: "Starter",
        price: { amount: 1900, currency: "USD", interval: "monthly" },
        features: ["Up to 3 projects", "1 seat"],
        highlighted: false,
      },
      {
        name: "Pro",
        price: { amount: 4900, currency: "USD", interval: "monthly" },
        features: ["Unlimited projects", "10 seats"],
        highlighted: true,
        badge: "Most popular",
      },
    ],
    rationale: `Why ${strategy} fits this audience.`,
  };
}

function sseFrame(chunk: unknown): string {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

/**
 * Intercepts POST /v1/analyze and POST /v1/generate so e2e tests can drive
 * the real Studio flow without a live pricing-optimizer-api backend.
 */
export async function mockAnalyzeAndGenerate(page: Page): Promise<void> {
  await page.route(`${API_BASE_URL}/v1/analyze`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SITE_PROFILE),
    });
  });

  await page.route(`${API_BASE_URL}/v1/generate`, async (route) => {
    const generation = {
      id: "gen-1",
      sourceUrl: SITE_PROFILE.url,
      status: "completed",
      variations: ["anchor", "freemium", "value_based"].map((s) => variation(s, `${s} headline`)),
      createdAt: "2026-07-16T00:00:00Z",
    };
    const body = [
      sseFrame({ type: "generation_started", generationId: "gen-1" }),
      ...["anchor", "freemium", "value_based"].flatMap((strategy) => [
        sseFrame({ type: "variation_started", strategy }),
        sseFrame({
          type: "variation_completed",
          variation: variation(strategy, `${strategy} headline`),
        }),
      ]),
      sseFrame({ type: "done", generation }),
    ].join("");

    await route.fulfill({ status: 200, contentType: "text/event-stream", body });
  });
}

export async function mockAnalyzeFailure(page: Page): Promise<void> {
  await page.route(`${API_BASE_URL}/v1/analyze`, async (route) => {
    await route.fulfill({
      status: 502,
      contentType: "application/problem+json",
      body: JSON.stringify({
        type: "about:blank",
        title: "Scrape failed",
        status: 502,
        detail: "site down",
      }),
    });
  });
}
