import { render as rtlRender } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * Design tokens (colors, sizes) are plain CSS custom properties defined in
 * app/globals.css, not a React context, so component tests need no
 * provider wrapper to read them — this stays a thin re-export of RTL's
 * `render` so call sites don't need to change if that ever stops being true.
 */
export function render(ui: ReactElement) {
  return rtlRender(ui);
}

export * from "@testing-library/react";
