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

// jsdom has no layout engine, so it implements neither scrollIntoView nor
// the pointer-capture trio — @radix-ui/react-select's listbox positioning
// calls all four internally (to scroll the highlighted option into view and
// to capture the pointer during a drag-select), and throws without them.
// No-op stand-ins are sufficient: this repo's tests assert on rendered
// content and fired events, not real scroll position or pointer capture.
if (typeof Element !== "undefined") {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
}
