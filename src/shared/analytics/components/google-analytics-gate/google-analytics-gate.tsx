"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useConsent } from "../consent-provider";

/**
 * Mounts GA4 only once both conditions hold: the visitor has granted
 * consent, and a measurement ID is actually configured (local dev and PR
 * previews leave it unset, mirroring how Sentry is already gated off by an
 * unset DSN in instrumentation-client.ts). Real branching logic of its own
 * (unlike Sentry's plain `Sentry.init()` call), so — per this repo's own
 * testing bar — it earns a test rather than an exclusion.
 */
export function GoogleAnalyticsGate() {
  const { status } = useConsent();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (status !== "granted" || !gaId) return null;

  return <GoogleAnalytics gaId={gaId} />;
}
