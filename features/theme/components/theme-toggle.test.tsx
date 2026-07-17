import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/render";
import * as themeModeProvider from "./theme-mode-provider";
import { ThemeToggle } from "./theme-toggle";

function mockThemeMode(mode: "light" | "dark" | "system") {
  const setMode = vi.fn();
  vi.spyOn(themeModeProvider, "useThemeMode").mockReturnValue({ mode, setMode });
  return setMode;
}

describe("ThemeToggle", () => {
  it("cycles light -> dark", () => {
    const setMode = mockThemeMode("light");
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: /Switch to dark theme/ }));
    expect(setMode).toHaveBeenCalledWith("dark");
  });

  it("cycles dark -> system", () => {
    const setMode = mockThemeMode("dark");
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: /Switch to system theme/ }));
    expect(setMode).toHaveBeenCalledWith("system");
  });

  it("cycles system -> light", () => {
    const setMode = mockThemeMode("system");
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: /Switch to light theme/ }));
    expect(setMode).toHaveBeenCalledWith("light");
  });
});
