import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * Vendored replacement for Astryx's Card: a bordered, rounded, unpadded
 * surface. No `padding` prop — every current caller manages its own spacing
 * and passed `padding={0}` to Astryx's Card for the same reason. `rounded-xl`
 * (12px) matches the default corner radius callers already assume when they
 * override only specific corners (see variation-card.tsx).
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
