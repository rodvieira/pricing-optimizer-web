import type { PricingStrategy } from "@/shared/domain";

export interface StrategyMeta {
  strategy: PricingStrategy;
  /** Key into the owned `--color-icon-{variant}` tokens (app/globals.css). */
  variant: "orange" | "teal" | "pink";
}

/**
 * Fixed display order and color mapping for the three pricing strategies.
 * Reused by the landing page preview and the Studio's variation cards so the
 * same strategy always reads with the same color everywhere. Display copy
 * (label/blurb) lives in the `strategy.*` message catalog keys, not here —
 * this module stays locale-agnostic, consistent with `shared/domain/`'s own
 * purity rule elsewhere in this repo.
 */
export const STRATEGY_META: readonly StrategyMeta[] = [
  { strategy: "anchor", variant: "orange" },
  { strategy: "freemium", variant: "teal" },
  { strategy: "value_based", variant: "pink" },
];

export function strategyMeta(strategy: PricingStrategy): StrategyMeta {
  const meta = STRATEGY_META.find((s) => s.strategy === strategy);
  if (!meta) throw new Error(`Unknown pricing strategy: ${strategy}`);
  return meta;
}
