import { render, screen } from "@test/render";
import { describe, expect, it } from "vitest";
import { PriceDisplay } from "./price-display";

describe("PriceDisplay", () => {
  it("renders the amount and period", () => {
    render(<PriceDisplay amount="$49" period="/mo" />);

    expect(screen.getByText("$49")).toBeInTheDocument();
    expect(screen.getByText("/mo")).toBeInTheDocument();
  });

  it("defaults to the large size scale", () => {
    render(<PriceDisplay amount="$49" period="/mo" />);

    expect(screen.getByText("$49").className).toContain("text-2xl");
  });

  it("applies the pinned small size scale", () => {
    render(<PriceDisplay amount="$49" period="/mo" size="sm" />);

    const el = screen.getByText("$49");

    expect(el.className).toContain("text-[21px]");
    expect(el.className).toContain("tracking-[-0.42px]");
    expect(el.className).not.toContain("text-2xl");
  });

  it("styles the period as muted, non-bold text", () => {
    render(<PriceDisplay amount="$49" period="/mo" />);

    expect(screen.getByText("/mo").className).toContain("text-secondary");
    expect(screen.getByText("/mo").className).toContain("font-normal");
  });

  it("appends a custom className to the amount element", () => {
    render(<PriceDisplay amount="$49" period="/mo" className="block" />);

    expect(screen.getByText("$49").className).toContain("block");
  });
});
