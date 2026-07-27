/**
 * Studio empty state, matching the mock: a dashed-border panel with the
 * three-bar logo mark centered above the message. Replaces Astryx's plain
 * EmptyState so the dashed frame and brand mark match the design exactly.
 */
export function StudioEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong px-6 py-24 text-center">
      <span aria-hidden className="flex h-6 items-end gap-1">
        <span className="h-3 w-1.5 rounded-sm" style={{ background: "var(--color-icon-orange)" }} />
        <span className="h-6 w-1.5 rounded-sm" style={{ background: "var(--color-icon-teal)" }} />
        <span className="h-4 w-1.5 rounded-sm" style={{ background: "var(--color-icon-pink)" }} />
      </span>
      <h2 className="font-heading text-lg font-semibold text-primary">Nothing generated yet</h2>
      <p className="max-w-md text-sm text-secondary">
        Paste a product URL above to stream three pricing strategies side by side.
      </p>
    </div>
  );
}
