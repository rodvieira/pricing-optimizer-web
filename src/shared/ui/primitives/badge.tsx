import type { CSSProperties } from "react";
import { cn } from "../lib/cn";

export interface BadgeProps {
  readonly label: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * Vendored replacement for Astryx's Badge. Its one current caller
 * (pricing-tier-row) passes a full `style` override (background, border,
 * color all computed from `--color-icon-{variant}`), so this only supplies
 * the shared inline shape — no `variant` prop, since nothing would read it.
 */
export function Badge({ label, className, style }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs",
        className,
      )}
      style={style}
    >
      {label}
    </span>
  );
}
