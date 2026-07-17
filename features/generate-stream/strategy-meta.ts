import type { PricingStrategy } from "@/domain";

export interface StrategyMeta {
  strategy: PricingStrategy;
  label: string;
  blurb: string;
  /** Astryx's non-semantic Card/Badge color variant for this strategy. */
  variant: "orange" | "teal" | "pink";
}

/**
 * Fixed display order and Astryx color mapping for the three pricing
 * strategies. Reused by the landing page preview and the Studio's variation
 * cards so the same strategy always reads with the same color everywhere.
 */
export const STRATEGY_META: readonly StrategyMeta[] = [
  {
    strategy: "anchor",
    label: "Anchor pricing",
    blurb:
      "A premium anchor plan reframes the middle tier as the sensible default — the contrast does the selling.",
    variant: "orange",
  },
  {
    strategy: "freemium",
    label: "Freemium ladder",
    blurb:
      "Clear steps from free to enterprise, each removing one limit so every upgrade feels small and inevitable.",
    variant: "teal",
  },
  {
    strategy: "value_based",
    label: "Value-based",
    blurb:
      "Price mapped to outcomes — hours saved, revenue unlocked — so cost reads as return on investment.",
    variant: "pink",
  },
];

export function strategyMeta(strategy: PricingStrategy): StrategyMeta {
  const meta = STRATEGY_META.find((s) => s.strategy === strategy);
  if (!meta) throw new Error(`Unknown pricing strategy: ${strategy}`);
  return meta;
}
