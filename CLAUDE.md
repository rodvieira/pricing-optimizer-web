# pricing-optimizer-web — frontend context

Next.js 15/16 frontend for Pricing Optimizer. This is Git repo #2. Cross-cutting product
context lives in the umbrella `../.claude/CLAUDE.md`; the full decision log is
`../HANDOFF.md`. The backend (`pricing-optimizer-api`) is a separate Go repo — see its
own `CLAUDE.md` for the API implementation.

## What this is

The UI for pasting a product URL, watching three AI-generated pricing-page variations
stream in live over SSE, comparing/editing them, and exporting as JSX/HTML/Stripe
Pricing Table config. See `openapi.yaml` (synced from the umbrella root) for the backend
contract this consumes.

## Architecture — feature-based, with an isolated domain layer

```
domain/       pure business types + pure logic (the stream reducer, history rules).
              Zero imports from react, next, zod, @tanstack/*, or lib/api/schema.ts
              (generated wire types). This is the one layer that would port to a
              different framework unchanged — kept a top-level sibling of app/,
              deliberately not nested inside Next's own directory.
features/     colocated, feature-scoped: components + hooks + feature-local logic
              live together (features/theme/, features/url-input/,
              features/generate-stream/, features/export/, features/history/).
              A feature imports domain/ and lib/api/ freely. Features generally
              should not import from each other directly — if two need to share
              something, it belongs in domain/, lib/, or components/ui/.
components/ui/  Shared Astryx composition wrappers used across features. No business
                logic here.
lib/api/      The only layer allowed to know the backend's raw wire format: the
              openapi-typescript-generated schema (lib/api/schema.ts, regenerate with
              `pnpm sync-openapi` — never hand-edit), the openapi-fetch client
              instance, and per-endpoint call wrappers that map wire shapes into
              domain/ types.
app/          Next.js App Router — routes and top-level composition only. Kept thin;
              real logic lives in features/ and domain/.
```

This is a lighter-touch mirror of the backend's Clean Architecture than a strict
layer-for-layer port: `domain/` keeps the same "pure, framework-agnostic, imports
nothing" property as the Go backend's `internal/domain`, but the rest of the tree
follows idiomatic Next.js feature-based colocation rather than trying to force a
`usecase`/`adapter` split that doesn't fit a component-oriented UI codebase.

TypeScript has no compiler-enforced import wall the way Go does — the `domain/` boundary
above is convention only unless backed by a lint rule. Add one before it's needed for
real (a `no-restricted-imports`-style Biome/ESLint rule blocking `domain/**` from
importing `react`/`zod`/`@tanstack/*`) rather than relying on the doc comment alone.

## Stack

Next.js 16 (App Router, TypeScript strict), Tailwind CSS v4, **Astryx** (Meta's React
design system, built on StyleX, MIT, currently beta — chosen over shadcn/ui) via its
pre-compiled-CSS "simple path" with Tailwind bridged in via `@theme inline` (see
`app/globals.css` for the exact `@layer`/import order — do not reorder it), motion,
react-hook-form + Zod, openapi-fetch + openapi-typescript, TanStack Query v5, Vitest +
RTL, Playwright + axe-core, Biome (replaces ESLint + Prettier), pnpm, lefthook +
commitlint.

## SSE consumption (a documented correction to HANDOFF.md)

`POST /v1/generate` returns `text/event-stream` but requires a JSON request body.
Browser `EventSource` can only do GET with no body, so it cannot call this endpoint —
HANDOFF.md's stack table says "native EventSource," which is technically impossible for
this contract. The actual approach: a hand-rolled `fetch()` + `ReadableStream` frame
parser in `features/generate-stream/` (zero new dependency; the backend has no
chunk-replay/resume capability, so a library's retry/resume features wouldn't be usable
anyway). See `docs/decisions/` for the ADR once written.

## Dark/light theme

Astryx owns `data-theme="light|dark"` on `<html>` via its `<Theme>` component
(`@astryxdesign/core`) — do not add `next-themes` or any second color-mode provider;
Astryx's own docs explicitly warn against two unsynchronized owners.
`features/theme/theme-mode-provider.tsx` owns the one piece of state Astryx needs (the
`mode` prop passed to `<Theme>`), persisted to `localStorage`; `useTheme()` from
`@astryxdesign/core` is read-only (resolves current tokens), it does not expose a
setter — the toggle button drives `mode` state we own, not an Astryx-provided hook.

## Contract workflow (source of truth)

`openapi.yaml` is generated/owned at the umbrella root, synced here via
`make sync-openapi` (or manually: `cp ../openapi.yaml ./openapi.yaml`). This repo's copy
MUST NOT be edited directly. Regenerate `lib/api/schema.ts` after every sync:
`pnpm exec openapi-typescript openapi.yaml -o lib/api/schema.ts`.

## Hard rules

English everywhere in shipped artifacts. No emojis in commits/PRs/code. No
`console.log` in shipped code. Secrets only via env (`NEXT_PUBLIC_*` for anything the
client needs — never put a real secret in a `NEXT_PUBLIC_*` var, it ships to the
browser). Conventional Commits, enforced by commitlint + lefthook. Every non-trivial
architectural decision gets an ADR in `../docs/decisions/`.

## Branching workflow

Mirrors the backend: `main` is protected, branch-per-task, PR + review before merge.

## Sprint status

Sprint 8 (frontend foundation) in progress: repo scaffolded, Astryx + Tailwind wired,
openapi codegen wired, domain types written, theme provider/toggle working. Not yet
built: URL input, the actual SSE-consuming generate-stream feature, variation cards,
export modal, history. See `../HANDOFF.md` section 12 for full Sprint 8-10 scope and
section 13 for the frontend definition-of-done checklist.
