"use client";

import { Theme } from "@astryxdesign/core";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { pricingOptimizerTheme } from "../pricing-optimizer-theme";
import { THEME_STORAGE_KEY } from "../theme-init-script";

type ThemeMode = "system" | "light" | "dark";

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
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      setModeState(stored);
    }
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
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
