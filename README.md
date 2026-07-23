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

Feature-based, not a layered mirror of the backend — colocation over indirection for a
component-heavy UI codebase:

```
domain/            pure business types + logic. Zero React/Next/Zod/TanStack imports —
                    the one layer that would port to a different framework unchanged.
  types/             data shapes only
  stream.ts          the SSE stream-demux reducer
  history.ts          local-history dedupe rule

features/<name>/    colocated by feature: components/, hooks/, loose feature-local logic
  theme/ url-input/ generate-stream/ export/ landing/ studio/ history/

components/ui/      shared cross-feature composition (app header, price display, ...)
lib/api/            the only layer that knows the backend's raw wire format —
                    openapi-typescript-generated types, the fetch client, and
                    per-endpoint wrappers mapping wire shapes to domain/ types

app/                Next.js App Router — routing only. Every page is a thin default
                    export rendering a feature's own top-level component.
```

## Key engineering decisions

- **Hand-rolled SSE consumption, not `EventSource`.** `POST /v1/generate` needs a JSON
  request body and browser `EventSource` can only do bodyless `GET`. A `fetch()` +
  `ReadableStream` frame parser in `lib/api/generate.ts` fills the gap — the single
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
  from the same `openapi.yaml` the backend's handlers are generated from; `lib/api/`
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

## State management & concurrency-adjacent patterns

Three pricing strategies stream in over one interleaved SSE connection, independently,
in whatever order the backend finishes them. There's no real multithreading in a
browser tab, but demultiplexing three concurrent async timelines into consistent UI
state is the same category of problem as backend concurrency, just with `fetch` and
`AbortController` standing in for goroutines and channels.

**A reducer demultiplexing three interleaved timelines.** `domain/stream.ts` is a pure
Redux-style reducer — `streamReducer(state, event) => state`, no React, no `fetch`, no
knowledge of the wire format, trivially unit-testable in isolation. Each strategy owns
its own 4-state machine:

```ts
type StrategyGenerationState =
  | { status: "pending" }
  | { status: "streaming"; partialText: string }
  | { status: "completed"; variation: Variation }
  | { status: "error"; problem: Problem };
```

held in `strategies: Partial<Record<PricingStrategy, StrategyGenerationState>>` — the
reducer's whole job is routing each incoming `StreamEvent` (a 6-variant discriminated
union: `generation_started | variation_started | token | variation_completed | done |
error`) to the one strategy sub-state-machine it belongs to, leaving the other two
untouched.

**A real race condition, and the fix.** Reopening the URL bar mid-stream and submitting
again has to cancel the in-flight request — but a `fetch()` reader's `.read()` can
already have resolved with a chunk *in flight* at the exact instant `abort()` fires, so
the async loop can still yield one more event from the *superseded* stream after
cancellation. Applying it anyway would silently mix a dead generation's data into the
new one's state:

```ts
const controller = new AbortController();
abortControllerRef.current?.abort();      // cancel whatever was running
abortControllerRef.current = controller;
for await (const event of streamGeneration(input, { signal: controller.signal })) {
  if (controller.signal.aborted) return;  // a stale event from the old stream — drop it
  setState((prev) => streamReducer(prev, event));
}
```

The guard is checked again in the `catch` block too, so an abort-induced fetch
rejection doesn't surface as a false "connection lost" error to the user. This — plus a
dropped final SSE frame with no trailing blank line — are the two real bugs this parser
has shipped; both are now covered by regression tests, not just fixed and forgotten.

**A hook can own more than one state machine.** `useGenerateStream` owns the primary
`GenerateStreamState` via the reducer above, *and* a second, smaller one: a per-strategy
`setTimeout` that flags a strategy as "taking longer than usual" after 10s of
`streaming`, cleared the moment it leaves that status. Deliberately kept out of the pure
reducer — it's a presentation-timing concern, not a business rule, so it lives in the
hook instead of leaking a `setTimeout` side effect into otherwise-pure state logic.

**Patterns underneath it all:**

- **Adapter / anti-corruption layer** — every function in `lib/api/` calls the
  generated `openapi-fetch` client, then maps the response through a `toDomain*`
  function before it ever reaches a component. `domain/` is not allowed to import the
  generated wire types at all; a backend contract change becomes a type error at this
  one seam, not a runtime surprise three components deep. Network failures and
  HTTP-level errors are normalized through the same seam into one `Problem` shape, so a
  caller never has to special-case "the server said no" versus "we never reached it."
- **One rendering path for live and historical data** — `generationToStreamState`
  rebuilds the exact same `GenerateStreamState` shape from a persisted `Generation`
  that a live SSE run produces, so `VariationGrid` has no separate "read-only" branch:
  selecting a history entry and watching a live stream complete render through
  identical code.
- **Provider composition root** — `AppProviders` centralizes every cross-cutting client
  provider (TanStack Query, theme mode, motion config) in one place, keeping
  `app/layout.tsx` a thin framework shell with no business logic in it.

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
