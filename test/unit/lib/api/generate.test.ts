import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { streamGeneration } from "@/lib/api/generate";

function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(chunks[i]));
      i += 1;
    },
  });
}

function okResponse(body: ReadableStream<Uint8Array>): Response {
  return new Response(body, { status: 200, headers: { "Content-Type": "text/event-stream" } });
}

describe("streamGeneration", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses complete SSE frames into domain stream events", async () => {
    const frame1 = `data: ${JSON.stringify({ type: "generation_started", generationId: "gen-1" })}\n\n`;
    const frame2 = `data: ${JSON.stringify({ type: "variation_started", strategy: "anchor" })}\n\n`;
    vi.mocked(fetch).mockResolvedValue(okResponse(streamFromChunks([frame1, frame2])));

    const events = [];
    for await (const event of streamGeneration({
      siteProfile: {} as never,
      currency: "USD",
    })) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: "generation_started", generationId: "gen-1" },
      { type: "variation_started", strategy: "anchor" },
    ]);
  });

  it("reassembles a frame split across two reads", async () => {
    const full = `data: ${JSON.stringify({ type: "token", strategy: "freemium", delta: "Hello" })}\n\n`;
    const splitPoint = 20;
    vi.mocked(fetch).mockResolvedValue(
      okResponse(streamFromChunks([full.slice(0, splitPoint), full.slice(splitPoint)])),
    );

    const events = [];
    for await (const event of streamGeneration({
      siteProfile: {} as never,
      currency: "USD",
    })) {
      events.push(event);
    }

    expect(events).toEqual([{ type: "token", strategy: "freemium", delta: "Hello" }]);
  });

  it("stops at a terminal done event carrying the full generation", async () => {
    const generation = {
      id: "gen-1",
      sourceUrl: "https://example.com",
      status: "completed",
      variations: [],
      createdAt: "2026-07-16T00:00:00Z",
    };
    const frame = `data: ${JSON.stringify({ type: "done", generation })}\n\n`;
    vi.mocked(fetch).mockResolvedValue(okResponse(streamFromChunks([frame])));

    const events = [];
    for await (const event of streamGeneration({
      siteProfile: {} as never,
      currency: "USD",
    })) {
      events.push(event);
    }

    expect(events).toEqual([{ type: "done", generation }]);
  });

  it("yields a single error event for a non-2xx Problem response", async () => {
    const problem = { type: "about:blank", title: "Conflict", status: 409, detail: "in progress" };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(problem), { status: 409 }));

    const events = [];
    for await (const event of streamGeneration({
      siteProfile: {} as never,
      currency: "USD",
    })) {
      events.push(event);
    }

    expect(events).toEqual([{ type: "error", problem }]);
  });
});
