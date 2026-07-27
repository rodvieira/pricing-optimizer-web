"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import type { Generation } from "@/shared/domain";
import { useLocaleMode } from "@/shared/i18n";
import { Button, Text } from "@/shared/ui";

const RELATIVE_UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60_000],
  ["month", 30 * 24 * 60 * 60_000],
  ["day", 24 * 60 * 60_000],
  ["hour", 60 * 60_000],
  ["minute", 60_000],
];

function relativeTime(iso: string, formatter: Intl.RelativeTimeFormat): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  for (const [unit, unitMs] of RELATIVE_UNITS) {
    if (Math.abs(diffMs) >= unitMs) return formatter.format(Math.round(diffMs / unitMs), unit);
  }
  return formatter.format(Math.round(diffMs / 1000), "second");
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
  const { locale } = useLocaleMode();
  const t = useTranslations("history");
  const relativeTimeFormatter = useMemo(
    () => new Intl.RelativeTimeFormat(locale, { numeric: "auto" }),
    [locale],
  );

  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Text type="label" color="secondary">
          {t("recentGenerations")}
        </Text>
        <Button label={t("clear")} variant="ghost" size="sm" onClick={onClear} />
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((generation) => (
          <Button
            key={generation.id}
            label={`${hostLabel(generation.sourceUrl)} · ${relativeTime(generation.createdAt, relativeTimeFormatter)}`}
            variant={generation.id === activeGenerationId ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSelect(generation)}
          />
        ))}
      </div>
    </div>
  );
}
