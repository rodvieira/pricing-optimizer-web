"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { urlInputSchema } from "@/features/url-input";

export interface StudioAutoRunProps {
  readonly onUrl: (url: string) => void;
}

/**
 * Isolates the one `useSearchParams()` read Studio needs (the landing hero's
 * "Watch a live run" `?url=` deep link) into its own leaf, rendered inside
 * its own `<Suspense>` in studio-page.tsx.
 *
 * Reading it at the top of StudioPage itself — the previous approach — forces
 * Next.js to treat the *entire* page as dynamic-only content with no static
 * fallback, so the static HTML shell (heading, URL bar, empty state) is
 * empty and nothing paints until the JS bundle hydrates. Measured impact
 * (issue #5): ~90 Lighthouse performance score on `/studio` even against the
 * real Vercel deployment, LCP breakdown showing hundreds of ms of
 * "element render delay" with no corresponding network cost. Moving the hook
 * here lets the rest of the page render immediately from the static shell;
 * this leaf renders nothing and only fires the auto-run once search params
 * resolve on the client.
 */
export function StudioAutoRun({ onUrl }: StudioAutoRunProps) {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current || !url) return;
    handled.current = true;
    // Report the raw query value (e.g. "stripe.com"), not the schema's
    // https:// -normalized one — the field already shows a static "https://"
    // prefix beside it, so displaying the normalized form would duplicate
    // it. studio-page.tsx re-derives the normalized URL for the actual
    // analyze call.
    if (urlInputSchema.safeParse({ url }).success) onUrl(url);
  }, [url, onUrl]);

  return null;
}
