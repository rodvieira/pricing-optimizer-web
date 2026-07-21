import { Badge, Button } from "@astryxdesign/core";
import { CheckGlyph } from "@/components/ui/color-dot";
import { PriceDisplay } from "@/components/ui/price-display";
import type { PricingTier } from "@/domain";

function formatPrice(tier: PricingTier): { amount: string; period: string } {
  if (tier.price.customLabel) {
    return { amount: tier.price.customLabel, period: "" };
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: tier.price.currency,
    minimumFractionDigits: tier.price.amount % 100 === 0 ? 0 : 2,
  }).format(tier.price.amount / 100);

  let period = "";
  if (tier.price.interval === "monthly") period = "/mo";
  else if (tier.price.interval === "yearly") period = "/yr";

  return { amount: formatted, period };
}

export interface PricingTierRowProps {
  readonly tier: PricingTier;
  readonly strategyVariant: "orange" | "teal" | "pink";
  readonly isHighlighted: boolean;
  readonly onHoverStart: () => void;
}

export function PricingTierRow({
  tier,
  strategyVariant,
  isHighlighted,
  onHoverStart,
}: PricingTierRowProps) {
  const { amount, period } = formatPrice(tier);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover-only highlight is a visual aid layered on tiers whose content is already fully readable without it — no keyboard/screen-reader equivalent is needed.
    <div
      onMouseEnter={onHoverStart}
      className={`flex flex-col gap-2 rounded-lg border-t border-border px-2 py-3 transition-colors first:border-t-0 ${
        isHighlighted ? "bg-muted" : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-heading text-sm font-semibold">{tier.name}</span>
          {tier.highlighted && (
            <Badge variant={strategyVariant} label={tier.badge ?? "Most popular"} />
          )}
        </div>
        <PriceDisplay amount={amount} period={period} size="sm" />
      </div>
      <ul className="flex flex-col gap-1 text-xs text-secondary">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <CheckGlyph color={strategyVariant} />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        label={tier.cta ?? "Choose plan"}
        variant={tier.highlighted ? "primary" : "secondary"}
        size="sm"
      />
    </div>
  );
}
