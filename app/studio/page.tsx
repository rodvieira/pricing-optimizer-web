"use client";

import { Banner, Button, EmptyState, Text } from "@astryxdesign/core";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import type { PricingStrategy, SiteProfile } from "@/domain";
import { ExportDialog } from "@/features/export/export-dialog";
import { strategyMeta } from "@/features/generate-stream/strategy-meta";
import { useGenerateStream } from "@/features/generate-stream/use-generate-stream";
import { VariationGrid } from "@/features/generate-stream/variation-grid";
import { UrlInputForm } from "@/features/url-input/url-input-form";
import { useAnalyze } from "@/features/url-input/use-analyze";

function sophisticationLabel(profile: SiteProfile): string {
  return `${profile.audience.sophistication} sophistication`;
}

export default function StudioPage() {
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

      {siteProfile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
        >
          <span
            aria-hidden
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--color-icon-teal)" }}
          />
          <Text type="supporting" color="secondary">
            Scraped <strong className="font-mono text-primary">{siteProfile.title}</strong> —
            detected audience
          </Text>
          <Text type="label">{siteProfile.audience.segment}</Text>
          <span className="rounded-md bg-accent-muted px-2 py-1 font-mono text-xs text-accent">
            {sophisticationLabel(siteProfile)}
          </span>
        </motion.div>
      )}

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
