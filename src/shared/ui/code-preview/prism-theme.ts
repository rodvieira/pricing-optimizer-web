import type { PrismTheme } from "prism-react-renderer";

/**
 * Maps Prism's token types onto this repo's own syntax-highlighting tokens
 * (--color-syntax-*, confirmed real in src/shared/theme/generated/
 * pricing-optimizer.css — exposed by Astryx's stylesheet today, owned
 * tokens after the theme-handover increment) instead of a bundled
 * prism-react-renderer preset — per spec 003-shadcn-ui-migration's
 * research.md (Clarification 1): the palette must come from this app, not a
 * preset, so both color schemes stay correct with no second theme to sync.
 */
export const codePreviewTheme: PrismTheme = {
  plain: {
    color: "var(--color-syntax-punctuation)",
    backgroundColor: "var(--color-syntax-background)",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "var(--color-syntax-comment)", fontStyle: "italic" },
    },
    {
      types: ["punctuation"],
      style: { color: "var(--color-syntax-punctuation)" },
    },
    {
      types: ["tag", "boolean", "number", "constant", "symbol", "deleted"],
      style: { color: "var(--color-syntax-constant)" },
    },
    {
      types: ["attr-name", "attr-value"],
      style: { color: "var(--color-syntax-attribute)" },
    },
    {
      types: ["string", "char", "builtin", "inserted"],
      style: { color: "var(--color-syntax-string)" },
    },
    {
      types: ["operator", "entity", "url"],
      style: { color: "var(--color-syntax-operator)" },
    },
    {
      types: ["atrule", "keyword"],
      style: { color: "var(--color-syntax-keyword)" },
    },
    {
      types: ["function", "class-name"],
      style: { color: "var(--color-syntax-function)" },
    },
    {
      types: ["regex", "important", "variable"],
      style: { color: "var(--color-syntax-variable)" },
    },
    {
      types: ["property"],
      style: { color: "var(--color-syntax-property)" },
    },
  ],
};
