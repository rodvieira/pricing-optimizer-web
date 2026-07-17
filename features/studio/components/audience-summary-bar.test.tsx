import { describe, expect, it } from "vitest";
import type { SiteProfile } from "@/domain";
import { render, screen } from "@/test/render";
import { AudienceSummaryBar } from "./audience-summary-bar";

function siteProfile(overrides: Partial<SiteProfile> = {}): SiteProfile {
  return {
    url: "https://flowbase.com",
    title: "Flowbase",
    valueProposition: "Ship pricing pages.",
    industry: "developer-tools",
    audience: { segment: "Product-led B2B teams", sophistication: "high" },
    sourceType: "static",
    analyzedAt: "2026-07-16T00:00:00Z",
    ...overrides,
  };
}

describe("AudienceSummaryBar", () => {
  it("renders the scraped title, segment, and sophistication label", () => {
    render(<AudienceSummaryBar siteProfile={siteProfile()} />);

    expect(screen.getByText("Flowbase")).toBeInTheDocument();
    expect(screen.getByText("Product-led B2B teams")).toBeInTheDocument();
    expect(screen.getByText("high sophistication")).toBeInTheDocument();
  });
});
