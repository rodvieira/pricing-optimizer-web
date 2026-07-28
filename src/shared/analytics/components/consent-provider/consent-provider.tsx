"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

export const CONSENT_STORAGE_KEY = "pricing-optimizer-consent";

export type ConsentStatus = "unknown" | "granted" | "denied";

interface ConsentContextValue {
  status: ConsentStatus;
  setStatus: (status: "granted" | "denied") => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readStoredStatus(): ConsentStatus {
  const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return stored === "granted" || stored === "denied" ? stored : "unknown";
}

/**
 * Owns whether the visitor has consented to analytics — no second,
 * unsynchronized consent owner. `status` always starts `"unknown"`,
 * including on the very first client render, and only corrects from
 * `localStorage` in the effect below, run after mount — the same
 * hydration-safe shape `LocaleProvider` uses (see
 * specs/004-pt-br-localization's ADR-0019): reading `localStorage` as a
 * lazy initializer instead made a returning visitor's first client render
 * disagree with the server-rendered markup (whether the consent banner is
 * present), which React always flags as a real hydration error for content
 * like this, not a soft warning. The one-render banner flash this causes
 * for a returning visitor who already decided is the accepted trade-off,
 * not a bug (see ADR-0020).
 */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatusState] = useState<ConsentStatus>("unknown");

  useEffect(() => {
    setStatusState(readStoredStatus());
  }, []);

  const setStatus = (next: "granted" | "denied") => {
    setStatusState(next);
    window.localStorage.setItem(CONSENT_STORAGE_KEY, next);
  };

  return (
    <ConsentContext.Provider value={{ status, setStatus }}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
}
