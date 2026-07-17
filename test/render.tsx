import { Theme } from "@astryxdesign/core";
import { neutralTheme } from "@astryxdesign/theme-neutral";
import { render as rtlRender } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * Component tests render through Astryx's <Theme> so components that read
 * design tokens (colors, sizes) don't crash on a missing context — mirrors
 * how every component is actually mounted in the app (see AppProviders).
 */
export function render(ui: ReactElement) {
  return rtlRender(<Theme theme={neutralTheme}>{ui}</Theme>);
}

export * from "@testing-library/react";
