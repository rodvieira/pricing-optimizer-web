"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "../../theme-init-script";

type ThemeMode = "light" | "dark";

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

/** Writes `data-theme` and `color-scheme` on <html> for the given mode. */
function applyMode(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}

/**
 * Reads the same stored/OS resolution theme-init-script.ts already applied
 * to <html> before hydration, as this component's initial state — so the
 * first post-hydration `applyMode` effect re-applies the value already on
 * the page instead of briefly overwriting it with the "light" default.
 */
function hasStoredMode(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark";
}

function resolveInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Owns `data-theme`/`color-scheme` on <html> directly — no second,
 * unsynchronized color-mode owner (introducing next-themes alongside this
 * would be exactly that).
 *
 * The toggle itself is binary (light/dark only, no "system" option) — but an
 * unset preference still follows the OS scheme, per the original design brief.
 * `hasExplicitPreference` tracks whether the user has ever picked a mode
 * themselves; until they do, `mode` keeps following OS changes live.
 */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(resolveInitialMode);
  const [hasExplicitPreference, setHasExplicitPreference] = useState(hasStoredMode);

  useEffect(() => {
    if (hasExplicitPreference) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setModeState(media.matches ? "dark" : "light");
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [hasExplicitPreference]);

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    setHasExplicitPreference(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>{children}</ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeModeProvider");
  }
  return context;
}
