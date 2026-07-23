import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
      <button type="button" onClick={() => setMode("light")}>
        go light
      </button>
    </div>
  );
}

function mockOsPreference(prefersDark: boolean) {
  return vi.spyOn(window, "matchMedia").mockReturnValue({
    matches: prefersDark,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  } as MediaQueryList);
}

describe("ThemeModeProvider / useThemeMode", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to the OS light preference with nothing stored", async () => {
    const matchMediaSpy = mockOsPreference(false);
    render(
      <ThemeModeProvider>
        <Probe />
      </ThemeModeProvider>,
    );
    await waitFor(() => expect(screen.getByText("mode: light")).toBeInTheDocument());
    matchMediaSpy.mockRestore();
  });

  it("defaults to the OS dark preference with nothing stored", async () => {
    const matchMediaSpy = mockOsPreference(true);
    render(
      <ThemeModeProvider>
        <Probe />
      </ThemeModeProvider>,
    );
    await waitFor(() => expect(screen.getByText("mode: dark")).toBeInTheDocument());
    matchMediaSpy.mockRestore();
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

  it("ignores a stored value outside the known mode set (including legacy 'system')", async () => {
    const matchMediaSpy = mockOsPreference(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, "system");
    render(
      <ThemeModeProvider>
        <Probe />
      </ThemeModeProvider>,
    );
    await waitFor(() => expect(screen.getByText("mode: light")).toBeInTheDocument());
    matchMediaSpy.mockRestore();
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

  it("stops following OS preference changes once the user picks a mode explicitly", async () => {
    const matchMediaSpy = mockOsPreference(false);
    render(
      <ThemeModeProvider>
        <Probe />
      </ThemeModeProvider>,
    );
    await waitFor(() => expect(screen.getByText("mode: light")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "go dark" }));
    await waitFor(() => expect(screen.getByText("mode: dark")).toBeInTheDocument());
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    matchMediaSpy.mockRestore();
  });

  it("throws when useThemeMode is called outside the provider", () => {
    expect(() => render(<Probe />)).toThrow("useThemeMode must be used within a ThemeModeProvider");
  });
});
