import type { PricingStrategy, PricingTier } from "./pricing";

export interface Variation {
  id: string;
  strategy: PricingStrategy;
  headline: string;
  subheadline?: string;
  tiers: PricingTier[];
  /** Why this strategy fits the analyzed audience. */
  rationale?: string;
}
