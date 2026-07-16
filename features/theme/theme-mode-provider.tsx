"use client";

import { Theme } from "@astryxdesign/core";
import { neutralTheme } from "@astryxdesign/theme-neutral";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "pricing-optimizer-theme-mode";

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
 */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      setModeState(stored);
    }
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>
      <Theme theme={neutralTheme} mode={mode}>
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

/**
 * Inline, render-blocking script for the root layout's <head> — reads the
 * stored mode synchronously before hydration and sets data-theme on <html>,
 * avoiding a flash of the wrong theme. Astryx's <Theme> re-syncs this
 * attribute once it mounts; this only covers the gap before that.
 */
export const themeModeInitScript = `
(function() {
  try {
    var mode = window.localStorage.getItem("${STORAGE_KEY}") || "system";
    var resolved = mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
    document.documentElement.setAttribute("data-theme", resolved);
  } catch (e) {}
})();
`;
