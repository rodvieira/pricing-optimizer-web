# Pricing Optimizer

[![CI](https://github.com/rodvieira/pricing-optimizer-web/actions/workflows/ci.yml/badge.svg)](https://github.com/rodvieira/pricing-optimizer-web/actions/workflows/ci.yml)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-98%20perf%20%C2%B7%2095%2B%20a11y-brightgreen)](#quality)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Next.js frontend for **Pricing Optimizer**: paste a product URL, watch three
AI-generated pricing-page variations stream in live, compare them side by side, export
the one that fits as JSX, HTML, or a Stripe Pricing Table config.

**Live**: [pricing-optimizer-web.vercel.app](https://pricing-optimizer-web.vercel.app) ·
Backend: [`pricing-optimizer-api`](https://github.com/rodvieira/pricing-optimizer-api)
(Go, [live](https://pricing-optimizer-api-hnzq7nvuqq-uc.a.run.app)), consumed via the
contract in `openapi.yaml`.

## What it does

1. **Studio** — paste a URL; the backend scrapes it and classifies the target audience
   while this app shows a live-updating skeleton, then three strategy cards
   (anchor pricing, freemium ladder, value-based) stream in independently over SSE,
   each completing on its own timeline rather than all-or-nothing.
2. **Compare** — hovering a pricing tier highlights the equivalent tier across all
   three strategies at once, so the psychological framing differences are visible
   side by side instead of one card at a time.
3. **Export** — any completed variation exports as a React/Tailwind component,
   semantic standalone HTML, or a Stripe Pricing Table JSON config.
4. **History** — the last 10 generations persist to `localStorage`; reopening one
   replays the same rendering path a live stream uses, no re-fetch.

## Architecture

FSD-lite (Feature-Sliced Design, sized down to this app's scope) under `src/` —
colocation over indirection for a component-heavy UI codebase, with an explicit layer
direction (`app -> views -> features -> entities -> shared`) instead of the flatter
feature-based layout this repo started with (see ADR-0016 for why):

```
src/
  app/                Next.js App Router — routing only. Every page is a thin default
                      export rendering a view's own top-level component.

  views/              page compositions, each rendered by exactly one app/ route
    studio/ landing/

  features/<name>/    reusable capability slices, each with an index.ts barrel as its
                      public surface: components/, hooks/, loose feature-local logic
    url-input/ generate-stream/ export/ history/

  entities/           domain concepts shared across views/features that are more than
                      a pure type but owned by no single feature
    strategy/           display metadata (label, blurb, Astryx color variant) per
                        pricing strategy — used by both the landing preview and Studio

  shared/             framework-agnostic or cross-cutting code with no feature identity
    domain/             pure business types + logic. Zero React/Next/Zod/TanStack
                        imports — the one layer that would port to a different
                        framework unchanged. types/ (data shapes only), stream.ts
                        (the SSE stream-demux reducer), history.ts (dedupe rule)
    api/                the only layer that knows the backend's raw wire format —
                        openapi-typescript-generated types, the fetch client, and
                        per-endpoint wrappers mapping wire shapes to shared/domain/ types
    ui/                 shared cross-feature composition (app header, price display, ...)
    providers/          cross-cutting client providers composed once (QueryProvider,
                        ThemeModeProvider) so app/layout.tsx stays a thin document shell
    theme/              Astryx color-mode integration — cross-cutting infrastructure,
                        not a features/ slice, since shared/ui and shared/providers
                        both depend on it (see ADR-0016)
```

## Key engineering decisions

- **Hand-rolled SSE consumption, not `EventSource`.** `POST /v1/generate` needs a JSON
  request body and browser `EventSource` can only do bodyless `GET`. A `fetch()` +
  `ReadableStream` frame parser in `shared/api/generate.ts` fills the gap — the single
  most bug-prone piece of code in this repo (a dropped final frame with no trailing
  blank line, a stale event landing after a superseded `AbortController` both shipped
  as real bugs before being caught).
- **`useSearchParams()` isolated to its own `<Suspense>` leaf, not wrapped around the
  page.** Wrapping the whole Studio route in `<Suspense>` for one query-param read
  meant Next.js shipped an *empty* static HTML shell — nothing rendered until the JS
  bundle hydrated. Measured impact: ~90 Lighthouse performance in production. Pushing
  the boundary down to a small leaf component let the rest of the page stay ordinary
  static content; production performance went from 92 to 98 (see [Quality](#quality)).
- **Telemetry exports synchronously (Sentry), same lesson as the backend.** Both repos
  independently hit the same class of bug: a platform that only allocates resources
  while actively serving a request doesn't reliably run background flush timers.
- **Contract-first client generation.** `openapi-typescript` generates the wire types
  from the same `openapi.yaml` the backend's handlers are generated from; `shared/api/`
  is the only layer allowed to import the generated schema directly, so a contract
  change surfaces as a type error at the boundary, not a runtime surprise deep in a
  component.
- **Astryx (Meta's StyleX-based design system, beta) over shadcn/ui**, with Tailwind
  bridged in via `@theme inline` for layout utilities Astryx doesn't own. A deliberate,
  documented deviation from the original plan, made mid-implementation.
- **Binary light/dark theme, not a 3-state light/dark/system toggle.** An earlier
  "system" option tracked the raw mode instead of the actually-resolved theme, so it
  kept showing the wrong icon on a dark-OS machine. An unset preference still follows
  the OS scheme live; it's just not a state the toggle itself exposes.

## Quality

Measured against the live production deployment, not `next dev`:

| Route | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | 98 | 95 | 100 | 100 |
| `/studio` | 98 | 96 | 100 | 100 |

Reproducible via `pnpm lighthouse <url>` (see [Scripts](#scripts)) — Lighthouse's
default simulated-throttling estimate is noisy on a shared local machine (observed
swinging 8+ points and 1+ second of LCP across back-to-back runs of the same build), so
the numbers above are against the real deployment, the only ones that matter.

108 unit tests (Vitest), 14 e2e tests (Playwright + axe-core, backend fully mocked via
route interception — no live backend needed to run them), 90% coverage floor enforced
in CI.

## Stack

Next.js 16 (App Router, TypeScript strict) · Tailwind CSS v4 ·
[Astryx](https://astryx.atmeta.com/) (Meta's StyleX-based design system) · TanStack
Query v5 · react-hook-form + Zod · openapi-fetch + openapi-typescript · motion ·
[Sentry](https://sentry.io) · Vitest + React Testing Library · Playwright + axe-core ·
Biome (lint + format, replaces ESLint/Prettier) · pnpm · lefthook + commitlint.

**Infrastructure**: Vercel (Hobby plan, Git-integrated deploy, no custom workflow) —
$0/month, same constraint as the backend.

## Development

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if the backend isn't on :8080
pnpm install
pnpm dev
```

Requires the backend running locally
([`pricing-optimizer-api`](https://github.com/rodvieira/pricing-optimizer-api),
`go run ./cmd/api`) for any real functionality — this app has no server-side logic of
its own beyond the Next.js routing shell.

## Scripts

```bash
pnpm dev                      # dev server
pnpm build && pnpm start      # production build + serve
pnpm test                     # unit tests (Vitest)
pnpm test:coverage            # unit tests with the 90% coverage gate
pnpm test:e2e                 # e2e (Playwright), backend mocked
pnpm lighthouse [url]         # Lighthouse against localhost:3000 or any URL
pnpm lint / pnpm lint:fix     # Biome check / check --write
pnpm typecheck                # tsc --noEmit
```

## License

MIT — see [`LICENSE`](./LICENSE).
