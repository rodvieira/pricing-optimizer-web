import { Banner, Button, Card, Skeleton } from "@astryxdesign/core";
import { motion } from "motion/react";
import type { PricingStrategy, StrategyGenerationState } from "@/domain";
import { strategyMeta } from "../strategy-meta";
import { PricingTierRow } from "./pricing-tier-row";

export interface VariationCardProps {
  readonly strategy: PricingStrategy;
  readonly strategyState: StrategyGenerationState | undefined;
  readonly isSlow: boolean;
  readonly hoveredTierIndex: number | null;
  readonly onHoverTier: (tierIndex: number) => void;
  readonly onExport: () => void;
}

function statusLabel(state: StrategyGenerationState | undefined, isSlow: boolean): string {
  if (!state || state.status === "pending") return "queued";
  if (state.status === "completed") return "ready";
  if (state.status === "error") return "failed";
  return isSlow ? "taking longer…" : "generating";
}

function Rationale({ state }: { readonly state: StrategyGenerationState | undefined }) {
  if (!state || state.status === "pending") {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton width="92%" height={9} />
        <Skeleton width="74%" height={9} index={1} />
      </div>
    );
  }
  if (state.status === "streaming") {
    return <p className="text-sm leading-relaxed text-secondary">{state.partialText}</p>;
  }
  if (state.status === "completed") {
    return <p className="text-sm leading-relaxed text-secondary">{state.variation.rationale}</p>;
  }
  return <Banner status="error" title={state.problem.title} description={state.problem.detail} />;
}

export function VariationCard({
  strategy,
  strategyState,
  isSlow,
  hoveredTierIndex,
  onHoverTier,
  onExport,
}: VariationCardProps) {
  const meta = strategyMeta(strategy);
  const isComplete = strategyState?.status === "completed";

  return (
    <Card variant="default" padding={0}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span
          aria-hidden
          className="h-2 w-2 rounded-full"
          style={{ background: `var(--color-icon-${meta.variant})` }}
        />
        <span className="font-heading text-sm font-semibold">{meta.label}</span>
        <span className="ml-auto font-mono text-[11px] tracking-wide text-secondary">
          {statusLabel(strategyState, isSlow)}
        </span>
      </div>

      <div className="min-h-[76px] border-b border-border px-4 py-3">
        <div className="mb-2 font-mono text-[10px] tracking-widest text-secondary">
          STRATEGY RATIONALE
        </div>
        <Rationale state={strategyState} />
      </div>

      <div className="px-4 py-2">
        {strategyState?.status === "streaming" && (
          <div className="flex flex-col gap-2 pt-2">
            <Skeleton height={56} />
            <Skeleton height={56} index={1} />
          </div>
        )}
        {isSlow && strategyState?.status === "streaming" && (
          <div className="mt-2 rounded-lg bg-warning-muted px-3 py-2 text-xs text-warning">
            Taking longer than usual — model still streaming this variant.
          </div>
        )}
        {strategyState?.status === "completed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            {strategyState.variation.tiers.map((tier, index) => (
              <PricingTierRow
                key={tier.name}
                tier={tier}
                strategyVariant={meta.variant}
                isHighlighted={hoveredTierIndex === index}
                onHoverStart={() => onHoverTier(index)}
              />
            ))}
          </motion.div>
        )}
      </div>

      <div className="flex gap-2 border-t border-border px-4 py-3">
        <Button
          label="Export"
          variant="primary"
          size="sm"
          isDisabled={!isComplete}
          onClick={onExport}
        />
        <Button label="Edit inline" variant="secondary" size="sm" isDisabled={!isComplete} />
      </div>
    </Card>
  );
}
