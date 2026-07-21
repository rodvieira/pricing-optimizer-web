import { describe, expect, it, vi } from "vitest";

const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

import { render as rtlRender, screen } from "@testing-library/react";
import { ThemeModeProvider } from "@/features/theme/components/theme-mode-provider";
import { AppHeader } from "./app-header";

// ThemeToggle (rendered inside AppHeader) reads theme mode from context, so
// this needs the real provider rather than the plain @/test/render wrapper.
function render() {
  return rtlRender(
    <ThemeModeProvider>
      <AppHeader />
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
