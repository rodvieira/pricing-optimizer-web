import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/client", () => ({
  apiClient: { GET: vi.fn() },
}));

import { apiClient } from "@/shared/api/client";
import { GetGenerationError, getGeneration } from "@/shared/api/get-generation";

describe("getGeneration", () => {
  beforeEach(() => {
    vi.mocked(apiClient.GET).mockReset();
  });

  it("normalizes a raw fetch failure into a GetGenerationError", async () => {
    vi.mocked(apiClient.GET).mockRejectedValue(new TypeError("fetch failed"));

    await expect(getGeneration("gen-1")).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(GetGenerationError);
      expect((err as GetGenerationError).problem.title).toBe("Backend unreachable");
      return true;
    });
  });

  it("wraps an HTTP-level Problem response into a GetGenerationError", async () => {
    const problem = { type: "about:blank", title: "Not Found", status: 404 };
    vi.mocked(apiClient.GET).mockResolvedValue({
      data: undefined,
      error: problem,
      response: new Response(),
    });

    await expect(getGeneration("gen-1")).rejects.toMatchObject({ problem });
  });

  it("returns the generation on success", async () => {
    const generation = {
      id: "gen-1",
      sourceUrl: "https://example.com",
      status: "completed",
      variations: [],
      createdAt: "2026-07-16T00:00:00Z",
    };
    vi.mocked(apiClient.GET).mockResolvedValue({
      data: generation,
      error: undefined,
      response: new Response(),
    });

    await expect(getGeneration("gen-1")).resolves.toEqual(generation);
  });
});
