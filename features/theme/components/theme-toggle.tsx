"use client";

import { IconButton } from "@astryxdesign/core";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "./theme-mode-provider";

/** Cycles light -> dark -> system -> light. */
export function ThemeToggle() {
  const { mode, setMode } = useThemeMode();

  const next = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
  const Icon = mode === "dark" ? Moon : Sun;

  return (
    <IconButton
      label={`Switch to ${next} theme (current: ${mode})`}
      icon={<Icon size={18} />}
      onClick={() => setMode(next)}
      variant="secondary"
    />
  );
}
