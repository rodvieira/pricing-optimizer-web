import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

/**
 * Extends Astryx's neutral theme to match docs/design/Pricing Optimizer.html
 * — background palette, and heading typography, both confirmed as real
 * deviations (not accepted tradeoffs) rather than assumed. Everything else
 * (motion, categorical/status colors, icons, body scale) stays neutral's
 * default; `extends` only requires overriding what actually changes.
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
  },
  tokens: {
    "--color-background-body": ["#f7f4ee", "#141518"],
    "--color-background-surface": ["#fffdf9", "#1b1d21"],
    "--color-background-card": ["#fffdf9", "#1b1d21"],
    "--color-background-popover": ["#fffdf9", "#1b1d21"],
    "--color-background-muted": ["#f2efe7", "#212429"],
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
