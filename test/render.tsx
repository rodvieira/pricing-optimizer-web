import { render as rtlRender } from "@testing-library/react";
import type { ReactElement } from "react";
import { LocaleProvider } from "@/shared/i18n";

/**
 * Design tokens (colors, sizes) are plain CSS custom properties defined in
 * app/globals.css, not a React context, so component tests need no provider
 * wrapper to read them. Translated text does need one — LocaleProvider
 * mirrors how AppProviders mounts it for real, defaulting to English (no
 * localStorage set in jsdom's test environment) — so any component reading
 * `useTranslations()` renders without crashing on a missing context.
 */
export function render(ui: ReactElement) {
  return rtlRender(<LocaleProvider>{ui}</LocaleProvider>);
}

export * from "@testing-library/react";
