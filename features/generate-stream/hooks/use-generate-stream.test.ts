import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StreamEvent } from "@/domain";

vi.mock("@/lib/api/generate", () => ({
  streamGeneration: vi.fn(),
}));

import { streamGeneration } from "@/lib/api/generate";
import { useGenerateStream } from "./use-generate-stream";

const SITE_PROFILE = { url: "https://example.com" } as never;

function fakeStream(events: StreamEvent[], opts: { signal?: AbortSignal } = {}) {
  return (async function* () {
    for (const event of events) {
      if (opts.signal?.aborted) return;
      yield event;
    }
  })();
}

describe("useGenerateStream", () => {
  beforeEach(() => {
    vi.mocked(streamGeneration).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("demultiplexes a full stream into per-strategy completed state", async () => {
    vi.mocked(streamGeneration).mockReturnValue(
      fakeStream([
        { type: "generation_started", generationId: "gen-1" },
        { type: "variation_started", strategy: "anchor" },
        {
          type: "variation_completed",
          variation: { id: "v1", strategy: "anchor", headline: "H", tiers: [] },
        },
        {
          type: "done",
          generation: {
            id: "gen-1",
            sourceUrl: "https://example.com",
            status: "completed",
            variations: [],
            createdAt: "",
          },
        },
      ]),
    );

    const { result } = renderHook(() => useGenerateStream());
    act(() => result.current.start(SITE_PROFILE));

    await waitFor(() => expect(result.current.state.status).toBe("done"));
    expect(result.current.state.strategies.anchor?.status).toBe("completed");
    expect(result.current.state.generation?.id).toBe("gen-1");
  });

  it("turns a thrown connection failure into an error event", async () => {
    vi.mocked(streamGeneration).mockReturnValue(
      // biome-ignore lint/correctness/useYield: this generator must fail before ever yielding, to simulate a connection dropped mid-stream
      (async function* () {
        throw new Error("network down");
      })(),
    );

    const { result } = renderHook(() => useGenerateStream());
    act(() => result.current.start(SITE_PROFILE));

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(result.current.state.problem?.detail).toBe("network down");
  });

  it("falls back to a generic detail when a non-Error value is thrown", async () => {
    vi.mocked(streamGeneration).mockReturnValue(
      // biome-ignore lint/correctness/useYield: this generator must fail before ever yielding
      (async function* () {
        throw "not an Error instance";
      })(),
    );

    const { result } = renderHook(() => useGenerateStream());
    act(() => result.current.start(SITE_PROFILE));

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(result.current.state.problem?.detail).toBe("The generation stream ended unexpectedly.");
  });

  it("drops events from a superseded stream after a second start() call", async () => {
    let resolveFirstYield!: () => void;
    const firstStream = (async function* () {
      yield { type: "generation_started", generationId: "gen-first" } as StreamEvent;
      await new Promise<void>((resolve) => {
        resolveFirstYield = resolve;
      });
      // By the time this resumes, start() has been called again and this
      // controller is aborted — this event must never reach state.
      yield { type: "variation_started", strategy: "anchor" } as StreamEvent;
    })();

    vi.mocked(streamGeneration)
      .mockReturnValueOnce(firstStream)
      .mockReturnValueOnce(
        fakeStream([{ type: "generation_started", generationId: "gen-second" }]),
      );

    const { result } = renderHook(() => useGenerateStream());
    act(() => result.current.start(SITE_PROFILE));
    await waitFor(() => expect(result.current.state.generationId).toBe("gen-first"));

    act(() => result.current.start(SITE_PROFILE));
    await waitFor(() => expect(result.current.state.generationId).toBe("gen-second"));

    act(() => resolveFirstYield());
    // Give the stale generator's microtask a chance to run; state must stay on gen-second.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(result.current.state.generationId).toBe("gen-second");
  });

  it("flags a strategy as slow once it streams past the threshold, and clears it on completion", async () => {
    vi.useFakeTimers();
    let yieldToken!: () => void;
    const stream = (async function* () {
      yield { type: "variation_started", strategy: "anchor" } as StreamEvent;
      await new Promise<void>((resolve) => {
        yieldToken = resolve;
      });
      yield {
        type: "variation_completed",
        variation: { id: "v1", strategy: "anchor", headline: "H", tiers: [] },
      } as StreamEvent;
    })();
    vi.mocked(streamGeneration).mockReturnValue(stream);

    const { result } = renderHook(() => useGenerateStream());
    act(() => result.current.start(SITE_PROFILE));
    await vi.waitFor(() =>
      expect(result.current.state.strategies.anchor?.status).toBe("streaming"),
    );

    act(() => vi.advanceTimersByTime(10_001));
    await vi.waitFor(() => expect(result.current.slowStrategies.has("anchor")).toBe(true));

    await act(async () => {
      yieldToken();
      await Promise.resolve();
    });
    await vi.waitFor(() => expect(result.current.slowStrategies.has("anchor")).toBe(false));
  });
});
