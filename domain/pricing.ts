/** Psychological pricing strategies the backend can apply to a generation. */
export type PricingStrategy = "anchor" | "freemium" | "value_based";

export type PriceInterval = "one_time" | "monthly" | "yearly";

export interface Price {
  /** Minor unit (cents). 0 = free. */
  amount: number;
  /** ISO 4217, e.g. "USD". */
  currency: string;
  interval: PriceInterval;
  /** Overrides the rendered price, e.g. "Contact us". */
  customLabel?: string;
}

export interface PricingTier {
  name: string;
  price: Price;
  tagline?: string;
  features: string[];
  cta?: string;
  /** Visually emphasized/recommended tier. */
  highlighted?: boolean;
  badge?: string;
}
