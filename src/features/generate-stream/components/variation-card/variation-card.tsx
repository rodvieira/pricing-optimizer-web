"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { strategyMeta } from "@/entities/strategy";
import { problemMessageKey } from "@/shared/api/problem-message";
import type { PricingStrategy, StrategyGenerationState } from "@/shared/domain";
import {
  Alert,
  Card,
  CardActionButton,
  ColorDot,
  Eyebrow,
  PanelHeader,
  Skeleton,
} from "@/shared/ui";
import { PricingTierRow } from "../pricing-tier-row/pricing-tier-row";

export interface VariationCardProps {
  readonly strategy: PricingStrategy;
  readonly strategyState: StrategyGenerationState | undefined;
  readonly isSlow: boolean;
  readonly hoveredTierIndex: number | null;
  readonly onHoverTier: (tierIndex: number) => void;
  readonly onExport: () => void;
}

function useStatusLabel(state: StrategyGenerationState | undefined, isSlow: boolean): string {
  const t = useTranslations("generateStream.status");
  if (!state || state.status === "pending") return t("queued");
  if (state.status === "completed") return t("ready");
  if (state.status === "error") return t("failed");
  return isSlow ? t("slow") : t("generating");
}

function Rationale({ state }: { readonly state: StrategyGenerationState | undefined }) {
  const t = useTranslations("errors");
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
  return (
    <Alert
      status="error"
      title={t(problemMessageKey(state.problem))}
      description={state.problem.detail}
    />
  );
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
  const t = useTranslations("generateStream");
  const tStrategy = useTranslations("strategy");
  const statusLabel = useStatusLabel(strategyState, isSlow);
  const isComplete = strategyState?.status === "completed";

  return (
    <Card
      style={{
        borderTopWidth: 2,
        borderTopColor: `var(--color-icon-${meta.variant})`,
        borderRadius: "2px 2px 12px 12px",
      }}
    >
      <PanelHeader>
        <ColorDot color={meta.variant} />
        <span className="font-heading text-[14.5px] font-semibold">
          {tStrategy(`${meta.strategy}.label`)}
        </span>
        <Eyebrow tone="secondary" className="ml-auto">
          {statusLabel}
        </Eyebrow>
      </PanelHeader>

      <div className="min-h-[76px] border-b border-border px-4 py-3">
        <Eyebrow tone="secondary" className="mb-2">
          {t("rationaleLabel")}
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
            {t("slowBanner")}
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
        <CardActionButton label={t("exportLabel")} isDisabled={!isComplete} onClick={onExport} />
      </div>
    </Card>
  );
}
