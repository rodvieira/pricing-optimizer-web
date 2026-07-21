import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

/**
 * Extends Astryx's neutral theme to match docs/design/Pricing Optimizer.html.
 * neutral ships a cool gray palette; the mock is a bespoke warm one, so this
 * overrides the full set of color tokens it actually uses (text, borders,
 * accent, the strategy trio, success) plus typography — everything measured
 * off the mock via getComputedStyle, not eyeballed. Motion, body scale and
 * unused categorical colors stay neutral's default.
 *
 * Contrast note: several warm text colors here (the amber/teal numbered
 * labels, the rust hero eyebrow, the muted ribbon) fall below WCAG AA 4.5:1
 * on the cream background. This is a deliberate, owner-approved decision to
 * match the mock exactly; the axe-core color-contrast rule is correspondingly
 * disabled in the e2e suite (see test/e2e/*.spec.ts). This intentionally
 * departs from CLAUDE.md's contrast discipline for pixel fidelity.
 *
 * neutralTheme hardcodes typography.heading.family to 'Figtree' (the same
 * as body) — this app loads Bricolage Grotesque for headings via next/font
 * in app/layout.tsx (`--font-heading-family`), but neutralTheme's own
 * runtime-injected StyleX rules override that CSS variable, so every
 * heading rendered in Figtree at font-weight 400 regardless. Overriding
 * `typography.heading.family` here (not a CSS rule — see the background-
 * token comment on why that doesn't work) is what actually fixes it.
 *
 * Font-size/weight numbers below are read directly off the design mock via
 * getComputedStyle, not eyeballed: display-1 (landing hero) is 60px/600
 * there vs this theme's default 42px/400; display-3 (Studio page heading)
 * is 28px/600 vs 29px/400. Letter-spacing (-2.1px / -0.7px) has no semantic
 * token — set via a `components.text` override instead, keyed the same way
 * Text reads its `type` prop (see @astryxdesign/core's Text.js `themeProps`
 * call).
 */
export const pricingOptimizerTheme = defineTheme({
  name: "pricing-optimizer",
  extends: neutralTheme,
  typography: {
    heading: {
      family: "Bricolage Grotesque",
      fallbacks: "sans-serif",
    },
    body: {
      family: "IBM Plex Sans",
      fallbacks: "system-ui, sans-serif",
    },
    // neutralTheme leaves --font-family-code unset, so mono text fell back to
    // the browser's ui-monospace stack instead of IBM Plex Sans's companion.
    // Set it explicitly so every mono label (eyebrows, prices' /mo, ribbon)
    // renders in IBM Plex Mono, matching the mock.
    code: {
      family: "IBM Plex Mono",
      fallbacks: "ui-monospace, monospace",
    },
  },
  // Light values are read straight off docs/design/Pricing Optimizer.html via
  // getComputedStyle. neutral's palette is cool/gray; the mock is a bespoke
  // WARM palette, which is the bulk of the visual mismatch. Dark-mode slots
  // deliberately keep neutral's own dark values unchanged — the mock only
  // specifies a light design, and reusing neutral's vetted dark values avoids
  // inventing an unverified warm-dark ramp.
  tokens: {
    "--color-background-body": ["#f7f4ee", "#141518"],
    "--color-background-surface": ["#fffdf9", "#1b1d21"],
    "--color-background-card": ["#fffdf9", "#1b1d21"],
    "--color-background-popover": ["#fffdf9", "#1b1d21"],
    "--color-background-muted": ["#f2efe7", "#212429"],
    // Warm text + borders (mock light / neutral dark).
    "--color-text-primary": ["#1d1a15", "#fafafa"],
    "--color-text-secondary": ["#5b574e", "#a3a3a3"],
    "--color-border": ["#e3ddd0", "#FFFFFF1A"],
    "--color-border-emphasized": ["#cec7b7", "#525252"],
    // Primary surface (buttons/accent) is the warm near-black, not neutral #262626.
    "--color-accent": ["#1d1a15", "#ebebeb"],
    // Strategy accents — the vibrant warm trio the mock uses for the anchor/
    // freemium/value borders, dots, numbered labels and the logo bars.
    "--color-icon-orange": ["#a97812", "#ffa258"],
    "--color-icon-teal": ["#13867a", "#7ec6b8"],
    "--color-icon-pink": ["#ad4a63", "#ff99c3"],
    // Preview checkmarks — mock's brighter green over neutral's dark #007004.
    "--color-success": ["#2f9d5b", "#9fe59b"],
    "--text-display-1-size": "3.75rem",
    "--text-display-1-weight": "600",
    "--text-display-1-leading": "1.02",
    "--text-display-3-weight": "600",
  },
  components: {
    text: {
      "type:display-1": { letterSpacing: "-2.1px" },
      "type:display-3": { letterSpacing: "-0.7px" },
    },
  },
});
