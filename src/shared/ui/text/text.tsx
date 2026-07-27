import type { ElementType, ReactNode } from "react";
import { cn } from "../lib/cn";

export type TextType = "display-1" | "display-3" | "large" | "body" | "label" | "supporting";

const TYPE_CLASS: Record<TextType, string> = {
  "display-1": "font-heading text-4xl font-semibold",
  "display-3": "font-heading text-2xl font-semibold",
  large: "font-body text-lg",
  body: "font-body text-sm",
  label: "font-body font-medium text-sm",
  supporting: "font-body text-xs",
};

/** Default element per type when the caller doesn't pass `as` explicitly. */
const TYPE_DEFAULT_TAG: Record<TextType, ElementType> = {
  "display-1": "h2",
  "display-3": "h2",
  large: "p",
  body: "p",
  label: "span",
  supporting: "span",
};

export interface TextProps {
  readonly type: TextType;
  readonly color?: "primary" | "secondary";
  readonly as?: ElementType;
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * Owned typography component replacing Astryx's Text — shadcn/ui ships no
 * equivalent, so this preserves the exact type/color scale every call site
 * already relies on (display-1, display-3, large, body, label, supporting).
 * Every current caller also passes an explicit `className` for anything
 * more specific than these defaults (hero's per-breakpoint pixel sizes),
 * which `cn` merges over these base classes.
 */
export function Text({ type, color = "primary", as, className, children }: TextProps) {
  const Tag = as ?? TYPE_DEFAULT_TAG[type];
  const colorClass = color === "secondary" ? "text-secondary" : "text-primary";

  return <Tag className={cn(TYPE_CLASS[type], colorClass, className)}>{children}</Tag>;
}
