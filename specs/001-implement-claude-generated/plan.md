# Implementation Plan: Studio & Landing — implement the generated design

**Branch**: `001-implement-claude-generated` | **Date**: 2026-07-16 | **Spec**: `./spec.md`

**Input**: Feature specification from `/specs/001-implement-claude-generated/spec.md`

## Summary

Port the claude.ai-generated visual direction (`../../docs/design/Pricing Optimizer.dc.html`,
a throwaway Design Canvas prototype with fake timers and inline styles) into the real
Next.js app: a Studio page that calls `POST /v1/analyze` then streams `POST /v1/generate`
over a hand-rolled SSE reader into three independently-progressing strategy cards, a
hover-compare interaction, an export dialog backed by `POST /v1/export/{id}`, and a
redesigned landing page — all built from real Astryx components and the existing
`domain/`/`features/`/`lib/api/` layering, not copied from the mock's markup.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19

**Primary Dependencies**: `@astryxdesign/core` + `@astryxdesign/theme-neutral`, Tailwind CSS
v4, `react-hook-form` + `zod`, `openapi-fetch`/`openapi-typescript`, TanStack Query v5,
`motion`, `lucide-react`

**Storage**: N/A — no client-side persistence in this feature (no `features/history/`)

**Testing**: Vitest + React Testing Library (unit/component), Playwright + axe-core (e2e/a11y)

**Target Platform**: Browser (Next.js App Router, client components for interactive pages)

**Project Type**: Web application frontend (single Next.js project; backend is the sibling
`pricing-optimizer-api` repo, consumed only over HTTP/SSE per `openapi.yaml`)

**Performance Goals**: SSE tokens must render as they arrive (no batching/debounce hiding
streaming); no dependency on backend response time beyond what the design's own "taking
longer than usual" (10s) threshold already accounts for.

**Constraints**: Browser `EventSource` cannot be used (`POST /v1/generate` requires a JSON
body) — SSE consumption must be a hand-rolled `fetch()` + `ReadableStream` parser. Astryx's
`data-theme` dark/light provider must remain the only theme-mode owner.

**Scale/Scope**: 5 screens (landing, Studio empty/streaming, hover-compare interaction,
export dialog, error states) as scoped in `spec.md`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First (OpenAPI)**: PASS. This feature reads the already-synced
  `lib/api/schema.ts`; no contract changes are needed for `/v1/analyze`, `/v1/generate`, or
  `/v1/export/{id}` — all three already exist in `openapi.yaml`.
- **II. Feature-Based Architecture with an Isolated Domain Layer**: PASS. New code lands in
  `lib/api/` (wire mapping only), `features/url-input/`, `features/generate-stream/`,
  `features/export/`, `components/ui/`, and thin `app/` routes — reusing the existing
  `domain/stream.ts` `streamReducer` rather than duplicating stream-demux logic.
- **III. Design-System Discipline (Astryx)**: PASS. Strategy colors map onto Astryx's
  existing `orange`/`teal`/`pink` non-semantic variants instead of inventing CSS; `CodeBlock`,
  `Dialog`, `TabList`, `Skeleton`, `Banner`, `EmptyState` replace the mock's hand-rolled
  spinners/highlighter. Font swap (Bricolage Grotesque + IBM Plex Sans/Mono) is additive to
  `next/font/google`, no new theming mechanism.
- **IV. Test Rigor**: PASS, with one addition — the new SSE frame parser
  (`lib/api/generate.ts`) is non-trivial and untested elsewhere, so it gets a dedicated
  Vitest unit test against a fixture byte stream.
- **V. Shipped-Artifact Discipline**: PASS. English-only, Conventional Commits, no emojis, no
  `console.log`, ADR to be added if a non-trivial decision surfaces during implementation.

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-implement-claude-generated/
├── plan.md              # This file
└── tasks.md             # Phase 2 output (/speckit-tasks equivalent, done by hand this session)
```

No `research.md`/`data-model.md`/`contracts/` — the wire contract already exists in
`openapi.yaml`/`lib/api/schema.ts` and the domain model already exists in `domain/*.ts`;
there is no unresolved unknown requiring dedicated research output.

### Source Code (repository root)

```text
lib/api/
├── analyze.ts            # POST /v1/analyze wrapper, wire → domain SiteProfile
├── generate.ts            # fetch()+ReadableStream SSE parser → AsyncGenerator<StreamEvent>
├── get-generation.ts       # GET /v1/generations/{id} wrapper
└── export.ts               # POST /v1/export/{id} wrapper, wire → domain ExportResult

features/url-input/
├── url-input-schema.ts
├── use-analyze.ts
└── url-input-form.tsx

features/generate-stream/
├── strategy-meta.ts         # anchor→orange, freemium→teal, value_based→pink + labels
├── use-generate-stream.ts   # useReducer(streamReducer) + fetch loop + slow-timer state
├── variation-card.tsx
├── pricing-tier-row.tsx
└── variation-grid.tsx        # owns hoveredTierIndex, 3-col responsive grid

features/export/
├── use-export.ts
└── export-dialog.tsx

components/ui/
└── app-header.tsx           # sticky header, moves into app/layout.tsx

app/
├── layout.tsx                # font swap, renders <AppHeader />
├── page.tsx                  # redesigned landing
└── studio/page.tsx           # new route, orchestrates the flow above

test/
└── lib/api/generate.test.ts  # SSE frame parser unit test (fixture byte stream)
```

**Structure Decision**: Single Next.js project (no separate backend/frontend split needed —
the backend is the sibling `pricing-optimizer-api` repo, consumed only via HTTP/SSE). Follows
this repo's existing `domain/`/`features/`/`components/ui/`/`lib/api/`/`app/` layering
exactly as documented in this repo's `CLAUDE.md`; no new top-level directories introduced.

## Complexity Tracking

Not applicable — no Constitution Check violations.
