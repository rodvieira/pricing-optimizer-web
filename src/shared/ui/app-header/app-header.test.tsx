import { describe, expect, it, vi } from "vitest";

const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

import { render as rtlRender, screen } from "@testing-library/react";
import { LocaleProvider } from "@/shared/i18n";
import { ThemeModeProvider } from "@/shared/theme";
import { AppHeader } from "./app-header";

// ThemeToggle and LocaleSelector (both rendered inside AppHeader) read from
// context, so this needs the real providers rather than the plain
// @test/render wrapper (which only provides LocaleProvider, not ThemeModeProvider).
function render() {
  return rtlRender(
    <ThemeModeProvider>
      <LocaleProvider>
        <AppHeader />
      </LocaleProvider>
    </ThemeModeProvider>,
  );
}

describe("AppHeader", () => {
  it("marks Studio as the active nav item on /studio", () => {
    mockUsePathname.mockReturnValue("/studio");
    render();

    expect(screen.getByRole("link", { name: "Studio" }).className).toContain("bg-muted");
    expect(screen.getByRole("link", { name: "Overview" }).className).not.toContain("bg-muted");
  });

  it("marks Overview as the active nav item on /", () => {
    mockUsePathname.mockReturnValue("/");
    render();

    expect(screen.getByRole("link", { name: "Overview" }).className).toContain("bg-muted");
    expect(screen.getByRole("link", { name: "Studio" }).className).not.toContain("bg-muted");
  });
});
