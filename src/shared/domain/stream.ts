import type { Generation } from "./types/generation";
import type { PricingStrategy } from "./types/pricing";
import type { Problem } from "./types/problem";
import type { Variation } from "./types/variation";

/**
 * Domain-level stream event — distinct from the wire `StreamChunk` shape
 * generated from openapi.yaml (see lib/api/schema.ts). Keeping these
 * separate is deliberate: the adapter layer (features/generate-stream) is
 * the only place allowed to know the wire shape; everything downstream
 * (the reducer below, the UI) only ever sees this domain shape.
 */
export type StreamEvent =
  | { type: "generation_started"; generationId: string }
  | { type: "variation_started"; strategy: PricingStrategy }
  | { type: "token"; strategy: PricingStrategy; delta: string }
  | { type: "variation_completed"; variation: Variation }
  | { type: "done"; generation: Generation }
  | { type: "error"; strategy?: PricingStrategy; problem: Problem };

/** Where one of the three strategies stands, independently of the others. */
export type StrategyGenerationState =
  | { status: "pending" }
  | { status: "streaming"; partialText: string }
  | { status: "completed"; variation: Variation }
  | { status: "error"; problem: Problem };

export interface GenerateStreamState {
  generationId: string | null;
  status: "idle" | "connecting" | "streaming" | "done" | "error";
  strategies: Partial<Record<PricingStrategy, StrategyGenerationState>>;
  /** Top-level stream failure, distinct from a single strategy's own error. */
  problem: Problem | null;
  /** The full generation payload from the `done` event, once the stream finishes. */
  generation: Generation | null;
}

export function initialGenerateStreamState(): GenerateStreamState {
  return {
    generationId: null,
    status: "idle",
    strategies: {},
    problem: null,
    generation: null,
  };
}

/**
 * Rebuilds the same shape a live stream produces, from a `Generation` already
 * completed in the past (e.g. a local-history entry) — lets `VariationGrid`
 * render a historical result with no separate "read-only" code path.
 */
export function generationToStreamState(generation: Generation): GenerateStreamState {
  const strategies: GenerateStreamState["strategies"] = {};
  for (const variation of generation.variations) {
    strategies[variation.strategy] = { status: "completed", variation };
  }
  return {
    generationId: generation.id,
    status: "done",
    strategies,
    problem: null,
    generation,
  };
}

/**
 * Pure reducer demultiplexing one interleaved SSE connection into three
 * independently-progressing strategy states. This is the business rule for
 * "how do we interpret the generation stream" — no React, no fetch, no
 * wire-format knowledge, trivially unit-testable.
 */
export function streamReducer(state: GenerateStreamState, event: StreamEvent): GenerateStreamState {
  switch (event.type) {
    case "generation_started":
      return { ...state, generationId: event.generationId, status: "streaming" };

    case "variation_started":
      return {
        ...state,
        strategies: {
          ...state.strategies,
          [event.strategy]: { status: "streaming", partialText: "" },
        },
      };

    case "token": {
      const current = state.strategies[event.strategy];
      const partialText = current?.status === "streaming" ? current.partialText : "";
      return {
        ...state,
        strategies: {
          ...state.strategies,
          [event.strategy]: { status: "streaming", partialText: partialText + event.delta },
        },
      };
    }

    case "variation_completed":
      return {
        ...state,
        strategies: {
          ...state.strategies,
          [event.variation.strategy]: { status: "completed", variation: event.variation },
        },
      };

    case "done":
      return { ...state, status: "done", generation: event.generation };

    case "error":
      if (event.strategy) {
        return {
          ...state,
          strategies: {
            ...state.strategies,
            [event.strategy]: { status: "error", problem: event.problem },
          },
        };
      }
      return { ...state, status: "error", problem: event.problem };

    default:
      return state;
  }
}
