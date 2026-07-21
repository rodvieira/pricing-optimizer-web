import type {
  GenerateStreamState,
  Generation,
  PricingStrategy,
  Problem,
  SiteProfile,
  Variation,
} from "@/domain";

/**
 * Static demo data for the Studio's DEMO controls. The app has no live
 * pricing-optimizer-api yet (see issue #4), so these let the Studio show a
 * completed result, a server error, and a slow generation with no backend —
 * the same states the design mock's demo toolbar exposes.
 */
export const DEMO_SITE_PROFILE: SiteProfile = {
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
  analyzedAt: "2026-07-20T00:00:00Z",
};

function demoVariation(
  strategy: PricingStrategy,
  headline: string,
  rationale: string,
  tiers: Variation["tiers"],
): Variation {
  return { id: `demo-${strategy}`, strategy, headline, rationale, tiers };
}

export const DEMO_GENERATION: Generation = {
  id: "demo-generation",
  sourceUrl: DEMO_SITE_PROFILE.url,
  siteProfile: DEMO_SITE_PROFILE,
  status: "completed",
  createdAt: "2026-07-20T00:00:00Z",
  variations: [
    demoVariation(
      "anchor",
      "Pick the plan that scales with you",
      "A premium anchor reframes the middle tier as the obvious default.",
      [
        {
          name: "Starter",
          price: { amount: 1900, currency: "USD", interval: "monthly" },
          features: ["Up to 3 projects", "1 seat", "Community support"],
        },
        {
          name: "Pro",
          price: { amount: 4900, currency: "USD", interval: "monthly" },
          features: ["Unlimited projects", "10 seats", "Priority support"],
          highlighted: true,
          badge: "Most popular",
          cta: "Start Pro",
        },
        {
          name: "Enterprise",
          price: { amount: 0, currency: "USD", interval: "monthly", customLabel: "Contact us" },
          features: ["SSO & SCIM", "Unlimited seats", "Dedicated manager"],
          cta: "Talk to sales",
        },
      ],
    ),
    demoVariation(
      "freemium",
      "Start free, upgrade when it pays off",
      "Clear steps from free to enterprise so each upgrade feels small.",
      [
        {
          name: "Free",
          price: { amount: 0, currency: "USD", interval: "monthly" },
          features: ["1 project", "1 seat"],
        },
        {
          name: "Team",
          price: { amount: 2900, currency: "USD", interval: "monthly" },
          features: ["10 projects", "5 seats", "Integrations"],
          highlighted: true,
          badge: "Best value",
          cta: "Upgrade",
        },
        {
          name: "Scale",
          price: { amount: 9900, currency: "USD", interval: "monthly" },
          features: ["Unlimited projects", "Unlimited seats", "Advanced roles"],
        },
      ],
    ),
    demoVariation(
      "value_based",
      "Priced to the outcome you unlock",
      "Cost maps to hours saved and revenue unlocked, reading as ROI.",
      [
        {
          name: "Launch",
          price: { amount: 3900, currency: "USD", interval: "monthly" },
          features: ["Up to $10k MRR", "Core analytics"],
        },
        {
          name: "Growth",
          price: { amount: 12900, currency: "USD", interval: "monthly" },
          features: ["Up to $100k MRR", "Revenue analytics", "A/B testing"],
          highlighted: true,
          badge: "Recommended",
          cta: "Choose Growth",
        },
        {
          name: "Scale",
          price: { amount: 0, currency: "USD", interval: "monthly", customLabel: "Custom" },
          features: ["Unlimited MRR", "Custom models", "White glove onboarding"],
          cta: "Contact us",
        },
      ],
    ),
  ],
};

export const DEMO_PROBLEM: Problem = {
  type: "about:blank",
  title: "Generation failed",
  status: 502,
  detail: "The upstream model provider returned an error. This is a simulated demo failure.",
};

const STRATEGIES: readonly PricingStrategy[] = ["anchor", "freemium", "value_based"];

/**
 * A mid-flight streaming state with all three strategies still generating,
 * used by the "Slow generation" demo — combined with slowStrategies below it
 * drives the "taking longer…" indicators and skeletons.
 */
export function demoSlowStreamState(): GenerateStreamState {
  const strategies: GenerateStreamState["strategies"] = {};
  for (const strategy of STRATEGIES) {
    strategies[strategy] = { status: "streaming", partialText: "" };
  }
  return {
    generationId: "demo-slow",
    status: "streaming",
    strategies,
    problem: null,
    generation: null,
  };
}

export const DEMO_SLOW_STRATEGIES: ReadonlySet<PricingStrategy> = new Set(STRATEGIES);
