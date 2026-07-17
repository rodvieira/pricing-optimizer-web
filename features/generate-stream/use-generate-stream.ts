"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type GenerateStreamState,
  initialGenerateStreamState,
  type PricingStrategy,
  type SiteProfile,
  streamReducer,
} from "@/domain";
import { streamGeneration } from "@/lib/api/generate";

const SLOW_THRESHOLD_MS = 10_000;

export interface UseGenerateStreamResult {
  state: GenerateStreamState;
  /** Strategies that have been streaming longer than the slow threshold. */
  slowStrategies: ReadonlySet<PricingStrategy>;
  start: (siteProfile: SiteProfile) => void;
}

export function useGenerateStream(): UseGenerateStreamResult {
  const [state, setState] = useState<GenerateStreamState>(initialGenerateStreamState);
  const [slowStrategies, setSlowStrategies] = useState<ReadonlySet<PricingStrategy>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);
  const slowTimersRef = useRef<Partial<Record<PricingStrategy, ReturnType<typeof setTimeout>>>>({});

  const start = useCallback((siteProfile: SiteProfile) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState(initialGenerateStreamState());
    setSlowStrategies(new Set());

    (async () => {
      try {
        for await (const event of streamGeneration(
          { siteProfile, currency: "USD" },
          { signal: controller.signal },
        )) {
          setState((prev) => streamReducer(prev, event));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setState((prev) =>
          streamReducer(prev, {
            type: "error",
            problem: {
              type: "about:blank",
              title: "Connection lost",
              status: 0,
              detail:
                err instanceof Error ? err.message : "The generation stream ended unexpectedly.",
            },
          }),
        );
      }
    })();
  }, []);

  // Per-strategy "taking longer than usual" timers, independent of the
  // domain reducer (a UI presentation concern, not a business rule).
  useEffect(() => {
    for (const [strategy, strategyState] of Object.entries(state.strategies) as [
      PricingStrategy,
      GenerateStreamState["strategies"][PricingStrategy],
    ][]) {
      const isStreaming = strategyState?.status === "streaming";
      const hasTimer = strategy in slowTimersRef.current;

      if (isStreaming && !hasTimer) {
        slowTimersRef.current[strategy] = setTimeout(() => {
          setSlowStrategies((prev) => new Set(prev).add(strategy));
        }, SLOW_THRESHOLD_MS);
      } else if (!isStreaming && hasTimer) {
        clearTimeout(slowTimersRef.current[strategy]);
        delete slowTimersRef.current[strategy];
        setSlowStrategies((prev) => {
          if (!prev.has(strategy)) return prev;
          const next = new Set(prev);
          next.delete(strategy);
          return next;
        });
      }
    }
  }, [state.strategies]);

  useEffect(() => {
    const timers = slowTimersRef.current;
    return () => {
      abortControllerRef.current?.abort();
      for (const timer of Object.values(timers)) clearTimeout(timer);
    };
  }, []);

  return { state, slowStrategies, start };
}
