"use client";

import { Banner, Button, EmptyState, Text } from "@astryxdesign/core";
import { useCallback, useState } from "react";
import type { PricingStrategy, SiteProfile } from "@/domain";
import { ExportDialog } from "@/features/export/components/export-dialog";
import { VariationGrid } from "@/features/generate-stream/components/variation-grid";
import { useGenerateStream } from "@/features/generate-stream/hooks/use-generate-stream";
import { strategyMeta } from "@/features/generate-stream/strategy-meta";
import { UrlInputForm } from "@/features/url-input/components/url-input-form";
import { useAnalyze } from "@/features/url-input/hooks/use-analyze";
import { AudienceSummaryBar } from "./components/audience-summary-bar";

export function StudioPage() {
  const [siteProfile, setSiteProfile] = useState<SiteProfile | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [exportStrategy, setExportStrategy] = useState<PricingStrategy | null>(null);
  const analyze = useAnalyze();
  const generateStream = useGenerateStream();

  const runFor = useCallback(
    (url: string) => {
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

  const isBusy = analyze.isPending || generateStream.state.status === "streaming";
  const hasStreamError = generateStream.state.status === "error" && generateStream.state.problem;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <div>
        <Text type="display-3">Studio</Text>
        <Text type="body" color="secondary">
          Paste a product URL — we generate three pricing strategies in parallel.
        </Text>
      </div>

      <UrlInputForm onSubmitUrl={runFor} isBusy={isBusy} />

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

      {!siteProfile && !analyze.isError && (
        <EmptyState
          title="Nothing generated yet"
          description="Paste a product URL above to stream three pricing strategies side by side."
        />
      )}

      {siteProfile && !hasStreamError && (
        <VariationGrid
          state={generateStream.state}
          slowStrategies={generateStream.slowStrategies}
          onExport={setExportStrategy}
        />
      )}

      <ExportDialog
        isOpen={exportStrategy != null}
        onOpenChange={(open) => {
          if (!open) setExportStrategy(null);
        }}
        generationId={generateStream.state.generationId}
        variationId={
          exportStrategy && generateStream.state.strategies[exportStrategy]?.status === "completed"
            ? (generateStream.state.strategies[exportStrategy]?.variation.id ?? null)
            : null
        }
        strategyLabel={exportStrategy ? strategyMeta(exportStrategy).label : ""}
      />
    </main>
  );
}
