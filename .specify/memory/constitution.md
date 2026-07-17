<!--
Sync Impact Report
- Version change: 1.1.0 → 1.2.0
- Rationale: Principle IV (Test Rigor) gained a mandatory 90% coverage floor
  (statements/branches/functions/lines), enforced by `pnpm test:coverage` in CI. MINOR
  bump — a materially expanded quality gate, not a clarification of existing text, and
  no principle was removed or redefined. See `CLAUDE.md`'s Testing section for the
  include/exclude rationale (generated code, pure types, and genuinely presentational
  composition stay excluded per this same principle's existing exemption).
- Principles: unchanged in count/names (I. Contract-First, II. Feature-Based Architecture
  with an Isolated Domain Layer, III. Design-System Discipline, IV. Test Rigor, V.
  Shipped-Artifact Discipline); IV's text expanded
- Modified sections: IV. Test Rigor (added the coverage gate)
- Added sections: none
- Removed sections: none
- Templates requiring updates:
    ✅ .specify/templates/plan-template.md (Constitution Check gate aligns; no edit needed)
    ✅ .specify/templates/spec-template.md (no mandatory-section conflict; no edit needed)
    ✅ .specify/templates/tasks-template.md (testing task types already covered)
- Follow-up TODOs: none
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
`lib/api/schema.ts`). This repo's copy MUST NOT be hand-edited, and `lib/api/schema.ts`
MUST NOT be hand-edited — both are generated. No new call to the backend ships without the
spec covering it first.

Rationale: A generated, spec-driven contract eliminates drift between the Go backend and
this frontend, and makes the wire shape reviewable independently of UI implementation.

### II. Feature-Based Architecture with an Isolated Domain Layer

The codebase is organized as `domain/` (pure business types and logic — zero imports from
react, next, zod, @tanstack/*, or the generated wire schema; the one layer that would port
to a different framework unchanged), `features/` (colocated, feature-scoped components +
hooks + logic; a feature imports `domain/` and `lib/api/` freely but MUST NOT import
another feature directly — shared concerns move to `domain/`, `lib/`, or
`components/ui/`), `components/ui/` (shared Astryx composition wrappers, no business
logic), `lib/api/` (the only layer allowed to know the backend's raw wire format), and
`app/` (Next.js App Router — routes and thin composition only).

This is deliberately NOT a layer-for-layer mirror of the backend's Clean Architecture
(`domain`/`usecase`/`adapter`) — that mirroring was tried and explicitly rejected
mid-implementation as "too far from how frontend code actually gets organized." Only the
"pure, framework-agnostic, imports nothing" property of `domain/` carries over.

Rationale: A component-oriented UI codebase doesn't fit a `usecase`/`adapter` split, but an
isolated, dependency-free `domain/` still buys the same testability and portability the
backend gets from its own domain layer.

### III. Design-System Discipline (Astryx)

Astryx (`@astryxdesign/core` + `@astryxdesign/theme-neutral`) is the component library.
New UI MUST compose existing Astryx components (`Button`, `Card`, `Badge`, `Dialog`,
`TabList`, `CodeBlock`, `Skeleton`, `EmptyState`, `Banner`, `TextInput`, etc.) and Astryx's
non-semantic color variants (`orange`/`teal`/`pink`/etc.) before inventing custom CSS,
hand-rolled animations, or one-off color tokens. Astryx owns `data-theme` on `<html>` via
its `<Theme>` component — no second dark-mode provider (e.g. `next-themes`) may be added.
The Tailwind v4 / Astryx `@layer` order in `app/globals.css`
(`reset, theme, base, astryx-base, astryx-theme, components, utilities`) is load-bearing
and MUST NOT be reordered without understanding why each layer is where it is.

Rationale: A senior-signaling portfolio piece needs a coherent design system, not
per-component inline styling reinvented every time; Astryx already ships the primitives
this product needs (see e.g. `CodeBlock` for the export-preview syntax highlighting, rather
than hand-rolling a regex tokenizer).

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

Rationale: TypeScript's structural typing and Astryx's pre-built components remove whole
classes of bugs a Go-style layer-boundary test suite would need to guard against; test
effort should concentrate on the logic this repo actually owns (parsing, reducing,
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
  v4, Astryx, motion, react-hook-form + Zod, openapi-fetch + openapi-typescript, TanStack
  Query v5, Vitest + RTL, Playwright + axe-core, Biome (replaces ESLint + Prettier), pnpm,
  lefthook + commitlint.
- `POST /v1/generate` returns `text/event-stream` but requires a JSON body, so browser
  `EventSource` cannot call it. SSE consumption MUST use a hand-rolled `fetch()` +
  `ReadableStream` frame parser (`lib/api/generate.ts`) — no SSE client library, since the
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

**Version**: 1.2.0 | **Ratified**: 2026-07-16 | **Last Amended**: 2026-07-17
