<!--
Sync Impact Report
- Version change: 1.2.0 → 2.0.0
- Rationale: Principle III is REDEFINED, not just expanded — the design-system
  dependency it mandates changed from Astryx (`@astryxdesign/*`, now fully removed) to
  shadcn/ui's vendored-component model over Radix UI, per spec `003-shadcn-ui-migration`
  (issue #33) and ADR-0018. A principle redefinition is a MAJOR bump per Governance
  below, not a MINOR addition. In the same amendment: Principle II's stale
  `domain/`/`features/`/`components/ui/`/`lib/api/` references (predating ADR-0016's
  `app -> views -> features -> entities -> shared` layer reorg) are corrected; the two
  remaining stale `lib/api/` mentions in Principle I and the Additional Constraints SSE
  bullet are corrected to `shared/api/` for the same reason, while this file was already
  open for the same class of fix; and the "Additional Constraints (Stack & Cost)"
  fixed-stack list is updated to name the new design-system stack.
- Principles: unchanged in count (I. Contract-First, II. Layered Architecture with an
  Isolated Domain Layer, III. Design-System Discipline, IV. Test Rigor, V.
  Shipped-Artifact Discipline); II renamed from "Feature-Based Architecture" to
  "Layered Architecture" to match its corrected content; III's dependency and rules
  fully redefined
- Modified sections: I. Contract-First (stale `lib/api/` path corrected), II. Layered
  Architecture (folder names and layer direction corrected to ADR-0016's shape), III.
  Design-System Discipline (Astryx → shadcn/ui + Radix, including the
  vendored-flat-and-excluded vs. owned-foldered-and-tested rule from spec
  Clarification 2), Additional Constraints (Stack & Cost) (fixed-stack list, stale
  `lib/api/` path corrected)
- Added sections: none
- Removed sections: none
- Templates requiring updates:
    ✅ .specify/templates/plan-template.md (no Astryx/stale-path reference; no edit needed)
    ✅ .specify/templates/spec-template.md (no Astryx/stale-path reference; no edit needed)
    ✅ .specify/templates/tasks-template.md (no Astryx/stale-path reference; no edit needed)
- Follow-up TODOs: none
-->

<!--
Sync Impact Report (previous amendment, retained for history)
- Version change: 1.1.0 → 1.2.0
- Rationale: Principle IV (Test Rigor) gained a mandatory 90% coverage floor
  (statements/branches/functions/lines), enforced by `pnpm test:coverage` in CI. MINOR
  bump — a materially expanded quality gate, not a clarification of existing text, and
  no principle was removed or redefined. See `CLAUDE.md`'s Testing section for the
  include/exclude rationale (generated code, pure types, and genuinely presentational
  composition stay excluded per this same principle's existing exemption).
- Modified sections: IV. Test Rigor (added the coverage gate)
-->

<!--
Sync Impact Report (previous amendment, retained for history)
- Version change: 1.0.0 → 1.1.0
- Rationale: Added a mandatory `pr-reviewer` agent gate to Development Workflow &
  Quality Gates, mirroring pricing-optimizer-api's own constitution requirement now that
  this repo has an equivalent agent (`.claude/agents/pr-reviewer.md`). MINOR bump — a
  materially expanded workflow requirement, not a clarification of existing text, and no
  principle was removed or redefined.
- Modified sections: Development Workflow & Quality Gates (added the pr-reviewer gate)
-->

# Pricing Optimizer Web Constitution

## Core Principles

### I. Contract-First (OpenAPI)

`openapi.yaml` is authored and owned at the umbrella root and synced into this repo via
`pnpm sync-openapi` (`cp ../openapi.yaml` + `openapi-typescript` codegen into
`shared/api/schema.ts`). This repo's copy MUST NOT be hand-edited, and `shared/api/schema.ts`
MUST NOT be hand-edited — both are generated. No new call to the backend ships without the
spec covering it first.

Rationale: A generated, spec-driven contract eliminates drift between the Go backend and
this frontend, and makes the wire shape reviewable independently of UI implementation.

### II. Layered Architecture with an Isolated Domain Layer

The codebase under `src/` is organized in a strict layer direction, `app -> views ->
features -> entities -> shared`, never sideways (one `features/<name>/` reaching into
another's internals instead of its `index.ts` barrel) or backward (a lower layer
importing from a higher one):

- `app/` — Next.js App Router, routing only. Every page is a thin default export
  rendering a `views/` component.
- `views/<name>/` — page compositions, each rendered by exactly one `app/` route
  (`studio/`, `landing/`).
- `features/<name>/` — reusable capability slices with no inherent page identity
  (`url-input/`, `generate-stream/`, `export/`, `history/`), each with an `index.ts`
  barrel as its declared public surface.
- `entities/<name>/` — domain concepts shared across views/features that are more than
  a pure type but owned by no single feature (`strategy/`).
- `shared/` — framework-agnostic or cross-cutting code with no feature identity:
  `domain/` (pure business types + logic — zero imports from react, next, zod,
  @tanstack/*, or the generated wire schema; the one layer that would port to a
  different framework unchanged), `api/` (the only layer allowed to know the backend's
  raw wire format), `ui/` (shared cross-feature composition, vendored design-system
  primitives, and owned components — see Principle III), `providers/`, `theme/`.

This is deliberately NOT a layer-for-layer mirror of the backend's Clean Architecture
(`domain`/`usecase`/`adapter`) — that mirroring was tried and explicitly rejected
mid-implementation as "too far from how frontend code actually gets organized." Only the
"pure, framework-agnostic, imports nothing" property of `shared/domain/` carries over.
The layer *direction* is enforced, not just documented: `biome.json`'s
`noRestrictedImports` overrides block a lower layer importing from a higher one; the
sideways case (one feature reaching into another's internals) remains convention,
verified by manual review.

Rationale: A component-oriented UI codebase doesn't fit a `usecase`/`adapter` split, but
an isolated, dependency-free `shared/domain/` still buys the same testability and
portability the backend gets from its own domain layer, and an explicit layer direction
gives every other cross-cutting concern (design-system primitives, theme, API access) an
unambiguous, enforceable home.

### III. Design-System Discipline (shadcn/ui + Radix)

shadcn/ui's vendored-component model over Radix UI (`@radix-ui/react-dialog`,
`@radix-ui/react-tabs`) is the design system, replacing Astryx per ADR-0018. New UI MUST
compose existing primitives before inventing custom CSS, hand-rolled animations, or
one-off color tokens, split into two disciplines that legitimately coexist:

- **Vendored** (`shared/ui/primitives/`: `Button`, `Card`, `Badge`, `Alert`, `Skeleton`,
  `Dialog`, `Tabs`) — shadcn CLI output, kept flat with no per-component test and
  excluded from the coverage floor (`vitest.config.ts`), so re-running `shadcn add` to
  pick up an upstream fix never fights this repo's own conventions. This is a permanent,
  intentional exception, not a gap to close.
- **Owned** (`shared/ui/text/`, `shared/ui/code-preview/`, and anything that wraps or
  composes a vendored primitive) — components with no shadcn/ui equivalent, or
  compositions of vendored primitives. Folder-per-component with a colocated test and a
  barrel, tested like everything else in this codebase, per Principle IV.

Non-semantic color variants (`orange`/`teal`/`pink`, mapped in
`entities/strategy/strategy-meta.ts` to the `--color-icon-{variant}` tokens in
`app/globals.css`) work the same way they did before the migration. `ThemeModeProvider`
is the single owner of `data-theme` and `color-scheme` on `<html>` — no second dark-mode
provider (e.g. `next-themes`) may be added. Every design token (color, type scale,
radius, shadow) is owned directly in `app/globals.css`'s `@theme inline` block, under the
same utility names regardless of where the underlying value comes from. The Tailwind v4
`@layer` order in that file (`reset, theme, base, components, utilities`) is load-bearing
and MUST NOT be reordered without understanding why each layer is where it is.

Rationale: A senior-signaling portfolio piece needs a coherent, recognisable design
system, not per-component inline styling reinvented every time, and not a pre-1.0
dependency this repo doesn't control (see ADR-0018's Context for the concrete problems
that caused). shadcn/ui's vendor-then-own model gives the same primitive coverage
without that dependency risk, at the cost of owning the vendored source directly — the
flat/excluded split above is what keeps that cost from fighting this repo's own test
discipline.

### IV. Test Rigor

Vitest + React Testing Library for unit/component tests, Playwright + axe-core for
end-to-end and accessibility checks. Non-trivial, non-obvious logic — the SSE frame parser,
the stream reducer, Zod validation schemas — MUST have unit tests; UI composition that is
purely presentational does not require a dedicated test if it has no branching logic of its
own. `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` MUST all pass before a PR
is opened.

`pnpm test:coverage` MUST report at least 90% statements/branches/functions/lines (CI's
`test` job runs this, not plain `pnpm test`; the threshold is configured in
`vitest.config.ts` and fails the run below it). The include/exclude list in that config is
part of this principle, not an escape hatch from it: generated code, pure type
declarations, and files with genuinely zero branching logic of their own may be excluded,
matching the "purely presentational" exemption above — everything else, including thin
hooks and provider components that look like "just wiring," stays in scope and must meet
the floor.

Rationale: TypeScript's structural typing and shadcn/ui's vendored primitives remove
whole classes of bugs a Go-style layer-boundary test suite would need to guard against;
test effort should concentrate on the logic this repo actually owns (parsing, reducing,
validating), not on re-testing the design system or the framework.

### V. Shipped-Artifact Discipline

All shipped artifacts — code, comments, commit messages, PR titles and bodies, READMEs,
ADRs, and issues — MUST be in English. Commits MUST follow Conventional Commits, enforced
by commitlint + lefthook. No emojis in commits, PR titles, or code. No `console.log` in
shipped code. Secrets only via environment variables (`NEXT_PUBLIC_*` only for values safe
to ship to the browser — never a real secret). Every non-trivial architectural decision
made while coding MUST be recorded as an ADR in `../docs/decisions/`.

Rationale: This is a portfolio piece for international reviewers; consistency and hygiene
are themselves signals of engineering care, and this mirrors the backend's own Principle VI
so both repos read as one coherent product.

## Additional Constraints (Stack & Cost)

- Language and core stack are fixed: Next.js (App Router, TypeScript strict), Tailwind CSS
  v4, shadcn/ui-style vendored primitives over Radix UI, motion, react-hook-form + Zod,
  openapi-fetch + openapi-typescript, TanStack Query v5, Vitest + RTL, Playwright + axe-core,
  Biome (replaces ESLint + Prettier), pnpm, lefthook + commitlint.
- `POST /v1/generate` returns `text/event-stream` but requires a JSON body, so browser
  `EventSource` cannot call it. SSE consumption MUST use a hand-rolled `fetch()` +
  `ReadableStream` frame parser (`shared/api/generate.ts`) — no SSE client library, since the
  backend has no chunk-replay/resume capability a library's retry features could use.
- Ongoing infrastructure cost target is $0/month, matching the umbrella product target — no
  paid hosting/CDN/analytics may be introduced without an explicit decision recorded as an
  ADR.

## Development Workflow & Quality Gates

- Spec-driven workflow: `/speckit-constitution` → `/speckit-specify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`. Structure precedes code.
- Branch-per-task (NON-NEGOTIABLE): `main` is protected and MUST NOT receive direct
  commits. A dedicated branch is created BEFORE any development on a task begins, from an
  up-to-date `main`. Branch naming:
  - Spec-driven feature: `NNN-slug` created by `/speckit-specify` (e.g.
    `001-implement-studio-design`). Do not rename it — the matching `specs/NNN-slug/`
    directory must stay aligned.
  - Standalone change (tooling, CI, deps, docs, hotfix without a full spec): `<type>/<slug>`
    where `<type>` is a Conventional Commit type (feat, fix, chore, refactor, docs, ci,
    build, perf, test) and `<slug>` is kebab-case.
  - One branch = one logical unit of work. Keep branches short-lived.
- Every change reaches `main` only through a Pull Request. Problems discovered mid-task
  (a bug, a missing capability, a deferred decision) MUST be filed as a GitHub issue rather
  than silently worked around or left undocumented.
- Before pushing the branch or opening a PR, run the `pr-reviewer` agent
  (`.claude/agents/pr-reviewer.md`) against the local diff (`git diff main...HEAD`) and
  fix blocking findings — the PR should already be clean when it opens, not fixed up
  after with a follow-up commit.
- A PR that changes the contract MUST update the root `openapi.yaml` first, then
  `pnpm sync-openapi`, in the same change.

## Governance

This constitution supersedes ad-hoc practices for this repository. Amendments MUST be made
by editing this file with a Sync Impact Report and a semantic version bump: MAJOR for
backward-incompatible principle removals or redefinitions, MINOR for added or materially
expanded principles/sections, PATCH for clarifications. Dependent templates
(`plan-template.md`, `spec-template.md`, `tasks-template.md`) MUST be reviewed for
alignment on every amendment. All PRs and reviews MUST verify compliance with these
principles; added complexity MUST be justified against them. Runtime development guidance
lives in this repo's own `CLAUDE.md` and the umbrella `../.claude/CLAUDE.md`.

**Version**: 2.0.0 | **Ratified**: 2026-07-16 | **Last Amended**: 2026-07-27
