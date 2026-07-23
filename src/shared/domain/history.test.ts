import { describe, expect, it } from "vitest";
import { addToHistory, MAX_HISTORY_ENTRIES } from "./history";
import type { Generation } from "./types/generation";

function generation(id: string): Generation {
  return { id, sourceUrl: `https://${id}.com`, status: "completed", createdAt: "", variations: [] };
}

describe("addToHistory", () => {
  it("prepends the new generation", () => {
    const result = addToHistory([generation("a")], generation("b"));
    expect(result.map((g) => g.id)).toEqual(["b", "a"]);
  });

  it("dedupes by id, keeping only the newest copy", () => {
    const result = addToHistory([generation("a"), generation("b")], generation("a"));
    expect(result.map((g) => g.id)).toEqual(["a", "b"]);
  });

  it(`trims to the last ${MAX_HISTORY_ENTRIES} entries`, () => {
    const existing = Array.from({ length: MAX_HISTORY_ENTRIES }, (_, i) => generation(`g${i}`));
    const result = addToHistory(existing, generation("new"));

    expect(result).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(result[0]?.id).toBe("new");
    expect(result.at(-1)?.id).toBe(`g${MAX_HISTORY_ENTRIES - 2}`);
  });
});
