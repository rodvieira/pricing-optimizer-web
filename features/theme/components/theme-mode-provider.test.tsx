import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY } from "../theme-init-script";
import { ThemeModeProvider, useThemeMode } from "./theme-mode-provider";

function Probe() {
  const { mode, setMode } = useThemeMode();
  return (
    <div>
      <span>mode: {mode}</span>
      <button type="button" onClick={() => setMode("dark")}>
        go dark
      </button>
    </div>
  );
}

describe("ThemeModeProvider / useThemeMode", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to system mode with nothing stored", async () => {
    render(
      <ThemeModeProvider>
        <Probe />
      </ThemeModeProvider>,
    );
    await waitFor(() => expect(screen.getByText("mode: system")).toBeInTheDocument());
  });

  it("adopts a validly stored mode on mount", async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(
      <ThemeModeProvider>
        <Probe />
      </ThemeModeProvider>,
    );
    await waitFor(() => expect(screen.getByText("mode: dark")).toBeInTheDocument());
  });

  it("ignores a stored value outside the known mode set", async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "purple");
    render(
      <ThemeModeProvider>
        <Probe />
      </ThemeModeProvider>,
    );
    await waitFor(() => expect(screen.getByText("mode: system")).toBeInTheDocument());
  });

  it("setMode updates state and persists to localStorage", async () => {
    render(
      <ThemeModeProvider>
        <Probe />
      </ThemeModeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "go dark" }));

    await waitFor(() => expect(screen.getByText("mode: dark")).toBeInTheDocument());
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("throws when useThemeMode is called outside the provider", () => {
    expect(() => render(<Probe />)).toThrow("useThemeMode must be used within a ThemeModeProvider");
  });
});
