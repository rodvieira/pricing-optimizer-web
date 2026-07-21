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
    var stored = window.localStorage.getItem("${THEME_STORAGE_KEY}");
    var resolved = (stored === "light" || stored === "dark")
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", resolved);
  } catch (e) {}
})();
`;
