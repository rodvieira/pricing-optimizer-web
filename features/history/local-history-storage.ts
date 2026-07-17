import { type Generation, MAX_HISTORY_ENTRIES } from "@/domain";

export const HISTORY_STORAGE_KEY = "pricing-optimizer-history";

/**
 * Structural check only, not a full schema validation — this is data the
 * app itself wrote, not external input. Guards against a stale shape from
 * an older app version (or hand-edited storage) crashing the reader instead
 * of just falling back to empty history.
 */
function isGeneration(value: unknown): value is Generation {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Generation).id === "string" &&
    typeof (value as Generation).sourceUrl === "string" &&
    Array.isArray((value as Generation).variations)
  );
}

export function readHistory(): Generation[] {
  const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isGeneration).slice(0, MAX_HISTORY_ENTRIES);
  } catch {
    return [];
  }
}

export function writeHistory(history: Generation[]): void {
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}
