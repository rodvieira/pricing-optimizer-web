export interface PriceDisplayProps {
  readonly amount: string;
  /** Passed through verbatim — callers own whatever leading space/slash their period text needs. */
  readonly period: string;
  readonly size?: "sm" | "lg";
  readonly className?: string;
}

const SIZE_CLASS: Record<NonNullable<PriceDisplayProps["size"]>, string> = {
  sm: "text-lg",
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
