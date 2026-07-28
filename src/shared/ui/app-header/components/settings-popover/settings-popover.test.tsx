import { fireEvent, render as rtlRender, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
  it("is closed by default, showing only the trigger", () => {
    render();

    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Language" })).not.toBeInTheDocument();
  });

  it("opens on trigger click, revealing the language selector and theme toggle", () => {
    render();

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));

    expect(screen.getByRole("combobox", { name: "Language" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /switch to/i })).toBeInTheDocument();
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
    expect(screen.getByRole("combobox", { name: "Language" })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("combobox", { name: "Language" }), {
      key: "Escape",
      code: "Escape",
    });

    expect(screen.queryByRole("combobox", { name: "Language" })).not.toBeInTheDocument();
  });
});
