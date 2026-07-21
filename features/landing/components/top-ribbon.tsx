import { Eyebrow } from "@/components/ui/eyebrow";

/**
 * Thin mono ribbon between the header and hero, matching the mock: a product
 * label on the left and the positioning tagline on the right, in muted warm
 * gray with a hairline bottom rule.
 */
export function TopRibbon() {
  return (
    <div className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-3">
        <Eyebrow tone="muted">PRICING OPTIMIZER</Eyebrow>
        <Eyebrow tone="muted">PSYCHOLOGY-DRIVEN · SSE STREAMING</Eyebrow>
      </div>
    </div>
  );
}
