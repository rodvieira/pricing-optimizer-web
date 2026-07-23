# pricing-optimizer-web — frontend context

Next.js frontend for Pricing Optimizer. This is Git repo #2. Cross-cutting product
context lives in the umbrella `../.claude/CLAUDE.md`; the full decision log is
`../HANDOFF.md`. The backend (`pricing-optimizer-api`) is a separate Go repo — see its
own `CLAUDE.md` for the API implementation.

## What this is

The UI for pasting a product URL, watching three AI-generated pricing-page variations
stream in live over SSE, comparing them (hover-highlight equivalent tiers across
strategies), and exporting as JSX/HTML/Stripe Pricing Table config. See `openapi.yaml`
(synced from the umbrella root) for the backend contract this consumes.

## Architecture — FSD-lite under src/, layered `app -> views -> features -> entities -> shared`

```
src/
  app/              Next.js App Router — routing ONLY. Every page is a thin default
                    export rendering a view's own top-level component
                    (app/page.tsx → <LandingPage/>, app/studio/page.tsx → <StudioPage/>).
                    app/layout.tsx keeps only the framework-mandated <html>/<head>/<body>
                    shell plus font/metadata setup — no business logic, no raw markup
                    beyond that shell.

  views/<name>/     page compositions, each rendered by exactly one app/ route.
                    Current: studio/, landing/. Same internal shape as features/
                    (components/, loose files) — the distinction from features/ is
                    purely "does this have its own route," not internal structure.

  features/<name>/  reusable capability slices, colocated: components/, hooks/, loose
                    feature-local logic/config that's neither (a Zod schema, an
                    init-script string constant). Current: url-input/, generate-stream/,
                    export/, history/. Each has an index.ts barrel — its declared
                    public surface; something outside the feature imports from the
                    barrel, never a deep path into it. Imports *within* the same
                    feature (including that feature's own tests) keep importing the
                    concrete file directly, no barrel indirection needed.

  entities/<name>/  domain concepts shared across views/features that are more than a
                    pure type but owned by no single feature. Current: strategy/
                    (STRATEGY_META, strategyMeta — display metadata the landing preview
                    and Studio's variation cards both need). Also has an index.ts barrel.

  shared/           framework-agnostic or cross-cutting code with no feature identity.
    domain/           pure business types + pure logic. Zero imports from react, next,
                      zod, @tanstack/*, or shared/api/schema.ts (generated wire types)
                      anywhere in this tree — the one layer that would port to a
                      different framework unchanged.
      types/          pure data shape declarations ONLY (site-profile, pricing,
                      variation, generation, problem, export). No logic lives here.
      stream.ts       the SSE stream-demux reducer (streamReducer, StreamEvent) — real
                      logic, not a type file; imports from ./types.
      history.ts      the local-history dedupe rule (addToHistory) — same reasoning.
    api/              The only layer allowed to know the backend's raw wire format: the
                      openapi-typescript-generated schema (shared/api/schema.ts,
                      regenerate with `pnpm sync-openapi` — never hand-edit), the
                      openapi-fetch client instance, per-endpoint call wrappers that
                      map wire shapes into shared/domain/ types, and network-error.ts
                      (normalizes a raw fetch() failure into the same Problem shape as
                      an HTTP-level error, so callers never have to distinguish "the
                      server said no" from "we never reached the server").
    ui/               Shared Astryx composition wrappers used across features
                      (app-header, price-display, card-action-button, ...). No
                      business logic here.
    providers/        Cross-cutting client providers composed in one place
                      (app-providers.tsx: QueryProvider + ThemeModeProvider +
                      MotionConfig) so app/layout.tsx stays a thin document shell.
    theme/            Astryx color-mode integration — moved here, not kept as a
                      features/ slice, because shared/ui/ and shared/providers/
                      both need it, and shared/ importing from features/ would
                      itself be a backward-layer violation (see ADR-0016).
                      theme-mode-provider.tsx, theme-toggle.tsx, theme-init-script.ts,
                      pricing-optimizer-theme.ts (source), generated/ (build output,
                      see Stack below). Also has an index.ts barrel.
```

Layer dependency direction is `app -> views -> features -> entities -> shared`, never
sideways (a feature importing another feature's internals) or backward (shared
importing from features). This is a lighter-touch mirror of the backend's Clean
Architecture than a strict layer-for-layer port: `shared/domain/` keeps the same "pure,
framework-agnostic, imports nothing" property as the Go backend's `internal/domain`, but
the rest of the tree follows FSD-lite layering sized to this app rather than forcing a
`usecase`/`adapter` split that doesn't fit a component-oriented UI codebase. See
`../docs/decisions/0011-frontend-feature-based-reorg.md` for the original feature-based
reorg and `../docs/decisions/0016-frontend-fsd-layers.md` for why it was superseded by
this layered shape (the short version: `features/studio` and `features/landing` were
page compositions, not reusable slices, indistinguishable by location from the six that
actually were — and `features/landing` importing directly from
`features/generate-stream/strategy-meta.ts` for shared display metadata had already
violated the original "features don't import each other" rule with nothing enforcing it).

