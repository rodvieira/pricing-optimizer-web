import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/analyze", () => ({
  analyzeSite: vi.fn(),
}));

import { createQueryWrapper } from "@test/query-wrapper";
import { analyzeSite } from "@/shared/api/analyze";
import { useAnalyze } from "./use-analyze";

describe("useAnalyze", () => {
  beforeEach(() => {
    vi.mocked(analyzeSite).mockReset();
  });

  it("calls analyzeSite with the submitted URL and exposes the result", async () => {
    const siteProfile = { title: "Example" };
    vi.mocked(analyzeSite).mockResolvedValue(siteProfile as never);

    const { result } = renderHook(() => useAnalyze(), { wrapper: createQueryWrapper() });
    result.current.mutate("https://example.com");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(analyzeSite).toHaveBeenCalledWith("https://example.com");
    expect(result.current.data).toEqual(siteProfile);
  });
});
