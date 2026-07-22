import * as Sentry from "@sentry/nextjs";

// Gated on the DSN's presence, same pattern as the backend's OTel setup
// (pricing-optimizer-api's ADR-0007): local dev has no DSN configured by
// default, and Sentry.init with an empty dsn is a documented no-op (the SDK
// itself skips network calls), so this stays silent rather than erroring.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