TypeScript has no compiler-enforced import wall the way Go does — the layer boundaries
above are convention only unless backed by a lint rule; Biome's boundary-enforcement
options are narrower than ESLint's plugin ecosystem (no direct
`eslint-plugin-boundaries` equivalent as of ADR-0016). Add one before it's needed for
real (a `shared/domain/**` importing `react`/`zod`/`@tanstack/*` rule is the cheapest
first slice) rather than relying on the doc comment alone.

## Stack

Next.js (App Router, TypeScript strict), Tailwind CSS v4, **Astryx** (Meta's React
design system, built on StyleX, MIT, currently beta — chosen over shadcn/ui) via its
pre-compiled-CSS "simple path" with Tailwind bridged in via `@theme inline` (see
`app/globals.css` for the exact `@layer`/import order — do not reorder it), motion,
react-hook-form + Zod, openapi-fetch + openapi-typescript, TanStack Query v5, Vitest +
RTL, Playwright + axe-core, Biome (replaces ESLint + Prettier), pnpm, lefthook +
commitlint. Full item-by-item stack rationale (alternatives considered, what shipped vs.
deviated vs. is still missing) is a published artifact referenced from
`../docs/decisions/0011-frontend-feature-based-reorg.md`.

## SSE consumption (a documented correction to HANDOFF.md)

`POST /v1/generate` returns `text/event-stream` but requires a JSON request body.
Browser `EventSource` can only do GET with no body, so it cannot call this endpoint —
HANDOFF.md's stack table says "native EventSource," which is technically impossible for
this contract. The actual approach: a hand-rolled `fetch()` + `ReadableStream` frame
parser in `shared/api/generate.ts` (zero new dependency; the backend has no
chunk-replay/resume capability, so a library's retry/resume features wouldn't be usable
anyway). This parser has been the single most bug-prone piece of code in this repo — a
silently-dropped final frame with no trailing blank line, and a stale event landing
after a superseded `AbortController` both shipped as real bugs before being caught and
fixed. Read `shared/api/generate.ts` and `features/generate-stream/hooks/use-generate-stream.ts`
in full before touching either again.

## Dark/light theme

Astryx owns `data-theme="light|dark"` on `<html>` via its `<Theme>` component
(`@astryxdesign/core`) — do not add `next-themes` or any second color-mode provider;
Astryx's own docs explicitly warn against two unsynchronized owners.
`shared/theme/components/theme-mode-provider.tsx` owns the one piece of state Astryx
needs (the `mode` prop passed to `<Theme>`), persisted to `localStorage`; `useTheme()`
from `@astryxdesign/core` is read-only (resolves current tokens), it does not expose a
setter — the toggle button (`shared/theme/components/theme-toggle.tsx`) drives `mode`
state we own, not an Astryx-provided hook. The pre-hydration init script
(`shared/theme/theme-init-script.ts`) sets `data-theme` on `<html>` before React
hydrates to avoid a flash of the wrong theme — `app/layout.tsx`'s `suppressHydrationWarning`
on `<html>` is intentional and expected, not a bug to "fix." **`mode` is binary
(`"light" | "dark"` only, no third `"system"` state the toggle cycles through)** — an
earlier version added a `system` option to the toggle itself, but its icon/label tracked
raw `mode` instead of the actually-resolved theme, so on a dark-OS machine it kept
showing the sun icon over a dark page. An unset preference still follows the OS scheme
live (`ThemeModeProvider` listens for `matchMedia` changes until the user picks
explicitly) — that part of the original design brief holds — it just isn't a state the
toggle itself exposes anymore.

## Local history (`features/history/`)

