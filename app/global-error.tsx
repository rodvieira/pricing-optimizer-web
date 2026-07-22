"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

/**
 * App Router's root error boundary — the one place a render error in the
 * root layout itself would otherwise be invisible to Sentry (instrumentation
 * hooks cover request/server errors, but not this). Required by Sentry's own
 * Next.js setup docs. Renders Next's built-in error page since this replaces
 * the root layout entirely when it fires.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
