import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// vitest.config.ts doesn't set `test.globals`, so Testing Library's
// auto-cleanup (which only registers itself when it finds a global
// `afterEach`) never fires on its own — do it explicitly or DOM from one
// test leaks into the next within the same file.
afterEach(() => {
  cleanup();
});

// jsdom has no matchMedia implementation; ThemeModeProvider reads it
// (prefers-color-scheme) to follow the OS scheme until the user picks
// explicitly, and on every render while no explicit choice has been made.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
