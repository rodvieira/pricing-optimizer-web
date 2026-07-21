import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/render";
import * as themeModeProvider from "./theme-mode-provider";
import { ThemeToggle } from "./theme-toggle";

function mockThemeMode(mode: "light" | "dark") {
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

  it("cycles dark -> light", () => {
    const setMode = mockThemeMode("dark");
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: /Switch to light theme/ }));
    expect(setMode).toHaveBeenCalledWith("light");
  });

  it("shows the moon icon in dark mode", () => {
    mockThemeMode("dark");
    render(<ThemeToggle />);

    expect(document.querySelector("svg.lucide-moon")).toBeInTheDocument();
    expect(document.querySelector("svg.lucide-sun")).not.toBeInTheDocument();
  });

  it("shows the sun icon in light mode", () => {
    mockThemeMode("light");
    render(<ThemeToggle />);

    expect(document.querySelector("svg.lucide-sun")).toBeInTheDocument();
    expect(document.querySelector("svg.lucide-moon")).not.toBeInTheDocument();
  });
});
