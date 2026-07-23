import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/client", () => ({
  apiClient: { POST: vi.fn() },
}));

import { apiClient } from "@/shared/api/client";
import { ExportError, exportVariation } from "@/shared/api/export";

describe("exportVariation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.POST).mockReset();
  });

  it("normalizes a raw fetch failure into an ExportError", async () => {
    vi.mocked(apiClient.POST).mockRejectedValue(new TypeError("fetch failed"));

    await expect(exportVariation("gen-1", "var-1", "jsx")).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(ExportError);
      expect((err as ExportError).problem.title).toBe("Backend unreachable");
      return true;
    });
  });

  it("wraps an HTTP-level Problem response into an ExportError", async () => {
    const problem = { type: "about:blank", title: "Not Found", status: 404 };
    vi.mocked(apiClient.POST).mockResolvedValue({
      data: undefined,
      error: problem,
      response: new Response(),
    });

    await expect(exportVariation("gen-1", "var-1", "jsx")).rejects.toMatchObject({ problem });
  });

  it("returns the export result on success", async () => {
    const result = {
      format: "jsx" as const,
      filename: "PricingSection.tsx",
      contentType: "text/plain",
      content: "// jsx",
    };
    vi.mocked(apiClient.POST).mockResolvedValue({
      data: result,
      error: undefined,
      response: new Response(),
    } as never);

    await expect(exportVariation("gen-1", "var-1", "jsx")).resolves.toEqual(result);
  });
});
