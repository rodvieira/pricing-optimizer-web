import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PricingTier } from "@/domain";
import { render, screen } from "@/test/render";
import { PricingTierRow } from "./pricing-tier-row";

function baseTier(overrides: Partial<PricingTier> = {}): PricingTier {
  return {
    name: "Pro",
    price: { amount: 4900, currency: "USD", interval: "monthly" },
    features: ["Unlimited projects"],
    ...overrides,
  };
}

describe("PricingTierRow", () => {
  it("formats a monthly price with the /mo suffix", () => {
    render(
      <PricingTierRow
        tier={baseTier()}
        strategyVariant="orange"
        isHighlighted={false}
        onHoverStart={vi.fn()}
      />,
    );
    expect(screen.getByText("$49")).toBeInTheDocument();
    expect(screen.getByText("/mo")).toBeInTheDocument();
  });

  it("formats a yearly price with the /yr suffix and cents when not a round amount", () => {
    render(
      <PricingTierRow
        tier={baseTier({ price: { amount: 4999, currency: "USD", interval: "yearly" } })}
        strategyVariant="orange"
        isHighlighted={false}
        onHoverStart={vi.fn()}
      />,
    );
    expect(screen.getByText("$49.99")).toBeInTheDocument();
    expect(screen.getByText("/yr")).toBeInTheDocument();
  });

  it("renders a one-time price with no period suffix", () => {
    render(
      <PricingTierRow
        tier={baseTier({ price: { amount: 10000, currency: "USD", interval: "one_time" } })}
        strategyVariant="orange"
        isHighlighted={false}
        onHoverStart={vi.fn()}
      />,
    );
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("uses customLabel verbatim instead of formatting an amount", () => {
    render(
      <PricingTierRow
        tier={baseTier({
          price: { amount: 0, currency: "USD", interval: "monthly", customLabel: "Contact us" },
        })}
        strategyVariant="orange"
        isHighlighted={false}
        onHoverStart={vi.fn()}
      />,
    );
    expect(screen.getByText("Contact us")).toBeInTheDocument();
  });

  it("shows a badge with a custom label when the tier is highlighted", () => {
    render(
      <PricingTierRow
        tier={baseTier({ highlighted: true, badge: "Best value" })}
        strategyVariant="teal"
        isHighlighted={false}
        onHoverStart={vi.fn()}
      />,
    );
    expect(screen.getByText("Best value")).toBeInTheDocument();
  });

  it("falls back to the default badge label when highlighted with none specified", () => {
    render(
      <PricingTierRow
        tier={baseTier({ highlighted: true })}
        strategyVariant="teal"
        isHighlighted={false}
        onHoverStart={vi.fn()}
      />,
    );
    expect(screen.getByText("Most popular")).toBeInTheDocument();
  });

  it("uses the custom CTA label when provided, falling back to 'Choose plan'", () => {
    render(
      <PricingTierRow
        tier={baseTier({ cta: "Start trial" })}
        strategyVariant="orange"
        isHighlighted={false}
        onHoverStart={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Start trial" })).toBeInTheDocument();
  });

  it("calls onHoverStart on mouse enter", () => {
    const onHoverStart = vi.fn();
    render(
      <PricingTierRow
        tier={baseTier()}
        strategyVariant="orange"
        isHighlighted={false}
        onHoverStart={onHoverStart}
      />,
    );
    fireEvent.mouseEnter(screen.getByText("Pro"));
    expect(onHoverStart).toHaveBeenCalledOnce();
  });
});
