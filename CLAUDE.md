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

## Architecture — feature-based, with an isolated domain layer

```
domain/           pure business types + pure logic. Zero imports from react, next, zod,
                  @tanstack/*, or lib/api/schema.ts (generated wire types) anywhere in
                  this tree — the one layer that would port to a different framework
                  unchanged. Kept a top-level sibling of app/, deliberately not nested
                  inside Next's own directory.
  types/          pure data shape declarations ONLY (site-profile, pricing, variation,
                  generation, problem, export). No logic lives here.
  stream.ts       the SSE stream-demux reducer (streamReducer, StreamEvent) — real
                  logic, not a type file; imports from ./types.
  history.ts      the local-history dedupe rule (addToHistory) — same reasoning.

features/<name>/  colocated, feature-scoped. Consistent shape across every feature:
  components/     JSX/markup — only where a feature actually has any.
  hooks/          use-*.ts — only where a feature actually has any.
  <loose files>   feature-local logic/config that's neither a component nor a hook
                  (a Zod schema, a strategy color/label lookup table, an init-script
                  string constant).
  Current features: theme/, url-input/, generate-stream/, export/, landing/, studio/.
  A feature imports domain/ and lib/api/ freely. Features generally should not import
  from each other directly — if two need to share something, it belongs in domain/,
  lib/, or components/ui/.

components/
  ui/             Shared Astryx composition wrappers used across features (app-header).
                  No business logic here.
  providers/      Cross-cutting client providers composed in one place
                  (app-providers.tsx: QueryProvider + ThemeModeProvider + MotionConfig)
                  so app/layout.tsx stays a thin document shell.

lib/api/          The only layer allowed to know the backend's raw wire format: the
                  openapi-typescript-generated schema (lib/api/schema.ts, regenerate
                  with `pnpm sync-openapi` — never hand-edit), the openapi-fetch client
                  instance, per-endpoint call wrappers that map wire shapes into
                  domain/ types, and network-error.ts (normalizes a raw fetch()
                  failure into the same Problem shape as an HTTP-level error, so
                  callers never have to distinguish "the server said no" from "we
                  never reached the server").

app/              Next.js App Router — routing ONLY. Every page is a thin default
                  export rendering a feature's own top-level page component
                  (app/page.tsx → <LandingPage/>, app/studio/page.tsx → <StudioPage/>).
                  app/layout.tsx keeps only the framework-mandated <html>/<head>/<body>
                  shell plus font/metadata setup — no business logic, no raw markup
                  beyond that shell.
```

This is a lighter-touch mirror of the backend's Clean Architecture than a strict
layer-for-layer port: `domain/` keeps the same "pure, framework-agnostic, imports
nothing" property as the Go backend's `internal/domain`, but the rest of the tree
follows idiomatic Next.js feature-based colocation rather than forcing a
`usecase`/`adapter` split that doesn't fit a component-oriented UI codebase. See
`../docs/decisions/0011-frontend-feature-based-reorg.md` for the full account of why
this shape was chosen over the flat structure the repo started with.

TypeScript has no compiler-enforced import wall the way Go does — the `domain/`
boundary above is convention only unless backed by a lint rule. Add one before it's
needed for real (a `no-restricted-imports`-style Biome rule blocking `domain/**` from
importing `react`/`zod`/`@tanstack/*`) rather than relying on the doc comment alone.

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
parser in `lib/api/generate.ts` (zero new dependency; the backend has no
chunk-replay/resume capability, so a library's retry/resume features wouldn't be usable
anyway). This parser has been the single most bug-prone piece of code in this repo — a
silently-dropped final frame with no trailing blank line, and a stale event landing
after a superseded `AbortController` both shipped as real bugs before being caught and
fixed. Read `lib/api/generate.ts` and `features/generate-stream/hooks/use-generate-stream.ts`
in full before touching either again.

## Dark/light theme

Astryx owns `data-theme="light|dark"` on `<html>` via its `<Theme>` component
(`@astryxdesign/core`) — do not add `next-themes` or any second color-mode provider;
Astryx's own docs explicitly warn against two unsynchronized owners.
`features/theme/components/theme-mode-provider.tsx` owns the one piece of state Astryx
needs (the `mode` prop passed to `<Theme>`), persisted to `localStorage`; `useTheme()`
from `@astryxdesign/core` is read-only (resolves current tokens), it does not expose a
setter — the toggle button (`features/theme/components/theme-toggle.tsx`) drives `mode`
state we own, not an Astryx-provided hook. The pre-hydration init script
(`features/theme/theme-init-script.ts`) sets `data-theme` on `<html>` before React
hydrates to avoid a flash of the wrong theme — `app/layout.tsx`'s `suppressHydrationWarning`
on `<html>` is intentional and expected, not a bug to "fix."

## Known, tracked gaps (don't re-discover these — check the issue first)

- **React Testing Library has zero tests** despite being installed since scaffolding.
  Vitest covers pure logic only (Zod schemas, the SSE frame parser, error normalization).
  Add RTL tests for components with real conditional-rendering branches
  (`VariationCard`'s discriminated-union status rendering, `UrlInputForm`'s validation
  states) before/alongside touching them further.
- **No session has run the Studio flow against a live `pricing-optimizer-api`** — see
  issue #4. Everything is verified via Playwright route-interception mocks
  (`test/e2e/mock-backend.ts`) or the backend being deliberately unreachable.
- **Lighthouse has never been measured** — see issue #5.
- **"Edit inline"** (present in the generated design, disabled until a variation
  completes) has no defined behavior — see issue #1.

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
MUST NOT be edited directly. Regenerate `lib/api/schema.ts` after every sync:
`pnpm exec openapi-typescript openapi.yaml -o lib/api/schema.ts`.

## Testing

Vitest for logic, colocated with the file it tests (e.g. `lib/api/analyze.test.ts` next
to `analyze.ts`) rather than mirrored under a separate test tree. Playwright + axe-core
for e2e/accessibility under `test/e2e/`, backend fully mocked via
`test/e2e/mock-backend.ts`'s route interception — no live backend needed to run
`pnpm test:e2e`. `test/setup.ts` is the one shared Vitest bootstrap file.

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
  the domain/features/components/lib architecture boundaries, Astryx design-system
  discipline, and test rigor, with a focus on flagging unnecessary/dead code and this
  repo's own recurring bug classes (the SSE parser, WCAG contrast). Run it on the branch
  diff before opening a PR (not after) and fix blocking findings first.

## Sprint status

Sprint 8 (Studio/landing feature, PR #2) and Sprint 9 (motion + a11y + e2e polish, PR #3)
shipped. CI added (PR #6). Folder architecture reorganized (PR #7, see
`../docs/decisions/0011-frontend-feature-based-reorg.md`) — domain split into
types/logic, `app/` thinned to routing-only, every feature given a consistent
components/hooks/logic shape. See "Known, tracked gaps" above for what's next; full
Sprint 8-10 scope in `../HANDOFF.md` section 12.
