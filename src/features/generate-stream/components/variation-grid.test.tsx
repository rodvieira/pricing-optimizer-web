import { render, screen } from "@test/render";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { initialGenerateStreamState } from "@/shared/domain";
import { VariationGrid } from "./variation-grid";

describe("VariationGrid", () => {
  it("renders one card per strategy and forwards onExport with the clicked strategy", () => {
    const onExport = vi.fn();
    const state = {
      ...initialGenerateStreamState(),
      strategies: {
        anchor: {
          status: "completed" as const,
          variation: { id: "v1", strategy: "anchor" as const, headline: "H", tiers: [] },
        },
      },
    };

    render(<VariationGrid state={state} slowStrategies={new Set()} onExport={onExport} />);

    expect(screen.getAllByRole("button", { name: "Export" })).toHaveLength(3);
    fireEvent.click(screen.getAllByRole("button", { name: "Export" })[0] as HTMLElement);
    expect(onExport).toHaveBeenCalledWith("anchor");
  });

  it("clears the hovered tier's highlight when the pointer leaves the grid", () => {
    const state = {
      ...initialGenerateStreamState(),
      strategies: {
        anchor: {
          status: "completed" as const,
          variation: {
            id: "v1",
            strategy: "anchor" as const,
            headline: "H",
            tiers: [
              {
                name: "Starter",
                price: { amount: 0, currency: "USD", interval: "monthly" as const },
                features: [],
              },
            ],
          },
        },
      },
    };

    render(<VariationGrid state={state} slowStrategies={new Set()} onExport={vi.fn()} />);

    const tierRow = screen
      .getByText("Starter")
      .closest('[class*="transition-colors"]') as HTMLElement;
    fireEvent.mouseEnter(screen.getByText("Starter"));
    expect(tierRow.className).toContain("bg-muted");

    const grid = screen.getByText("Starter").closest("[class*=grid-cols-1]") as HTMLElement;
    fireEvent.mouseLeave(grid);
    expect(tierRow.className).not.toContain("bg-muted");
  });
});
