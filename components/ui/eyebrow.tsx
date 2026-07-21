import type { CSSProperties, ReactNode } from "react";

export type EyebrowTone = "accent" | "secondary" | "inherit";

const TONE_CLASS: Record<EyebrowTone, string> = {
  accent: "text-accent",
  secondary: "text-secondary",
  inherit: "",
};

export interface EyebrowProps {
  readonly children: ReactNode;
  readonly tone?: EyebrowTone;
  readonly withRule?: boolean;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * Small tracked-out mono label — the "PSYCHOLOGY-DRIVEN PRICING" / "ANCHOR" /
 * "01 · Anchor pricing" / "ready" / "STRATEGY RATIONALE" text style used
 * across the landing page and Studio. Consolidates a font-mono/tracking/size
 * combo that had drifted to 3 different sizes and 2 tracking values across
 * call sites with no semantic reason for the difference.
 */
export function Eyebrow({
  children,
  tone = "secondary",
  withRule = false,
  className = "",
  style,
}: EyebrowProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-[11px] tracking-widest ${TONE_CLASS[tone]} ${className}`}
      style={style}
    >
      {withRule && <span aria-hidden className="h-px w-6 bg-accent" />}
      {children}
    </span>
  );
}
