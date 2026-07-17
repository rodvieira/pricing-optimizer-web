"use client";

import { Button, Text } from "@astryxdesign/core";
import type { Generation } from "@/domain";

const RELATIVE_TIME = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const RELATIVE_UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60_000],
  ["month", 30 * 24 * 60 * 60_000],
  ["day", 24 * 60 * 60_000],
  ["hour", 60 * 60_000],
  ["minute", 60_000],
];

function relativeTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  for (const [unit, unitMs] of RELATIVE_UNITS) {
    if (Math.abs(diffMs) >= unitMs) return RELATIVE_TIME.format(Math.round(diffMs / unitMs), unit);
  }
  return RELATIVE_TIME.format(Math.round(diffMs / 1000), "second");
}

/** Strips the scheme for a compact label; falls back to the raw value if it isn't a parseable URL. */
function hostLabel(sourceUrl: string): string {
  try {
    return new URL(sourceUrl).hostname;
  } catch {
    return sourceUrl;
  }
}

export interface HistoryPanelProps {
  readonly history: readonly Generation[];
  readonly activeGenerationId: string | null;
  readonly onSelect: (generation: Generation) => void;
  readonly onClear: () => void;
}

export function HistoryPanel({
  history,
  activeGenerationId,
  onSelect,
  onClear,
}: HistoryPanelProps) {
  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Text type="label" color="secondary">
          Recent generations
        </Text>
        <Button label="Clear" variant="ghost" size="sm" onClick={onClear} />
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((generation) => (
          <Button
            key={generation.id}
            label={`${hostLabel(generation.sourceUrl)} · ${relativeTime(generation.createdAt)}`}
            variant={generation.id === activeGenerationId ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSelect(generation)}
          />
        ))}
      </div>
    </div>
  );
}
