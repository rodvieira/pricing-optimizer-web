import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Problem, StrategyGenerationState } from "@/domain";
import { render, screen } from "@/test/render";
import { VariationCard } from "./variation-card";

function renderCard(strategyState: StrategyGenerationState | undefined, isSlow = false) {
  const onHoverTier = vi.fn();
  const onExport = vi.fn();
  render(
    <VariationCard
      strategy="anchor"
      strategyState={strategyState}
      isSlow={isSlow}
      hoveredTierIndex={null}
      onHoverTier={onHoverTier}
      onExport={onExport}
    />,
  );
  return { onHoverTier, onExport };
}

const COMPLETED_MULTI_TIER: StrategyGenerationState = {
  status: "completed",
  variation: {
    id: "v1",
    strategy: "anchor",
    headline: "Simple, anchored pricing",
    tiers: [
      { name: "Starter", price: { amount: 0, currency: "USD", interval: "monthly" }, features: [] },
      { name: "Pro", price: { amount: 4900, currency: "USD", interval: "monthly" }, features: [] },
    ],
  },
};

describe("VariationCard", () => {
  it("renders a queued placeholder and disables Export when there is no state yet", () => {
    renderCard(undefined);

    expect(screen.getByText("queued")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Edit inline" })).toBeDisabled();
  });

  it("shows the streaming partial text and disables Export while streaming", () => {
    renderCard({ status: "streaming", partialText: "Because your audience is price-sensitive…" });

    expect(screen.getByText("generating")).toBeInTheDocument();
    expect(screen.getByText("Because your audience is price-sensitive…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeDisabled();
  });

  it("flags a slow-running stream without changing the underlying streaming status", () => {
    renderCard({ status: "streaming", partialText: "" }, true);

    expect(screen.getByText("taking longer…")).toBeInTheDocument();
    expect(screen.getByText(/Taking longer than usual/)).toBeInTheDocument();
  });

  it("renders tiers and enables Export once completed", () => {
    renderCard({
      status: "completed",
      variation: {
        id: "v1",
        strategy: "anchor",
        headline: "Simple, anchored pricing",
        rationale: "Framed against a premium anchor tier.",
        tiers: [
          {
            name: "Starter",
            price: { amount: 0, currency: "USD", interval: "monthly" },
            features: ["1 seat"],
          },
        ],
      },
    });

    expect(screen.getByText("ready")).toBeInTheDocument();
    expect(screen.getByText("Framed against a premium anchor tier.")).toBeInTheDocument();
    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeEnabled();
  });

  it("calls onExport when a completed card's Export button is clicked", () => {
    const { onExport } = renderCard({
      status: "completed",
      variation: {
        id: "v1",
        strategy: "anchor",
        headline: "Simple, anchored pricing",
        tiers: [],
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(onExport).toHaveBeenCalledOnce();
  });

  it("reports the hovered tier's index by position", () => {
    const { onHoverTier } = renderCard(COMPLETED_MULTI_TIER);

    fireEvent.mouseEnter(screen.getByText("Pro"));

    expect(onHoverTier).toHaveBeenCalledWith(1);
  });

  it("renders the failure banner for an errored strategy", () => {
    const problem: Problem = {
      title: "Generation failed",
      status: 502,
      detail: "Upstream timeout",
    };
    renderCard({ status: "error", problem });

    expect(screen.getByText("failed")).toBeInTheDocument();
    expect(screen.getByText("Generation failed")).toBeInTheDocument();
    expect(screen.getByText("Upstream timeout")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeDisabled();
  });
});
