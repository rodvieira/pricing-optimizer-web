import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Generation, StreamEvent } from "@/domain";

vi.mock("@/lib/api/analyze", () => ({ analyzeSite: vi.fn() }));
vi.mock("@/lib/api/generate", () => ({ streamGeneration: vi.fn() }));
vi.mock("@/lib/api/export", () => ({ exportVariation: vi.fn() }));

import { analyzeSite } from "@/lib/api/analyze";
import { exportVariation } from "@/lib/api/export";
import { streamGeneration } from "@/lib/api/generate";
import { render, screen } from "@/test/render";
import { StudioPage } from "./studio-page";

const SITE_PROFILE = {
  url: "https://flowbase.com",
  title: "Flowbase",
  valueProposition: "Ship pricing pages.",
  industry: "developer-tools",
  audience: { segment: "Product-led B2B teams", sophistication: "high" as const },
  sourceType: "static" as const,
  analyzedAt: "2026-07-16T00:00:00Z",
};

function completedGeneration(): Generation {
  return {
    id: "gen-1",
    sourceUrl: "https://flowbase.com",
    status: "completed",
    createdAt: new Date().toISOString(),
    variations: [{ id: "v1", strategy: "anchor", headline: "Anchor headline", tiers: [] }],
  };
}

function fakeStream(events: StreamEvent[]) {
  return (async function* () {
    for (const event of events) yield event;
  })();
}

function renderStudio() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrap = (ui: ReactElement) => (
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
  return render(wrap(<StudioPage />));
}

async function submitUrl(url: string) {
  fireEvent.change(screen.getByPlaceholderText("your-product.com"), { target: { value: url } });
  fireEvent.click(screen.getByRole("button", { name: "Analyze" }));
}

describe("StudioPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(analyzeSite).mockReset();
    vi.mocked(streamGeneration).mockReset();
  });

  it("shows the empty state with nothing generated yet", () => {
    renderStudio();
    expect(screen.getByText("Nothing generated yet")).toBeInTheDocument();
  });

  it("shows an error banner with retry when analyze fails, and retry re-submits the same URL", async () => {
    vi.mocked(analyzeSite).mockRejectedValue(
      Object.assign(new Error("scrape failed"), {
        problem: { title: "Scrape failed", status: 502, detail: "site down" },
      }),
    );

    renderStudio();
    await submitUrl("flowbase.com");

    await waitFor(() => expect(screen.getByText("Scrape failed")).toBeInTheDocument());
    expect(analyzeSite).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(analyzeSite).toHaveBeenCalledTimes(2));
    expect(analyzeSite).toHaveBeenLastCalledWith("https://flowbase.com");
  });

  it("runs the full happy path: analyze, stream to completion, and record it to history", async () => {
    vi.mocked(analyzeSite).mockResolvedValue(SITE_PROFILE);
    const generation = completedGeneration();
    vi.mocked(streamGeneration).mockReturnValue(
      fakeStream([
        { type: "generation_started", generationId: generation.id },
        { type: "variation_started", strategy: "anchor" },
        { type: "variation_completed", variation: generation.variations[0] as never },
        { type: "done", generation },
      ]),
    );

    renderStudio();
    await submitUrl("flowbase.com");

    await waitFor(() => expect(screen.getByText("Product-led B2B teams")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("ready")).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /flowbase\.com ·/ })).toBeInTheDocument(),
    );
  });

  it("shows a stream error banner (distinct from an analyze error) with retry", async () => {
    vi.mocked(analyzeSite).mockResolvedValue(SITE_PROFILE);
    vi.mocked(streamGeneration).mockReturnValue(
      // biome-ignore lint/correctness/useYield: this generator must fail before ever yielding, to simulate a connection dropped mid-stream
      (async function* () {
        throw new Error("connection reset");
      })(),
    );

    renderStudio();
    await submitUrl("flowbase.com");

    await waitFor(() => expect(screen.getByText("Connection lost")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("re-displays a history entry without starting a new stream, then clears history", async () => {
    vi.mocked(analyzeSite).mockResolvedValue(SITE_PROFILE);
    const generation = completedGeneration();
    vi.mocked(streamGeneration).mockReturnValue(
      fakeStream([
        { type: "generation_started", generationId: generation.id },
        { type: "variation_completed", variation: generation.variations[0] as never },
        { type: "done", generation },
      ]),
    );

    renderStudio();
    await submitUrl("flowbase.com");
    await waitFor(() => expect(screen.getByText("ready")).toBeInTheDocument());
    expect(streamGeneration).toHaveBeenCalledTimes(1);

    const historyButton = await screen.findByRole("button", { name: /flowbase\.com ·/ });
    fireEvent.click(historyButton);

    await waitFor(() => expect(screen.getByText("ready")).toBeInTheDocument());
    expect(streamGeneration).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByRole("button", { name: /flowbase\.com ·/ })).not.toBeInTheDocument();
  });

  it("opens the export dialog for a completed variation and closes it on request", async () => {
    vi.mocked(analyzeSite).mockResolvedValue(SITE_PROFILE);
    vi.mocked(exportVariation).mockResolvedValue({
      format: "jsx",
      filename: "f.tsx",
      contentType: "text/plain",
      content: "// jsx",
    } as never);
    const generation = completedGeneration();
    vi.mocked(streamGeneration).mockReturnValue(
      fakeStream([
        { type: "generation_started", generationId: generation.id },
        { type: "variation_completed", variation: generation.variations[0] as never },
        { type: "done", generation },
      ]),
    );

    renderStudio();
    await submitUrl("flowbase.com");
    await waitFor(() => expect(screen.getByText("ready")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "Export" })[0] as HTMLElement);
    await waitFor(() => expect(screen.getByText(/Export —/)).toBeInTheDocument());
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    expect(dialog.hasAttribute("open")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(dialog.hasAttribute("open")).toBe(false));
  });
});
