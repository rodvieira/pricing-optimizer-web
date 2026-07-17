"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { GenerateStreamState, PricingStrategy } from "@/domain";
import { STRATEGY_META } from "../strategy-meta";
import { VariationCard } from "./variation-card";

export interface VariationGridProps {
  readonly state: GenerateStreamState;
  readonly slowStrategies: ReadonlySet<PricingStrategy>;
  readonly onExport: (strategy: PricingStrategy) => void;
}

export function VariationGrid({ state, slowStrategies, onExport }: VariationGridProps) {
  const [hoveredTierIndex, setHoveredTierIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: clears a hover-only visual highlight; no keyboard/screen-reader equivalent needed (see pricing-tier-row.tsx). */}
      <div
        onMouseLeave={() => setHoveredTierIndex(null)}
        className="grid grid-cols-1 items-start gap-4 md:grid-cols-3"
      >
        {STRATEGY_META.map((meta, index) => (
          <motion.div
            key={meta.strategy}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <VariationCard
              strategy={meta.strategy}
              strategyState={state.strategies[meta.strategy]}
              isSlow={slowStrategies.has(meta.strategy)}
              hoveredTierIndex={hoveredTierIndex}
              onHoverTier={setHoveredTierIndex}
              onExport={() => onExport(meta.strategy)}
            />
          </motion.div>
        ))}
      </div>
      <p className="text-center text-xs text-secondary">
        Hover a tier to highlight the equivalent plan across all three strategies.
      </p>
    </div>
  );
}
