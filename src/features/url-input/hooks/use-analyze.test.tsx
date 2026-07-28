import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/analyze", () => ({
  analyzeSite: vi.fn(),
}));

import { createQueryWrapper } from "@test/query-wrapper";
import type { ReactNode } from "react";
import { analyzeSite } from "@/shared/api/analyze";
import { LOCALE_STORAGE_KEY, LocaleProvider } from "@/shared/i18n";
import { useAnalyze } from "./use-analyze";

function createWrapper() {
  const QueryWrapper = createQueryWrapper();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryWrapper>
        <LocaleProvider>{children}</LocaleProvider>
      </QueryWrapper>
    );
  };
}

describe("useAnalyze", () => {
  beforeEach(() => {
    vi.mocked(analyzeSite).mockReset();
    window.localStorage.clear();
  });

  it("calls analyzeSite with the submitted URL and the current locale", async () => {
    const siteProfile = { title: "Example" };
    vi.mocked(analyzeSite).mockResolvedValue(siteProfile as never);

    const { result } = renderHook(() => useAnalyze(), { wrapper: createWrapper() });
    result.current.mutate("https://example.com");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(analyzeSite).toHaveBeenCalledWith("https://example.com", "en");
    expect(result.current.data).toEqual(siteProfile);
  });

  it("sends the stored pt-BR locale, not the default", async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "pt-BR");
    const siteProfile = { title: "Exemplo" };
    vi.mocked(analyzeSite).mockResolvedValue(siteProfile as never);

    // renderHook wraps the initial render in act(), which flushes
    // LocaleProvider's post-mount locale-correcting effect before returning
    // control here — by this point `locale` is already "pt-BR", not the
    // "en" it starts as (see LocaleProvider's own doc comment for why that
    // correction can't be a lazy initializer instead).
    const { result } = renderHook(() => useAnalyze(), { wrapper: createWrapper() });
    result.current.mutate("https://example.com");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(analyzeSite).toHaveBeenCalledWith("https://example.com", "pt-BR");
  });
});
