"use client";

import { Theme } from "@astryxdesign/core";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
// The pre-built theme object (has __built: true) so <Theme> skips runtime style
// injection — the CSS is shipped statically via app/globals.css. Regenerate
// both with `pnpm build:theme` after editing pricing-optimizer-theme.ts.
import { pricingOptimizerTheme } from "../generated/pricing-optimizer";
import { THEME_STORAGE_KEY } from "../theme-init-script";

type ThemeMode = "light" | "dark";

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

/**
 * Owns the `mode` state Astryx's <Theme> is driven by. Astryx has no
 * built-in setter/toggle — <Theme mode> is read-only from its perspective,
 * so a manual toggle means we own this one small piece of state ourselves
 * and pass it down, rather than introducing next-themes as a second,
 * unsynchronized color-mode owner (Astryx's own docs warn against that).
 *
 * The toggle itself is binary (light/dark only, no "system" option) — but an
 * unset preference still follows the OS scheme, per the original design brief.
 * `hasExplicitPreference` tracks whether the user has ever picked a mode
 * themselves; until they do, `mode` keeps following OS changes live.
 */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [hasExplicitPreference, setHasExplicitPreference] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setModeState(stored);
      setHasExplicitPreference(true);
      return;
    }
    setModeState(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (hasExplicitPreference) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setModeState(media.matches ? "dark" : "light");
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [hasExplicitPreference]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    setHasExplicitPreference(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>
      <Theme theme={pricingOptimizerTheme} mode={mode}>
        {children}
      </Theme>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeModeProvider");
  }
  return context;
}
