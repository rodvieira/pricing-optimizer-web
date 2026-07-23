import type { Generation } from "./types/generation";

export const MAX_HISTORY_ENTRIES = 10;

/** Prepends generation, dedupes by id, and trims to the last 10 — the business rule for local history, independent of where it's persisted (see features/history for the localStorage adapter). */
export function addToHistory(history: Generation[], generation: Generation): Generation[] {
  const withoutDuplicate = history.filter((g) => g.id !== generation.id);
  return [generation, ...withoutDuplicate].slice(0, MAX_HISTORY_ENTRIES);
}
