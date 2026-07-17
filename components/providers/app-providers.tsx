"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { ThemeModeProvider } from "@/features/theme/components/theme-mode-provider";
import { QueryProvider } from "@/lib/query-provider";

/**
 * All cross-cutting client providers this app needs, composed in one place so
 * app/layout.tsx stays a thin Next.js document shell.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeModeProvider>
        {/* reducedMotion="user" makes every animation in the app respect prefers-reduced-motion automatically */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </ThemeModeProvider>
    </QueryProvider>
  );
}
