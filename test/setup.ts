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

// jsdom has no matchMedia implementation; Astryx's <Theme>/useTheme reads it
// (via useMediaQuery, e.g. for prefers-color-scheme) on every render.
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

// jsdom doesn't implement the native <dialog> element's modal behavior;
// Astryx's <Dialog> calls showModal()/close() directly.
if (typeof HTMLDialogElement !== "undefined") {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
    };
  }
}
