import * as Sentry from "@sentry/nextjs";

// Server/edge counterpart to instrumentation-client.ts — same DSN-presence
// gating, no-op locally without NEXT_PUBLIC_SENTRY_DSN set.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
