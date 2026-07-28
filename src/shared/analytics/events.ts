import { sendGAEvent } from "@next/third-parties/google";
import type { ExportFormat } from "@/shared/domain";
import { CONSENT_STORAGE_KEY } from "./components/consent-provider";

/**
 * `sendGAEvent` itself `console.warn`s if GA was never initialized (no
 * measurement ID configured, or the visitor never granted consent) — every
 * event-tracking call below checks stored consent first, so a real visitor
 * without consent produces zero console output and zero network activity,
 * not just zero *stored* analytics data (see ADR-0020).
 */
function hasConsent(): boolean {
  return (
    typeof window !== "undefined" && window.localStorage.getItem(CONSENT_STORAGE_KEY) === "granted"
  );
}

/** A visitor submitted a product URL for analysis (manual entry or a `?url=` deep link). */
export function trackUrlSubmitted(): void {
  if (hasConsent()) sendGAEvent("event", "url_submitted");
}

/** A generation reached "done" — all three strategy variations are available. */
export function trackGenerationCompleted(): void {
  if (hasConsent()) sendGAEvent("event", "generation_completed");
}

/** A visitor successfully exported a variation in the given format. */
export function trackExportTriggered(format: ExportFormat): void {
  if (hasConsent()) sendGAEvent("event", "export_triggered", { format });
}
