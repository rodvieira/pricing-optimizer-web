"use client";

import { useCallback, useEffect, useState } from "react";
import { addToHistory, type Generation } from "@/shared/domain";
import { readHistory, writeHistory } from "../local-history-storage";

export interface UseLocalHistoryResult {
  history: Generation[];
  addGeneration: (generation: Generation) => void;
  clearHistory: () => void;
}

/**
 * Adapter over the pure `addToHistory` domain rule: owns where local history
 * actually lives (localStorage) and the one piece of state React needs to
 * re-render when it changes. Reads once on mount rather than during render
 * so this hook stays safe to call during SSR (Next.js has no `window`).
 */
export function useLocalHistory(): UseLocalHistoryResult {
  const [history, setHistory] = useState<Generation[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const addGeneration = useCallback((generation: Generation) => {
    setHistory((prev) => {
      const next = addToHistory(prev, generation);
      writeHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    writeHistory([]);
  }, []);

  return { history, addGeneration, clearHistory };
}
