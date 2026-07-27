"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import enMessages from "../../messages/en.json";
import ptBrMessages from "../../messages/pt-BR.json";

export const LOCALE_STORAGE_KEY = "pricing-optimizer-locale";

export type Locale = "en" | "pt-BR";

const MESSAGES: Record<Locale, typeof enMessages> = {
  en: enMessages,
  "pt-BR": ptBrMessages,
};

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale | null {
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "en" || stored === "pt-BR" ? stored : null;
}

/**
 * Owns the selected UI language directly — no second, unsynchronized
 * locale owner. Binary (`"en" | "pt-BR"`), defaults to English, persisted to
 * `localStorage` only: no URL routing, no cookie, no `Accept-Language`
 * negotiation (spec Assumptions, ADR-0019).
 *
 * `locale` always starts as `"en"` — including on the very first client
 * render — and only corrects from `localStorage` in the effect below, run
 * after mount. Reading `localStorage` as a *lazy initializer* instead (the
 * pattern `ThemeModeProvider` uses for `data-theme`/`color-scheme`) was
 * tried first and was wrong here: an attribute mismatch on an element
 * carrying `suppressHydrationWarning` is silently tolerated, but a stored
 * `"pt-BR"` preference makes the very first client render produce different
 * *text content* than the server did, which React always flags as a real
 * hydration error, not a soft warning — caught by this repo's own e2e suite
 * (a returning pt-BR visitor navigating between routes triggered
 * `Hydration failed` in the browser console) before it shipped. The
 * one-render flash of English this causes for a returning pt-BR visitor is
 * the accepted trade-off from research.md R2 / ADR-0019 — deliberate, not
 * this bug.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored) setLocaleState(stored);
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {/*
        Explicit timeZone: this provider also renders during SSR/static
        generation (it's a Client Component, but Next.js still renders it
        once on the server for the initial HTML), and next-intl warns
        (IntlErrorCode.ENVIRONMENT_FALLBACK) if none is set, since a missing
        timeZone can make server- and client-rendered date/time output
        disagree. This app's own date formatting (history-panel.tsx's
        relative timestamps) uses native Intl.RelativeTimeFormat directly,
        not next-intl's formatter, so nothing here is actually
        timezone-sensitive today — set anyway to keep the build log clean
        and to be correct if a future addition does use next-intl's
        useFormatter for an absolute date/time.
      */}
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

/**
 * Named `useLocaleMode`, not `useLocale` — `next-intl` already exports its
 * own read-only `useLocale()` (resolves the current locale from context,
 * mirroring how Astryx's own `useTheme()` was read-only). This hook is the
 * read/write pair, the same distinction `useThemeMode` draws from Astryx's
 * `useTheme` for the same reason: avoid two same-named hooks with different
 * shapes reachable from this app.
 */
export function useLocaleMode(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleMode must be used within a LocaleProvider");
  }
  return context;
}
