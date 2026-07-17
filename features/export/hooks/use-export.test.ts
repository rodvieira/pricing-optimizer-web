import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/export", () => ({
  exportVariation: vi.fn(),
}));

import { exportVariation } from "@/lib/api/export";
import { createQueryWrapper } from "@/test/query-wrapper";
import { useExport } from "./use-export";

describe("useExport", () => {
  beforeEach(() => {
    vi.mocked(exportVariation).mockReset();
  });

  it("stays disabled until both generationId and variationId are set", () => {
    const { result } = renderHook(() => useExport(null, null, "jsx"), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(exportVariation).not.toHaveBeenCalled();
  });

  it("fetches the export once both ids are present, keyed by format", async () => {
    const exportResult = {
      format: "jsx",
      filename: "f.tsx",
      contentType: "text/plain",
      content: "x",
    };
    vi.mocked(exportVariation).mockResolvedValue(exportResult as never);

    const { result } = renderHook(() => useExport("gen-1", "var-1", "jsx"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(exportVariation).toHaveBeenCalledWith("gen-1", "var-1", "jsx");
    expect(result.current.data).toEqual(exportResult);
  });
});
