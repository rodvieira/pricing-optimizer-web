import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { streamGeneration } from "@/shared/api/generate";

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

  it("reassembles a frame split exactly at the blank-line delimiter", async () => {
    // Distinct from the mid-content split above: the read boundary here
    // falls between the two "\n" characters of the "\n\n" delimiter itself
    // ("...}\n" | "\n"), the one place a naive fixed-width or regex-based
    // frame split could miss the boundary entirely. The
    // buffer-and-append approach must still find it once both halves join.
    const full = `data: ${JSON.stringify({ type: "token", strategy: "anchor", delta: "Hi" })}\n\n`;
    const delimiterIndex = full.indexOf("\n\n") + 1;
    vi.mocked(fetch).mockResolvedValue(
      okResponse(streamFromChunks([full.slice(0, delimiterIndex), full.slice(delimiterIndex)])),
    );

    const events = [];
    for await (const event of streamGeneration({
      siteProfile: {} as never,
      currency: "USD",
    })) {
      events.push(event);
    }

    expect(events).toEqual([{ type: "token", strategy: "anchor", delta: "Hi" }]);
  });

  it("yields both frames when two complete frames arrive in a single read", async () => {
    const frame1 = `data: ${JSON.stringify({ type: "variation_started", strategy: "anchor" })}\n\n`;
    const frame2 = `data: ${JSON.stringify({ type: "variation_started", strategy: "freemium" })}\n\n`;
    vi.mocked(fetch).mockResolvedValue(okResponse(streamFromChunks([frame1 + frame2])));

    const events = [];
    for await (const event of streamGeneration({
      siteProfile: {} as never,
      currency: "USD",
    })) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: "variation_started", strategy: "anchor" },
      { type: "variation_started", strategy: "freemium" },
    ]);
  });

  it("ignores non-data SSE fields and reassembles a multi-line data field", async () => {
    // The backend only ever emits a single "data:" line per event (per this
    // repo's CLAUDE.md), but the parser itself doesn't assume that: it
    // filters to "data:"-prefixed lines and joins them, so a differently-
    // behaved event source (or a future backend change) wouldn't silently
    // corrupt or drop content. Also proves an interleaved comment/event
    // field is dropped rather than breaking the join. The split point (right
    // after the opening brace) lands on valid JSON whitespace rather than
    // mid-token, since \n-joining two "data:" lines inserts a literal
    // newline between them — anywhere else would produce invalid JSON.
    const payload = JSON.stringify({ type: "token", strategy: "value_based", delta: "Hi" });
    const frame = [
      "event: message",
      ":a comment line",
      `data: ${payload.slice(0, 1)}`,
      `data: ${payload.slice(1)}`,
      "",
      "",
    ].join("\n");
    vi.mocked(fetch).mockResolvedValue(okResponse(streamFromChunks([frame])));

    const events = [];
    for await (const event of streamGeneration({
      siteProfile: {} as never,
      currency: "USD",
    })) {
      events.push(event);
    }

    expect(events).toEqual([{ type: "token", strategy: "value_based", delta: "Hi" }]);
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

  it("flushes the final frame even when the stream ends without a trailing blank line", async () => {
    // Regression: the frame parser only flushed frames delimited by "\n\n"
    // inside the read loop — a stream that closes right after its last
    // event, without one more blank-line separator, silently dropped it.
    const generation = {
      id: "gen-1",
      sourceUrl: "https://example.com",
      status: "completed",
      variations: [],
      createdAt: "2026-07-16T00:00:00Z",
    };
    const frameWithNoTrailingBlankLine = `data: ${JSON.stringify({ type: "done", generation })}`;
    vi.mocked(fetch).mockResolvedValue(
      okResponse(streamFromChunks([frameWithNoTrailingBlankLine])),
    );

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

  it("falls back to a synthesized Problem when a non-2xx response body isn't valid JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("not json", { status: 503, statusText: "Service Unavailable" }),
    );

    const events = [];
    for await (const event of streamGeneration({ siteProfile: {} as never, currency: "USD" })) {
      events.push(event);
    }

    expect(events).toEqual([
      {
        type: "error",
        problem: { type: "about:blank", title: "Service Unavailable", status: 503 },
      },
    ]);
  });

  it("sends an Idempotency-Key header when one is provided", async () => {
    vi.mocked(fetch).mockResolvedValue(okResponse(streamFromChunks([])));

    for await (const _event of streamGeneration(
      { siteProfile: {} as never, currency: "USD" },
      { idempotencyKey: "key-123" },
    )) {
      // drain
    }

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe("key-123");
  });

  it("drops chunks missing required fields and unrecognized chunk types instead of throwing", async () => {
    const frames = [
      // Every case in toStreamEvent's switch guards its required field(s)
      // and maps a missing one to `null`, alongside an unrecognized type —
      // all must be skipped rather than throwing or yielding a bad event.
      { type: "generation_started" },
      { type: "variation_started" },
      { type: "token", strategy: "anchor" },
      { type: "variation_completed" },
      { type: "done" },
      { type: "error", strategy: "anchor" },
      { type: "something_unrecognized" },
      { type: "variation_started", strategy: "anchor" },
    ]
      .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
      .join("");
    vi.mocked(fetch).mockResolvedValue(okResponse(streamFromChunks([frames])));

    const events = [];
    for await (const event of streamGeneration({ siteProfile: {} as never, currency: "USD" })) {
      events.push(event);
    }

    expect(events).toEqual([{ type: "variation_started", strategy: "anchor" }]);
  });
});
