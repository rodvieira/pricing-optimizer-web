/** localStorage key shared between the init script below and ThemeModeProvider. */
export const THEME_STORAGE_KEY = "pricing-optimizer-theme-mode";

/**
 * Inline, render-blocking script for the root layout's <head> — reads the
 * stored mode synchronously before hydration and sets data-theme on <html>,
 * avoiding a flash of the wrong theme. Astryx's <Theme> re-syncs this
 * attribute once it mounts; this only covers the gap before that.
 */
export const themeModeInitScript = `
(function() {
  try {
    var mode = window.localStorage.getItem("${THEME_STORAGE_KEY}") || "system";
    var resolved = mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
    document.documentElement.setAttribute("data-theme", resolved);
  } catch (e) {}
})();
`;
