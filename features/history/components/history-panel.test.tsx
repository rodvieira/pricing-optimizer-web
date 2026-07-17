import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Generation } from "@/domain";
import { render, screen } from "@/test/render";
import { HistoryPanel } from "./history-panel";

function generation(id: string, sourceUrl: string, createdAt: string): Generation {
  return { id, sourceUrl, status: "completed", createdAt, variations: [] };
}

describe("HistoryPanel", () => {
  it("renders nothing when history is empty", () => {
    render(
      <HistoryPanel history={[]} activeGenerationId={null} onSelect={vi.fn()} onClear={vi.fn()} />,
    );
    expect(screen.queryByText("Recent generations")).not.toBeInTheDocument();
  });

  it("labels each entry with its host and a relative time, most recent first order preserved", () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
    render(
      <HistoryPanel
        history={[generation("gen-1", "https://flowbase.com/pricing", oneDayAgo)]}
        activeGenerationId={null}
        onSelect={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /flowbase\.com/ })).toBeInTheDocument();
  });

  it("falls back to the raw sourceUrl when it isn't a parseable URL", () => {
    render(
      <HistoryPanel
        history={[generation("gen-1", "not-a-url", new Date().toISOString())]}
        activeGenerationId={null}
        onSelect={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /not-a-url/ })).toBeInTheDocument();
  });

  it("marks the active generation's entry with the secondary variant", () => {
    render(
      <HistoryPanel
        history={[generation("gen-1", "https://flowbase.com", new Date().toISOString())]}
        activeGenerationId="gen-1"
        onSelect={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /flowbase\.com/ })).toHaveAttribute(
      "data-variant",
      "secondary",
    );
  });

  it("calls onSelect with the clicked generation", () => {
    const onSelect = vi.fn();
    const entry = generation("gen-1", "https://flowbase.com", new Date().toISOString());
    render(
      <HistoryPanel
        history={[entry]}
        activeGenerationId={null}
        onSelect={onSelect}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /flowbase\.com/ }));
    expect(onSelect).toHaveBeenCalledWith(entry);
  });

  it("calls onClear when Clear is clicked", () => {
    const onClear = vi.fn();
    render(
      <HistoryPanel
        history={[generation("gen-1", "https://flowbase.com", new Date().toISOString())]}
        activeGenerationId={null}
        onSelect={vi.fn()}
        onClear={onClear}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
