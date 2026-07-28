import { Button } from "../primitives/button";

export interface CardActionButtonProps {
  readonly label: string;
  readonly isDisabled?: boolean;
  readonly onClick?: () => void;
}

/**
 * Compact action button for a card's footer row (the variation card's
 * Export button). Consolidates the padding/radius/font-size sizing each call
 * site would otherwise duplicate as its own inline style object. Used to
 * take a `variant` prop ("primary"/"secondary") back when the footer also
 * had an Edit-inline button; removed along with that button (that stub
 * never got real behavior) since "secondary" had no other caller.
 */
export function CardActionButton({ label, isDisabled, onClick }: CardActionButtonProps) {
  return (
    <Button
      label={label}
      variant="primary"
      size="sm"
      isDisabled={isDisabled}
      onClick={onClick}
      className="flex-1"
      style={{
        padding: 9,
        borderRadius: 8,
        fontSize: "var(--po-text-compact-control)",
        fontWeight: 600,
        height: "auto",
      }}
    />
  );
}
