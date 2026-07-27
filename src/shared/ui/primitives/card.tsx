import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * A bordered, rounded, unpadded surface. No `padding` prop — every current
 * caller manages its own spacing.
 */
export function Card({ children, className, style }: CardProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}
      style={style}
    >
      {children}
    </div>
  );
}
