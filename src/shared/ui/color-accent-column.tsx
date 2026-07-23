import type { ReactNode } from "react";
import type { SwatchColor } from "./color-dot";

export interface ColorAccentColumnProps {
  readonly color: SwatchColor;
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * A grid column with a strategy-colored top border and a hairline left
 * divider (dropped on the first column) — the layout the landing page's
 * product preview cards and strategy trio blocks both hand-rolled
 * identically. `className` carries only spacing/padding; the border classes
 * and top-border color are owned here.
 */
export function ColorAccentColumn({ color, className = "", children }: ColorAccentColumnProps) {
  return (
    <div
      className={`border-l border-t-2 border-border first:border-l-0 ${className}`}
      style={{ borderTopColor: `var(--color-icon-${color})` }}
    >
      {children}
    </div>
  );
}
