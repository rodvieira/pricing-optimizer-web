"use client";

import { Button } from "@astryxdesign/core";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "./theme-mode-provider";

const MODE_LABEL: Record<"light" | "dark" | "system", string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

/** Cycles light -> dark -> system -> light. */
export function ThemeToggle() {
  const { mode, setMode } = useThemeMode();

  const next = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
  const Icon = mode === "dark" ? Moon : Sun;

  return (
    <Button
      label={`Switch to ${next} theme (current: ${mode})`}
      icon={<Icon size={14} />}
      onClick={() => setMode(next)}
      variant="secondary"
      size="sm"
      className="font-mono text-[11px] tracking-wide"
    >
      {MODE_LABEL[mode]}
    </Button>
  );
}