`shared/domain/history.ts`'s `addToHistory` (prepend, dedupe by id, trim to
`MAX_HISTORY_ENTRIES`) is the pure business rule; `features/history/local-history-storage.ts`
+ `hooks/use-local-history.ts` is the localStorage adapter (structural-only validation —
this is data the app itself wrote, not external input, so a full Zod schema would be
overkill; a shape that doesn't look like a `Generation` is just dropped rather than
crashing the reader). `StudioPage` records a live generation to history exactly once,
keyed off `generationId`, as soon as its stream reaches `done`. Selecting a history
entry doesn't replay a request — `shared/domain/stream.ts`'s `generationToStreamState` turns a
stored `Generation` back into the same `GenerateStreamState` shape a live stream
produces, so `VariationGrid` has one rendering path for both. **`Generation.siteProfile`
is optional on the wire** (not in `openapi.yaml`'s `required` list for that schema) — a
history entry may not have one, so the empty-state/grid gating in `StudioPage` keys off
`viewedGeneration`, not `siteProfile`, alongside the live-flow's own `siteProfile` check.
Getting this wrong (gating only on `siteProfile`) silently hides the grid for any
history entry the backend returned without a profile — caught by the e2e test in
`test/e2e/studio.spec.ts` before it shipped, worth keeping if this code is touched again.

## `useSearchParams()` needs its own `<Suspense>` leaf, not a page-level one

Next.js requires a `<Suspense>` boundary somewhere above any `useSearchParams()` call
on a statically-prerendered route, since the value genuinely isn't known at build time.
Wrapping the *whole page* in that boundary (the original approach in
`app/studio/page.tsx`, for the "Watch a live run" `?url=` deep link) means Next.js emits
an **empty static shell** for everything inside it — the heading, URL bar, empty state,
all of it — with real content appearing only once the JS bundle hydrates. Measured
impact (issue #5): Studio scored ~90 on Lighthouse performance even against the real
Vercel deployment, with the LCP breakdown insight showing hundreds of ms of
"element render delay" and no matching network cost. Fixed by isolating the hook into
its own leaf (`views/studio/components/studio-auto-run.tsx`), Suspense-wrapped
*inside* `StudioPage` rather than around it in `app/studio/page.tsx` — the rest of the
page is ordinary static content again. If a future page needs `useSearchParams()`
(or any other hook requiring Suspense), push the boundary down to the smallest leaf
that actually needs it; don't wrap the route component.

## Known, tracked gaps (don't re-discover these — check the issue first)

- **"Edit inline"** (present in the generated design, disabled until a variation
  completes) has no defined behavior — see issue #1.

Issue #5 (Lighthouse >= 95, HANDOFF.md Sprint 9 target) is resolved as far as code
changes go: `pnpm lighthouse` (`scripts/lighthouse.mjs`) now exists for repeatable
measurement, and the real root cause (the Suspense issue above) is fixed. Production
scored 99/92 (landing/studio) *before* that fix; re-measure `pnpm lighthouse
https://pricing-optimizer-web.vercel.app` after this deploys to confirm Studio clears
95 too. Local `pnpm dev`/`pnpm start` measurements on a shared dev machine are noisy —
Lighthouse's simulated-throttling LCP estimate has been observed swinging 8+ score
points and 1+ second across back-to-back runs of the same unchanged build; treat a
local run as a smoke check, not the authoritative number.

Issue #4 ("no session has run the Studio flow against a live `pricing-optimizer-api`")
is closed — the Studio flow (analyze → generate SSE → export) has been verified against
a real, locally-running backend, and the deployed production stack (Vercel calling the
live Cloud Run API) has been smoke-tested end to end. Playwright's mocked backend
(`test/e2e/mock-backend.ts`) remains the right approach for CI/automated e2e regardless
— it's about not depending on a live backend in the test suite, not a substitute for the
one-time real-integration check that's now done.

## Color-contrast discipline (a real, repeated bug class here)

This repo has shipped WCAG AA contrast failures more than once (`text-secondary` on
`bg-muted` at 4.19:1 against a 4.5:1 requirement; `text-disabled` used for real
informational text at as low as 2.23:1). `text-disabled` is meant for actually-disabled
controls, not muted-but-readable informational text — reach for `text-secondary` or
`text-primary` depending on what the background actually is, and when in doubt, let the
`test/e2e/` axe-core checks (`landing.spec.ts`, `studio.spec.ts`) tell you rather than
eyeballing it.

## Contract workflow (source of truth)

`openapi.yaml` is generated/owned at the umbrella root, synced here via
`pnpm sync-openapi` (or manually: `cp ../openapi.yaml ./openapi.yaml`). This repo's copy
MUST NOT be edited directly. Regenerate `shared/api/schema.ts` after every sync:
`pnpm exec openapi-typescript openapi.yaml -o src/shared/api/schema.ts`.

## Testing

Vitest for logic, colocated with the file it tests (e.g. `shared/api/analyze.test.ts` next
to `analyze.ts`) rather than mirrored under a separate test tree. Playwright + axe-core
for e2e/accessibility under `test/e2e/`, backend fully mocked via
`test/e2e/mock-backend.ts`'s route interception — no live backend needed to run
`pnpm test:e2e`. `test/setup.ts` is the one shared Vitest bootstrap file. `test/render.tsx`
wraps a component under test in Astryx's `<Theme>` (matching how `AppProviders` mounts it
for real); `test/query-wrapper.tsx` does the same for TanStack Query hooks. jsdom is
missing a few browser APIs Astryx depends on — `matchMedia` and `<dialog>`'s
`showModal()`/`close()` — polyfilled once in `test/setup.ts` rather than per test file.
`test/` stays centralized at the repo root (not under `src/`, per ADR-0011's original
reasoning and unchanged by ADR-0016's later layer reorg) — since `@/*` resolves to
`src/*`, a colocated unit test reaching for `test/render.tsx` or
`test/query-wrapper.tsx` imports it via the separate `@test/*` alias
(`import { render, screen } from "@test/render"`), configured in both `tsconfig.json`
and `vitest.config.ts` — keep the two in sync if either changes.

**Coverage gate: `pnpm test:coverage` (`vitest run --coverage`) enforces a 90% floor on
statements/branches/functions/lines**, configured in `vitest.config.ts` and run in CI
(`.github/workflows/ci.yml`'s `test` job — plain `pnpm test` stays the pre-push hook's
fast path locally). The include/exclude list in `vitest.config.ts` is deliberate, not
exhaustive-by-default: generated code (`shared/api/schema.ts`), pure type declarations
(`shared/domain/types/**`), and files with genuinely zero branching logic of their own
(`views/landing/**`'s static marketing composition, `shared/providers/query-provider.tsx`,
`shared/api/client.ts`) are excluded, per Constitution IV's stance that purely presentational
composition doesn't need a dedicated test. Everything else — including the TanStack Query
hooks (`use-analyze.ts`, `use-export.ts`) and dialog/provider components that look like
"just wiring" — is in scope and was brought up to the floor; a hook or component with a
real branch (a ternary, an early return, an `enabled` condition) earns its test even when
small. Extend the exclude list only for the same reason as the existing entries, not to
chase the number.

## Hard rules

English everywhere in shipped artifacts. No emojis in commits/PRs/code. No
`console.log` in shipped code. Secrets only via env (`NEXT_PUBLIC_*` for anything the
client needs — never put a real secret in a `NEXT_PUBLIC_*` var, it ships to the
browser). Conventional Commits, enforced by commitlint + lefthook (see
`commitlint.config.js` for the valid `scope-enum`). Every non-trivial architectural
decision gets an ADR in `../docs/decisions/`.

## Workflow

Spec-driven: `/speckit-constitution` → `/speckit-specify` → `/speckit-plan` →
`/speckit-tasks` → `/speckit-implement` for real features with their own user stories;
a standalone `<type>/<slug>` branch for tooling/CI/refactors/docs. Constitution lives in
`.specify/memory/constitution.md`.

## Branching workflow (constitution: branch-per-task)

`main` is protected — never develop or commit on it directly. Create the branch BEFORE
writing code, from an up-to-date `main`:
- Spec-driven feature: `NNN-slug`, created via `.specify/scripts/bash/create-new-feature.sh`
  (e.g. `002-sprint-9-ux`). Never rename it; `specs/NNN-slug/` must match.
- Standalone change (CI, deps, tooling, docs, refactor, hotfix): `<type>/<slug>`,
  Conventional type + kebab-case slug (e.g. `refactor/frontend-folder-architecture`).

One branch = one logical unit of work. **Before pushing the branch or opening a PR, run
the `pr-reviewer` agent against the local diff (`git diff main...HEAD`) and fix blocking
findings — the PR should already be clean when it opens, not fixed up after with a
follow-up commit.** Every change reaches `main` only via a PR (CI green: lint/typecheck,
unit tests, e2e, build, commitlint — see `.github/workflows/ci.yml`); delete the branch
after merge.

## Project agents (`.claude/agents/`)

- `pr-reviewer` — read-only senior review of a diff/PR against this repo's constitution,
  the shared/views/features/entities architecture boundaries, Astryx design-system
  discipline, and test rigor, with a focus on flagging unnecessary/dead code and this
  repo's own recurring bug classes (the SSE parser, WCAG contrast). Run it on the branch
  diff before opening a PR (not after) and fix blocking findings first.

## Sprint status

Sprints 8-9 (Studio/landing, motion + a11y + e2e, CI, folder reorg — PRs #2/#3/#6/#7),
RTL coverage and the 90% coverage floor (#8, #10), local history (#9), the warm-cream
design-mock palette (#12), and further design-parity passes against
`docs/design/Pricing Optimizer.html` (#13-#16 — real example URLs replacing the mock's
fictional placeholder domains, Bricolage Grotesque typography, header/hero/container
sizing, the binary light/dark toggle, and the landing hero's "Watch a live run" now
deep-linking into an auto-running Studio) are all shipped and merged. **Deployed**: live
on Vercel at `https://pricing-optimizer-web.vercel.app`, calling the real
`pricing-optimizer-api` on Cloud Run (`NEXT_PUBLIC_API_URL` set manually in the Vercel
project's env vars, not automated — reconfirm it still points at the live backend URL if
that ever changes). See "Known, tracked gaps" above for what's next; full Sprint 8-10
scope in `../HANDOFF.md` section 12.
