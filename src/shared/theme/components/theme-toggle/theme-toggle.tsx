"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/shared/ui";
import { useThemeMode } from "../theme-mode-provider/theme-mode-provider";

const MODE_LABEL: Record<"light" | "dark", string> = {
  light: "Light",
  dark: "Dark",
};

/** Toggles light <-> dark. */
export function ThemeToggle() {
  const { mode, setMode } = useThemeMode();

  const next = mode === "light" ? "dark" : "light";
  const Icon = mode === "dark" ? Moon : Sun;

  return (
    <Button
      label={`Switch to ${next} theme (current: ${mode})`}
      icon={<Icon size={14} />}
      onClick={() => setMode(next)}
      variant="secondary"
      size="md"
      className="font-mono tracking-wide"
    >
      {MODE_LABEL[mode]}
    </Button>
  );
}
