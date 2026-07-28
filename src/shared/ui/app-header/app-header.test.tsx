import { render as rtlRender, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/shared/i18n";
import { ThemeModeProvider } from "@/shared/theme";
import { AppHeader } from "./app-header";

// ThemeToggle and LocaleSelector (both rendered inside the settings popover)
// read from context, so this needs the real providers rather than the plain
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

// The settings popover's own open/close/relocated-controls behavior is
// covered by settings-popover.test.tsx — this file only asserts what's
// specific to AppHeader's own composition around it.
describe("AppHeader", () => {
  it("renders the wordmark linking home and a settings trigger, with no standalone nav/language/theme controls", () => {
    render();

    expect(screen.getByRole("link", { name: /pricing optimizer/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();

    expect(screen.queryByRole("link", { name: "Overview" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Studio" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Language" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /switch to/i })).not.toBeInTheDocument();
  });
});
