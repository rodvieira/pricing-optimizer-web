import { Button } from "@astryxdesign/core";
import type { CSSProperties } from "react";

export type CardActionVariant = "primary" | "secondary";

const VARIANT_STYLE: Record<CardActionVariant, CSSProperties> = {
  primary: { padding: 9, borderRadius: 8, fontSize: 12.5, fontWeight: 600, height: "auto" },
  secondary: {
    padding: 9,
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 500,
    height: "auto",
    // A deliberate departure from Astryx's own "secondary" look at this
    // compact size — a subtler outline than the default filled/bordered
    // secondary button reads better in a card footer this dense.
    backgroundColor: "transparent",
    border: "1px solid var(--color-border-emphasized)",
    color: "var(--color-text-secondary)",
  },
};

export interface CardActionButtonProps {
  readonly label: string;
  readonly variant: CardActionVariant;
  readonly isDisabled?: boolean;
  readonly onClick?: () => void;
}

/**
 * Compact, evenly-split action button for a card's footer row (the
 * variation card's Export / Edit inline pair). Consolidates the padding/
 * radius/font-size sizing and the "secondary" outline styling that each
 * call site previously duplicated as its own inline style object. Always
 * `flex-1` — every current caller sits in a flex row splitting the width
 * evenly; add a `className` prop back if a caller ever needs something else.
 */
export function CardActionButton({ label, variant, isDisabled, onClick }: CardActionButtonProps) {
  return (
    <Button
      label={label}
      variant={variant}
      size="sm"
      isDisabled={isDisabled}
      onClick={onClick}
      className="flex-1"
      style={VARIANT_STYLE[variant]}
    />
  );
}
