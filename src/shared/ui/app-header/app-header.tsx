import Link from "next/link";
import { SettingsPopover } from "./components/settings-popover";

/**
 * The Overview/Studio nav pills this header used to render are gone (issue
 * #44) — both routes stay reachable without them: the wordmark below already
 * links home, and the landing page's hero has its own "Open the Studio" CTA
 * (`views/landing/components/hero/hero.tsx`). Direct in-header navigation
 * wasn't pulling its weight against the header space the three controls
 * (nav, language, theme) competed for, for a single-page-flow product.
 *
 * No "use client" here: the only interactive piece, SettingsPopover, carries
 * its own directive, so this component itself stays server-rendered.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span aria-hidden className="flex h-[18px] items-end gap-[3px]">
            <span className="h-[9px] w-1" style={{ background: "var(--color-icon-orange)" }} />
            <span className="h-[18px] w-1" style={{ background: "var(--color-icon-teal)" }} />
            <span className="h-[13px] w-1" style={{ background: "var(--color-icon-pink)" }} />
          </span>
          {/* Wordmark uses the heading face (Bricolage Grotesque), matching the mock. */}
          <span className="font-heading text-[15px] font-semibold tracking-tight text-primary">
            Pricing Optimizer
          </span>
          {/* Hidden on mobile to keep the header to one compact row — a
              version badge isn't essential information at that width. */}
          <span className="hidden rounded border border-border-strong px-1.5 py-0.5 font-mono text-[14px] tracking-wide text-secondary sm:inline-block">
            v1.0
          </span>
        </Link>
        <SettingsPopover />
      </div>
    </header>
  );
}
