import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/client", () => ({
  apiClient: { POST: vi.fn() },
}));

import { AnalyzeError, analyzeSite } from "@/shared/api/analyze";
import { apiClient } from "@/shared/api/client";

describe("analyzeSite", () => {
  beforeEach(() => {
    vi.mocked(apiClient.POST).mockReset();
  });

  it("normalizes a raw fetch failure (backend unreachable) into an AnalyzeError", async () => {
    vi.mocked(apiClient.POST).mockRejectedValue(new TypeError("fetch failed"));

    await expect(analyzeSite("https://example.com")).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(AnalyzeError);
      const analyzeError = err as AnalyzeError;
      expect(analyzeError.problem.title).toBe("Backend unreachable");
      expect(analyzeError.problem.detail).toBe("fetch failed");
      return true;
    });
  });

  it("wraps an HTTP-level Problem response into an AnalyzeError", async () => {
    const problem = { type: "about:blank", title: "Bad Request", status: 400 };
    vi.mocked(apiClient.POST).mockResolvedValue({
      data: undefined,
      error: problem,
      response: new Response(),
    });

    await expect(analyzeSite("https://example.com")).rejects.toMatchObject({ problem });
  });

  it("returns the site profile on success", async () => {
    const siteProfile = {
      url: "https://example.com",
      title: "Example",
      valueProposition: "Does things.",
      industry: "saas",
      audience: { segment: "devs", sophistication: "high" as const },
      sourceType: "static" as const,
      analyzedAt: "2026-07-16T00:00:00Z",
    };
    vi.mocked(apiClient.POST).mockResolvedValue({
      data: siteProfile,
      error: undefined,
      response: new Response(),
    } as never);

    await expect(analyzeSite("https://example.com")).resolves.toEqual(siteProfile);
  });
});
