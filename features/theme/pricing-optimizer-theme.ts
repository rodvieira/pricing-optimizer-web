import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

/**
 * Extends Astryx's neutral theme with the warm cream/dark background from
 * the original design mock (docs/design/Pricing Optimizer.dc.html's
 * --bg/--panel/--panel-2 tokens) instead of neutral's default gray/white —
 * the one deliberate color deviation, confirmed with Rodrigo rather than
 * assumed. Everything else (typography, motion, categorical/status colors,
 * icons) stays neutral's default; `extends` only requires overriding the
 * tokens that actually change.
 */
export const pricingOptimizerTheme = defineTheme({
  name: "pricing-optimizer",
  extends: neutralTheme,
  tokens: {
    "--color-background-body": ["#f7f4ee", "#141518"],
    "--color-background-surface": ["#fffdf9", "#1b1d21"],
    "--color-background-card": ["#fffdf9", "#1b1d21"],
    "--color-background-popover": ["#fffdf9", "#1b1d21"],
    "--color-background-muted": ["#f2efe7", "#212429"],
  },
});
