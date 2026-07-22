export interface PriceDisplayProps {
  readonly amount: string;
  /** Passed through verbatim — callers own whatever leading space/slash their period text needs. */
  readonly period: string;
  readonly size?: "sm" | "lg";
  readonly className?: string;
}

const SIZE_CLASS: Record<NonNullable<PriceDisplayProps["size"]>, string> = {
  // The Studio tier row's price ("$49/mo") is 21px/-0.42px letter-spacing on
  // the design mock — off Astryx's text-lg (17px) scale step, so pinned to
  // the exact value with `!` to win over the unconditional `tracking-tight`
  // below.
  sm: "!text-[21px] !tracking-[-0.42px]",
  lg: "text-2xl",
};

/**
 * The bold amount + muted period pairing used by both the landing page's
 * preview cards ("$49 /mo") and Studio's pricing tier rows ("$49/mo").
 */
export function PriceDisplay({ amount, period, size = "lg", className = "" }: PriceDisplayProps) {
  return (
    <span className={`font-heading ${SIZE_CLASS[size]} font-semibold tracking-tight ${className}`}>
      {amount}
      <span className="text-xs font-normal text-secondary">{period}</span>
    </span>
  );
}
