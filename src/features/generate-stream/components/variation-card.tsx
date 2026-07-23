import { Banner, Button, Card, Skeleton } from "@astryxdesign/core";
import { motion } from "motion/react";
import { strategyMeta } from "@/entities/strategy";
import type { PricingStrategy, StrategyGenerationState } from "@/shared/domain";
import { ColorDot } from "@/shared/ui/color-dot";
import { Eyebrow } from "@/shared/ui/eyebrow";
import { PanelHeader } from "@/shared/ui/panel-header";
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
    <Card
      variant="default"
      padding={0}
      style={{
        borderTopWidth: 2,
        borderTopColor: `var(--color-icon-${meta.variant})`,
        borderRadius: "2px 2px 12px 12px",
      }}
    >
      <PanelHeader>
        <ColorDot color={meta.variant} />
        <span className="font-heading text-[14.5px] font-semibold">{meta.label}</span>
        <Eyebrow tone="secondary" className="ml-auto">
          {statusLabel(strategyState, isSlow)}
        </Eyebrow>
      </PanelHeader>

      <div className="min-h-[76px] border-b border-border px-4 py-3">
        <Eyebrow tone="secondary" className="mb-2">
          STRATEGY RATIONALE
        </Eyebrow>
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

      <div className="flex gap-[9px] border-t border-border px-4 py-3">
        <Button
          label="Export"
          variant="primary"
          size="sm"
          isDisabled={!isComplete}
          onClick={onExport}
          className="flex-1"
          style={{ padding: 9, borderRadius: 8, fontSize: 12.5, fontWeight: 600, height: "auto" }}
        />
        <Button
          label="Edit inline"
          variant="secondary"
          size="sm"
          isDisabled={!isComplete}
          className="flex-1"
          style={{
            padding: 9,
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 500,
            height: "auto",
            backgroundColor: "transparent",
            border: "1px solid var(--color-border-emphasized)",
            color: "var(--color-text-secondary)",
          }}
        />
      </div>
    </Card>
  );
}
