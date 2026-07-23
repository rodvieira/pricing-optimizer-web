import { beforeEach, describe, expect, it } from "vitest";
import type { Generation } from "@/shared/domain";
import { HISTORY_STORAGE_KEY, readHistory, writeHistory } from "./local-history-storage";

function generation(id: string): Generation {
  return { id, sourceUrl: `https://${id}.com`, status: "completed", createdAt: "", variations: [] };
}

describe("readHistory / writeHistory", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns an empty array when nothing is stored", () => {
    expect(readHistory()).toEqual([]);
  });

  it("round-trips a written history", () => {
    writeHistory([generation("a"), generation("b")]);
    expect(readHistory().map((g) => g.id)).toEqual(["a", "b"]);
  });

  it("falls back to an empty array for malformed JSON", () => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, "{not json");
    expect(readHistory()).toEqual([]);
  });

  it("falls back to an empty array when the stored value isn't an array", () => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({ not: "an array" }));
    expect(readHistory()).toEqual([]);
  });

  it("drops entries that don't structurally look like a Generation", () => {
    window.localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify([generation("a"), { id: 42 }, { sourceUrl: "no id" }, null]),
    );
    expect(readHistory().map((g) => g.id)).toEqual(["a"]);
  });
});
