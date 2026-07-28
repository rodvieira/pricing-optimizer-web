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

  it("sends the language in the request body when provided", async () => {
    vi.mocked(apiClient.POST).mockResolvedValue({
      data: undefined,
      error: undefined,
      response: new Response(),
    } as never);

    await analyzeSite("https://example.com", "pt-BR");

    expect(apiClient.POST).toHaveBeenCalledWith("/v1/analyze", {
      body: { url: "https://example.com", language: "pt-BR" },
    });
  });

  it("omits language from the serialized request body when not provided", async () => {
    vi.mocked(apiClient.POST).mockResolvedValue({
      data: undefined,
      error: undefined,
      response: new Response(),
    } as never);

    await analyzeSite("https://example.com");

    const calls = vi.mocked(apiClient.POST).mock.calls as unknown as [string, { body: object }][];
    const { body } = calls[0][1];
    // The body object itself still has a `language: undefined` key (an
    // object literal doesn't omit shorthand properties just because their
    // value is undefined) — toHaveBeenCalledWith's toEqual-style comparison
    // can't tell that apart from a truly absent key. What actually reaches
    // the backend is what JSON.stringify produces, which does drop
    // undefined-valued keys — assert on that instead.
    expect(JSON.parse(JSON.stringify(body))).not.toHaveProperty("language");
  });
});
