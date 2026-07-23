"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { QueryProvider } from "@/shared/providers/query-provider";
import { ThemeModeProvider } from "@/shared/theme";

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
