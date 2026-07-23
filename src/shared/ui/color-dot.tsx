/** The `--color-icon-{X}` tokens this app actually draws swatches/checks from. */
export type SwatchColor = "orange" | "teal" | "pink";

export interface ColorDotProps {
  readonly color: SwatchColor;
  readonly className?: string;
}

/**
 * Small round color swatch reading a `--color-icon-{color}` token. Used both
 * for the strategy-identity dot (variation card header, pricing-tier badge)
 * and standalone decorative dots (audience summary bar) that previously each
 * hand-wrote the same `style={{ background: var(--color-icon-X) }}` inline.
 */
export function ColorDot({ color, className = "h-2 w-2" }: ColorDotProps) {
  return (
    <span
      aria-hidden
      className={`inline-block rounded-full ${className}`}
      style={{ background: `var(--color-icon-${color})` }}
    />
  );
}

export interface CheckGlyphProps {
  readonly color?: SwatchColor;
  readonly className?: string;
}

/** The "✓" glyph used for feature-list checks and completion indicators. */
export function CheckGlyph({ color, className }: CheckGlyphProps) {
  return (
    <span
      aria-hidden
      className={className}
      style={color ? { color: `var(--color-icon-${color})` } : undefined}
    >
      ✓
    </span>
  );
}
