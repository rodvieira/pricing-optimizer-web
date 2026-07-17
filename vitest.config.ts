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
      include: ["domain/**", "features/**", "lib/**", "components/ui/**"],
      exclude: [
        // Generated from openapi.yaml, never hand-edited (see CLAUDE.md).
        "lib/api/schema.ts",
        // Pure data shape declarations — no runtime logic to cover.
        "domain/types/**",
        // Static marketing composition (constitution IV: "UI composition
        // that is purely presentational does not require a dedicated test
        // if it has no branching logic of its own") — every component here
        // maps a fixed local array to JSX with no conditionals.
        "features/landing/**",
        // Framework wiring with zero branching of its own (a QueryClient
        // constructor call, an openapi-fetch client config object).
        "lib/query-provider.tsx",
        "lib/api/client.ts",
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
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
