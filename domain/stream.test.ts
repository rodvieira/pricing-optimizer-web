import { describe, expect, it } from "vitest";
import { generationToStreamState, initialGenerateStreamState, streamReducer } from "./stream";
import type { Generation } from "./types/generation";

const generation: Generation = {
  id: "gen-1",
  sourceUrl: "https://flowbase.com",
  status: "completed",
  createdAt: "2026-07-10T12:00:00.000Z",
  variations: [
    { id: "v1", strategy: "anchor", headline: "Anchor pricing", tiers: [] },
    { id: "v2", strategy: "freemium", headline: "Freemium ladder", tiers: [] },
  ],
};

describe("streamReducer", () => {
  it("stores the full generation payload on done", () => {
    const state = streamReducer(initialGenerateStreamState(), { type: "done", generation });

    expect(state.status).toBe("done");
    expect(state.generation).toBe(generation);
  });

  it("demultiplexes tokens into the right strategy's partial text", () => {
    let state = initialGenerateStreamState();
    state = streamReducer(state, { type: "variation_started", strategy: "anchor" });
    state = streamReducer(state, { type: "token", strategy: "anchor", delta: "Hello" });
    state = streamReducer(state, { type: "token", strategy: "anchor", delta: " world" });

    expect(state.strategies.anchor).toEqual({ status: "streaming", partialText: "Hello world" });
  });
});

describe("generationToStreamState", () => {
  it("marks every variation's strategy as completed and the stream as done", () => {
    const state = generationToStreamState(generation);

    expect(state.generationId).toBe("gen-1");
    expect(state.status).toBe("done");
    expect(state.generation).toBe(generation);
    expect(state.strategies.anchor).toEqual({
      status: "completed",
      variation: generation.variations[0],
    });
    expect(state.strategies.freemium).toEqual({
      status: "completed",
      variation: generation.variations[1],
    });
    expect(state.strategies.value_based).toBeUndefined();
  });
});
