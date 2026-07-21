"use client";

import { Banner, Button, Text } from "@astryxdesign/core";
import { useSearchParams } from "next/navigation";
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
import { urlInputSchema } from "@/features/url-input/url-input-schema";
import { AudienceSummaryBar } from "./components/audience-summary-bar";
import { type DemoScenario, StudioDemoControls } from "./components/studio-demo-controls";
import { StudioEmptyState } from "./components/studio-empty-state";
import {
  DEMO_PROBLEM,
  DEMO_SITE_PROFILE,
  DEMO_SLOW_STRATEGIES,
  demoSlowStreamState,
} from "./demo-fixtures";

export function StudioPage() {
  const [siteProfile, setSiteProfile] = useState<SiteProfile | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [exportStrategy, setExportStrategy] = useState<PricingStrategy | null>(null);
  const [viewedGeneration, setViewedGeneration] = useState<Generation | null>(null);
  const [demo, setDemo] = useState<DemoScenario>("none");
  const analyze = useAnalyze();
  const generateStream = useGenerateStream();
  const { history, addGeneration, clearHistory } = useLocalHistory();
  const recordedGenerationId = useRef<string | null>(null);
  const searchParams = useSearchParams();
  const autoRunUrl = searchParams.get("url");
  const autoRunHandled = useRef(false);

  const runFor = useCallback(
    (url: string) => {
      setDemo("none");
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

  // "Watch a live run" (the landing page's hero) links here with `?url=` so
  // the Studio starts analyzing immediately instead of showing the empty
  // state — reuses the same schema the form itself validates against, so a
  // malformed query string is silently ignored rather than reaching the API.
  useEffect(() => {
    if (autoRunHandled.current || !autoRunUrl) return;
    autoRunHandled.current = true;
    const parsed = urlInputSchema.safeParse({ url: autoRunUrl });
    if (parsed.success) runFor(parsed.data.url);
  }, [autoRunUrl, runFor]);

  const retry = useCallback(() => {
    if (lastUrl) runFor(lastUrl);
  }, [lastUrl, runFor]);

  const viewHistoryEntry = useCallback((generation: Generation) => {
    setDemo("none");
    setViewedGeneration(generation);
    setSiteProfile(generation.siteProfile ?? null);
  }, []);

  const resetDemo = useCallback(() => {
    setDemo("none");
    setSiteProfile(null);
    setViewedGeneration(null);
    setLastUrl(null);
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

  const isDemo = demo !== "none";

  function currentDisplayState() {
    if (viewedGeneration) return generationToStreamState(viewedGeneration);
    if (demo === "slow") return demoSlowStreamState();
    return generateStream.state;
  }
  const displayState = currentDisplayState();
  const slowStrategies = demo === "slow" ? DEMO_SLOW_STRATEGIES : generateStream.slowStrategies;

  function currentProfile() {
    if (demo === "slow") return DEMO_SITE_PROFILE;
    if (isDemo) return null;
    return siteProfile;
  }
  const shownProfile = currentProfile();

  const isBusy = analyze.isPending || generateStream.state.status === "streaming";
  const showErrorBanner =
    demo === "error" ||
    (!isDemo &&
      !viewedGeneration &&
      generateStream.state.status === "error" &&
      generateStream.state.problem != null);
  const errorProblem =
    demo === "error"
      ? DEMO_PROBLEM
      : (generateStream.state.problem ?? { title: "Generation failed", status: 500 });
  const showGrid =
    demo === "slow" || (!isDemo && (siteProfile != null || viewedGeneration != null));
  const showEmpty = !isDemo && !siteProfile && !viewedGeneration && !analyze.isError;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Text type="display-3" className="block">
            Studio
          </Text>
          <Text type="body" color="secondary" className="block">
            Paste a product URL — we generate three pricing strategies in parallel.
          </Text>
        </div>
        <StudioDemoControls
          active={demo}
          onReset={resetDemo}
          onServerError={() => setDemo("error")}
          onSlow={() => setDemo("slow")}
        />
      </div>

      <UrlInputForm onSubmitUrl={runFor} isBusy={isBusy} initialUrl={autoRunUrl ?? undefined} />

      <HistoryPanel
        history={history}
        activeGenerationId={displayState.generationId}
        onSelect={viewHistoryEntry}
        onClear={clearHistory}
      />

      {analyze.isError && !isDemo && (
        <Banner
          status="error"
          title={analyze.error.problem.title}
          description={analyze.error.problem.detail}
          endContent={<Button label="Retry" variant="ghost" onClick={retry} />}
        />
      )}

      {shownProfile && <AudienceSummaryBar siteProfile={shownProfile} />}

      {showErrorBanner && (
        <Banner
          status="error"
          title={errorProblem.title}
          description={errorProblem.detail}
          endContent={
            demo === "error" ? (
              <Button label="Dismiss" variant="ghost" onClick={resetDemo} />
            ) : (
              <Button label="Retry" variant="ghost" onClick={retry} />
            )
          }
        />
      )}

      {showEmpty && <StudioEmptyState />}

      {showGrid && (
        <VariationGrid
          state={displayState}
          slowStrategies={slowStrategies}
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
