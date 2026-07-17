import type { Problem, StreamEvent } from "@/domain";
import type { components } from "./schema";

type StreamChunk = components["schemas"]["StreamChunk"];
type GenerateRequest = components["schemas"]["GenerateRequest"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function toStreamEvent(chunk: StreamChunk): StreamEvent | null {
  switch (chunk.type) {
    case "generation_started":
      if (!chunk.generationId) return null;
      return { type: "generation_started", generationId: chunk.generationId };
    case "variation_started":
      if (!chunk.strategy) return null;
      return { type: "variation_started", strategy: chunk.strategy };
    case "token":
      if (!chunk.strategy || chunk.delta == null) return null;
      return { type: "token", strategy: chunk.strategy, delta: chunk.delta };
    case "variation_completed":
      if (!chunk.variation) return null;
      return { type: "variation_completed", variation: chunk.variation };
    case "done":
      if (!chunk.generation) return null;
      return { type: "done", generation: chunk.generation };
    case "error":
      if (!chunk.problem) return null;
      return { type: "error", strategy: chunk.strategy, problem: chunk.problem };
    default:
      return null;
  }
}

/**
 * Splits an SSE byte stream into complete `data: {...}` frames, buffering any
 * partial frame split across two reads. Frames are blank-line-delimited per
 * the SSE spec; only the `data:` field is used (the backend emits no other
 * fields).
 */
async function* parseSseFrames(stream: ReadableStream<Uint8Array>): AsyncGenerator<StreamChunk> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const dataLines = frame
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart());
        if (dataLines.length === 0) continue;
        yield JSON.parse(dataLines.join("\n")) as StreamChunk;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function readProblem(response: Response): Promise<Problem> {
  try {
    return (await response.json()) as Problem;
  } catch {
    return {
      type: "about:blank",
      title: response.statusText || "Request failed",
      status: response.status,
    };
  }
}

export interface StreamGenerationOptions {
  idempotencyKey?: string;
  signal?: AbortSignal;
}

/**
 * Consumes POST /v1/generate as an SSE stream. Browser EventSource cannot be
 * used here — it can only issue GET requests with no body, and this endpoint
 * requires a JSON request body (see this repo's CLAUDE.md).
 */
export async function* streamGeneration(
  request: GenerateRequest,
  options: StreamGenerationOptions = {},
): AsyncGenerator<StreamEvent> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  const response = await fetch(`${API_BASE_URL}/v1/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
    signal: options.signal,
  });

  if (!response.ok || !response.body) {
    yield { type: "error", problem: await readProblem(response) };
    return;
  }

  for await (const chunk of parseSseFrames(response.body)) {
    const event = toStreamEvent(chunk);
    if (event) yield event;
  }
}
