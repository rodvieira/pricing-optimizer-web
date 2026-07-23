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

  it("starts a fresh partial text when a token arrives with no prior streaming state", () => {
    const state = streamReducer(initialGenerateStreamState(), {
      type: "token",
      strategy: "anchor",
      delta: "Hi",
    });

    expect(state.strategies.anchor).toEqual({ status: "streaming", partialText: "Hi" });
  });

  it("marks a strategy completed on variation_completed", () => {
    const variation = { id: "v1", strategy: "anchor" as const, headline: "H", tiers: [] };
    const state = streamReducer(initialGenerateStreamState(), {
      type: "variation_completed",
      variation,
    });

    expect(state.strategies.anchor).toEqual({ status: "completed", variation });
  });

  it("marks only the named strategy errored, leaving the top-level status untouched", () => {
    const problem = { title: "Model timeout", status: 504 };
    const state = streamReducer(initialGenerateStreamState(), {
      type: "error",
      strategy: "freemium",
      problem,
    });

    expect(state.strategies.freemium).toEqual({ status: "error", problem });
    expect(state.status).toBe("idle");
  });

  it("marks the whole stream errored when the error carries no strategy", () => {
    const problem = { title: "Connection lost", status: 0 };
    const state = streamReducer(initialGenerateStreamState(), { type: "error", problem });

    expect(state.status).toBe("error");
    expect(state.problem).toEqual(problem);
  });

  it("ignores an unrecognized event type, returning state unchanged", () => {
    const initial = initialGenerateStreamState();
    // @ts-expect-error deliberately exercising the reducer's default branch
    const state = streamReducer(initial, { type: "unknown_event" });

    expect(state).toBe(initial);
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
