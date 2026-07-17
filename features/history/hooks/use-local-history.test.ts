import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Generation } from "@/domain";
import { readHistory } from "../local-history-storage";
import { useLocalHistory } from "./use-local-history";

function generation(id: string): Generation {
  return { id, sourceUrl: `https://${id}.com`, status: "completed", createdAt: "", variations: [] };
}

describe("useLocalHistory", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads existing history on mount", async () => {
    window.localStorage.setItem(
      "pricing-optimizer-history",
      JSON.stringify([generation("existing")]),
    );

    const { result } = renderHook(() => useLocalHistory());

    await waitFor(() => expect(result.current.history).toHaveLength(1));
    expect(result.current.history[0]?.id).toBe("existing");
  });

  it("adds a generation and persists it to localStorage", async () => {
    const { result } = renderHook(() => useLocalHistory());
    await waitFor(() => expect(result.current.history).toEqual([]));

    act(() => result.current.addGeneration(generation("new")));

    await waitFor(() => expect(result.current.history).toHaveLength(1));
    expect(readHistory().map((g) => g.id)).toEqual(["new"]);
  });

  it("clears history from both state and storage", async () => {
    const { result } = renderHook(() => useLocalHistory());
    act(() => result.current.addGeneration(generation("new")));
    await waitFor(() => expect(result.current.history).toHaveLength(1));

    act(() => result.current.clearHistory());

    expect(result.current.history).toEqual([]);
    expect(readHistory()).toEqual([]);
  });
});
