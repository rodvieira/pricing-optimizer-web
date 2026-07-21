"use client";

import { Banner, Button, EmptyState, Text } from "@astryxdesign/core";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Generation,
  generationToStreamState,
  type PricingStrategy,
  type SiteProfile,
} from "@/domain";
import { ExportDialog } from "@/features/export/components/export-dialog";
import { VariationGrid } from "@/features/generate-stream/components/variation-grid";
import { useGenerateStream } from "@/features/generate-stream/hooks/use-generate-stream";
import { strategyMeta } from "@/features/generate-stream/strategy-meta";
import { HistoryPanel } from "@/features/history/components/history-panel";
import { useLocalHistory } from "@/features/history/hooks/use-local-history";
import { UrlInputForm } from "@/features/url-input/components/url-input-form";
import { useAnalyze } from "@/features/url-input/hooks/use-analyze";
import { AudienceSummaryBar } from "./components/audience-summary-bar";

export function StudioPage() {
  const [siteProfile, setSiteProfile] = useState<SiteProfile | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [exportStrategy, setExportStrategy] = useState<PricingStrategy | null>(null);
  const [viewedGeneration, setViewedGeneration] = useState<Generation | null>(null);
  const analyze = useAnalyze();
  const generateStream = useGenerateStream();
  const { history, addGeneration, clearHistory } = useLocalHistory();
  const recordedGenerationId = useRef<string | null>(null);

  const runFor = useCallback(
    (url: string) => {
      setViewedGeneration(null);
      setLastUrl(url);
      analyze.mutate(url, {
        onSuccess: (profile) => {
          setSiteProfile(profile);
          generateStream.start(profile);
        },
      });
    },
    [analyze, generateStream],
  );

  const retry = useCallback(() => {
    if (lastUrl) runFor(lastUrl);
  }, [lastUrl, runFor]);

  const viewHistoryEntry = useCallback((generation: Generation) => {
    setViewedGeneration(generation);
    setSiteProfile(generation.siteProfile ?? null);
  }, []);

  // Persist a live generation to local history exactly once, as soon as its
  // stream reaches "done" — keyed off generationId so a re-render with the
  // same finished stream doesn't append a duplicate entry.
  useEffect(() => {
    const { generation } = generateStream.state;
    if (generation && recordedGenerationId.current !== generation.id) {
      recordedGenerationId.current = generation.id;
      addGeneration(generation);
    }
  }, [generateStream.state, addGeneration]);

  const displayState = viewedGeneration
    ? generationToStreamState(viewedGeneration)
    : generateStream.state;

  const isBusy = analyze.isPending || generateStream.state.status === "streaming";
  const hasStreamError =
    !viewedGeneration && generateStream.state.status === "error" && generateStream.state.problem;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <div>
        <Text type="display-3" className="block">
          Studio
        </Text>
        <Text type="body" color="secondary" className="block">
          Paste a product URL — we generate three pricing strategies in parallel.
        </Text>
      </div>

      <UrlInputForm onSubmitUrl={runFor} isBusy={isBusy} />

      <HistoryPanel
        history={history}
        activeGenerationId={displayState.generationId}
        onSelect={viewHistoryEntry}
        onClear={clearHistory}
      />

      {analyze.isError && (
        <Banner
          status="error"
          title={analyze.error.problem.title}
          description={analyze.error.problem.detail}
          endContent={<Button label="Retry" variant="ghost" onClick={retry} />}
        />
      )}

      {siteProfile && <AudienceSummaryBar siteProfile={siteProfile} />}

      {hasStreamError && (
        <Banner
          status="error"
          title={generateStream.state.problem?.title ?? "Generation failed"}
          description={generateStream.state.problem?.detail}
          endContent={<Button label="Retry" variant="ghost" onClick={retry} />}
        />
      )}

      {!siteProfile && !viewedGeneration && !analyze.isError && (
        <EmptyState
          title="Nothing generated yet"
          description="Paste a product URL above to stream three pricing strategies side by side."
        />
      )}

      {(siteProfile || viewedGeneration) && !hasStreamError && (
        <VariationGrid
          state={displayState}
          slowStrategies={generateStream.slowStrategies}
          onExport={setExportStrategy}
        />
      )}

      <ExportDialog
        isOpen={exportStrategy != null}
        onOpenChange={(open) => {
          if (!open) setExportStrategy(null);
        }}
        generationId={displayState.generationId}
        variationId={
          exportStrategy && displayState.strategies[exportStrategy]?.status === "completed"
            ? (displayState.strategies[exportStrategy]?.variation.id ?? null)
            : null
        }
        strategyLabel={exportStrategy ? strategyMeta(exportStrategy).label : ""}
      />
    </main>
  );
}
