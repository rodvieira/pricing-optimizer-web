import { describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY, themeModeInitScript } from "./theme-init-script";

describe("themeModeInitScript", () => {
  it("reads the shared storage key", () => {
    expect(themeModeInitScript).toContain(`window.localStorage.getItem("${THEME_STORAGE_KEY}")`);
  });

  it("sets both data-theme and color-scheme on <html> before hydration", () => {
    expect(themeModeInitScript).toContain('document.documentElement.setAttribute("data-theme"');
    expect(themeModeInitScript).toContain("document.documentElement.style.colorScheme");
  });

  it("resolves via matchMedia when nothing is stored", () => {
    expect(themeModeInitScript).toContain('window.matchMedia("(prefers-color-scheme: dark)")');
  });

  it("is syntactically valid JavaScript", () => {
    expect(() => new Function(themeModeInitScript)).not.toThrow();
  });
});
