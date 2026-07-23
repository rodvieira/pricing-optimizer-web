import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/test/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/shared/domain/**",
        "src/features/**",
        "src/entities/**",
        "src/views/**",
        "src/shared/api/**",
        "src/shared/ui/**",
        "src/shared/theme/**",
      ],
      exclude: [
        // Generated from openapi.yaml, never hand-edited (see CLAUDE.md).
        "src/shared/api/schema.ts",
        // Theme definition compiled to static CSS/JS at build time (pnpm
        // build:theme); the app imports the generated output, not this source.
        "src/shared/theme/pricing-optimizer-theme.ts",
        "src/shared/theme/generated/**",
        // Pure data shape declarations — no runtime logic to cover.
        "src/shared/domain/types/**",
        // Static marketing composition (constitution IV: "UI composition
        // that is purely presentational does not require a dedicated test
        // if it has no branching logic of its own") — every component here
        // maps a fixed local array to JSX with no conditionals.
        "src/views/landing/**",
        // Framework wiring with zero branching of its own (a QueryClient
        // constructor call, an openapi-fetch client config object).
        "src/shared/providers/query-provider.tsx",
        "src/shared/api/client.ts",
        // Barrels: re-export statements only, no logic of their own.
        "**/index.ts",
        "**/*.test.{ts,tsx}",
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        branches: 90,
        functions: 90,
      },
    },
  },
  resolve: {
    // Vite's object-form alias matches on a "/"-terminated boundary
    // (importee === pattern || importee.startsWith(pattern + "/")), so "@"
    // only ever matches "@/..." — "@test/render" does not start with "@/"
    // and can never be shadowed by it. Declaration order doesn't matter
    // here; "@test" is listed first only because it's the more specific
    // alias, not because order affects resolution.
    alias: {
      "@test": fileURLToPath(new URL("./test", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
