import { fireEvent, render as rtlRender, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LocaleProvider } from "@/shared/i18n";
import { ThemeModeProvider } from "@/shared/theme";
import { SettingsPopover } from "./settings-popover";

function render() {
  return rtlRender(
    <ThemeModeProvider>
      <LocaleProvider>
        <SettingsPopover />
      </LocaleProvider>
    </ThemeModeProvider>,
  );
}

describe("SettingsPopover", () => {
  // LocaleToggle persists the selected locale to localStorage — clear it so
  // one test's language switch doesn't leak into the next.
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("is closed by default, showing only the trigger", () => {
    render();

    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /switch language to/i })).not.toBeInTheDocument();
  });

  it("opens on trigger click, revealing the language toggle and theme toggle", () => {
    render();

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));

    expect(screen.getByRole("button", { name: /switch language to/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /switch to/i })).toBeInTheDocument();
  });

  it("the relocated language toggle still works", () => {
    render();

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    const languageButton = screen.getByRole("button", { name: /switch language to português/i });
    fireEvent.click(languageButton);

    expect(screen.getByRole("button", { name: /switch language to english/i })).toBeInTheDocument();
  });

  it("the relocated theme toggle still works", () => {
    render();

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    const themeButton = screen.getByRole("button", { name: /switch to dark theme/i });
    fireEvent.click(themeButton);

    expect(screen.getByRole("button", { name: /switch to light theme/i })).toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render();

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    const languageButton = screen.getByRole("button", { name: /switch language to/i });
    expect(languageButton).toBeInTheDocument();

    fireEvent.keyDown(languageButton, { key: "Escape", code: "Escape" });

    expect(screen.queryByRole("button", { name: /switch language to/i })).not.toBeInTheDocument();
  });
});
