# Implementation Plan: Replace Astryx with shadcn/ui and restructure components

**Branch**: `003-shadcn-ui-migration` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-shadcn-ui-migration/spec.md`

## Summary

Replace Astryx (`@astryxdesign/*` 0.1.x) with shadcn/ui vendored primitives over Radix and
Tailwind v4, restructure components into folder-per-component with colocated tests and barrels,
and delete every artifact the swap makes dead.

The approach is **six sequential pull requests**, each independently green and reviewable. The
ordering is driven by one finding from Phase 0: the design-token layer is a larger and more
load-bearing surface than the component imports, so it gets its own increment between the
component swaps and the purge. Astryx stays installed and functional until increment 6, which
means every intermediate state is shippable.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2.4, Node via pnpm

**Framework**: Next.js 16.2.11 (App Router, Turbopack dev)

**Primary Dependencies (current)**: `@astryxdesign/core` 0.1.6, `@astryxdesign/theme-neutral`
0.1.6, `@astryxdesign/cli` 0.1.6 (all being removed), Tailwind CSS v4 via
`@tailwindcss/postcss`, `motion` 12, `react-hook-form` 7 + `zod` 4, `openapi-fetch` +
`openapi-typescript`, `@tanstack/react-query` 5, `@sentry/nextjs` 10, `lucide-react` 1

**Primary Dependencies (added)**: shadcn CLI 4.15.0 (dev-time vendoring, not a runtime
dependency), `@radix-ui/react-dialog` 1.1.23, `@radix-ui/react-tabs` 1.1.21,
`prism-react-renderer` 2.4.1, plus `class-variance-authority`, `clsx`, and `tailwind-merge`
which shadcn primitives require

**Storage**: N/A. `localStorage` for the color-scheme preference only (key
`pricing-optimizer-theme-mode`, must stay compatible)

**Testing**: Vitest 3 + React Testing Library (jsdom), Playwright + axe-core for e2e and
accessibility, 90% coverage floor enforced in `vitest.config.ts`

**Target Platform**: Modern evergreen browsers, deployed on Vercel

**Project Type**: Web frontend, single package, FSD-lite layers
(`app -> views -> features -> entities -> shared`)

**Performance Goals**: No regression against current production Lighthouse scores (99 landing,
Studio at or above the 95 target)

**Constraints**: Zero axe violations; 4.5:1 contrast for all informational text; no
pre-hydration flash of the wrong color scheme; a single owner of `data-theme`; visual parity
with `docs/design/Pricing Optimizer.html`; $0/month infrastructure

**Scale/Scope**: 64 source files. Migration surface: 16 Astryx imports across 14 files, 63
token-utility occurrences across 19 files, 9 shared UI components (5 untested), 84 raw HTML
elements, 26 test files

## Constitution Check

*GATE: evaluated against `.specify/memory/constitution.md` v1.2.0.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Contract-First (OpenAPI) | **PASS** | No contract change. `openapi.yaml` and `shared/api/schema.ts` untouched. |
| II. Feature-Based Architecture with Isolated Domain Layer | **PASS** (text stale) | `shared/domain/` purity is preserved and asserted. The principle's *text* still names `domain/`, `features/`, `components/ui/`, `lib/api/`, which ADR-0016 superseded. Pre-existing drift, corrected in increment 6. |
| III. Design-System Discipline (Astryx) | **FAIL, sanctioned** | This feature removes the library the principle mandates. See Complexity Tracking. |
| IV. Test Rigor | **PASS, strengthened** | Coverage floor holds; increment 1 *raises* real coverage by backfilling 5 untested components. |
| V. Shipped-Artifact Discipline | **PASS** | English throughout, Conventional Commits, no emojis, ADR required by increment 6. |
| Additional Constraints (Stack & Cost) | **FAIL, sanctioned** | The fixed-stack list names Astryx. Same amendment. No paid infrastructure added; all new dependencies are free and self-hosted in-repo. |
| Workflow: branch-per-task | **PASS** | Branch `003-shadcn-ui-migration` created from an up-to-date `main` before any work. |
| Workflow: `pr-reviewer` before push | **PASS, with a caveat** | Required on every increment. The agent reviews against v1.2.0 and *will* flag Principle III on increments 2 to 6; each PR body must link this spec so the finding is dismissed rather than reverted. |

**Gate result: PROCEED.** The two failures are the deliberate subject of the feature, justified
below and resolved by the increment-6 amendment.

## Project Structure

### Documentation (this feature)

```text
specs/003-shadcn-ui-migration/
├── spec.md                  # Feature specification
├── plan.md                  # This file
├── research.md              # Phase 0 findings and decisions
├── data-model.md            # Migration inventory: component and token mappings
├── quickstart.md            # Per-increment validation guide
├── checklists/
│   └── requirements.md      # Spec quality checklist
└── tasks.md                 # Phase 2 output (/speckit-tasks, NOT created here)
```

No `contracts/` directory: this feature exposes no external interface and changes no wire
format. The nearest analogue, the component and token contract between layers, lives in
`data-model.md`.

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css                      # REWRITTEN (increment 5): layer order, token source
│   └── layout.tsx                       # theme init script wiring stays
├── views/
│   ├── landing/components/              # -> folder-per-component
│   └── studio/components/               # -> folder-per-component
├── features/
│   ├── export/                          # increments 3 and 4 (Dialog, Tabs, code preview)
│   ├── generate-stream/                 # increment 2
│   ├── history/                         # increment 2
│   └── url-input/                       # increment 2
├── entities/strategy/                   # Astryx color variants -> owned tokens (increment 5)
└── shared/
    ├── ui/
    │   ├── primitives/                  # NEW: vendored shadcn, flat, coverage-excluded
    │   │   ├── button.tsx  card.tsx  badge.tsx  skeleton.tsx
    │   │   ├── alert.tsx   dialog.tsx tabs.tsx
    │   ├── text/                        # NEW owned: typography scale (no shadcn equivalent)
    │   ├── code-preview/                # NEW owned: prism-react-renderer wrapper
    │   ├── app-header/                  # RESTRUCTURED from flat file
    │   ├── card-action-button/          # RESTRUCTURED
    │   ├── color-accent-column/         # RESTRUCTURED + test backfill
    │   ├── color-dot/                   # RESTRUCTURED + test backfill
    │   ├── eyebrow/                     # RESTRUCTURED + test backfill
    │   ├── panel-header/                # RESTRUCTURED + test backfill
    │   ├── price-display/               # RESTRUCTURED + test backfill
    │   └── index.ts                     # NEW barrel (none exists today)
    ├── theme/
    │   ├── components/theme-mode-provider/   # REWRITTEN (increment 5): owns data-theme
    │   ├── components/theme-toggle/          # RESTRUCTURED
    │   ├── theme-init-script.ts              # extended to own color-scheme
    │   ├── pricing-optimizer-theme.ts         # DELETED (increment 6)
    │   ├── generated/                         # DELETED (increment 6)
    │   └── index.ts
    ├── domain/                          # UNCHANGED, purity re-asserted
    ├── api/                             # UNCHANGED
    └── providers/

test/
├── setup.ts                             # polyfills deleted in increments 3 and 6
└── render.tsx                            # REWRITTEN (increment 5): drop Astryx <Theme>
```

**Structure Decision**: keep the existing FSD-lite layout unchanged. This migration adds exactly
one new structural concept, `shared/ui/primitives/` for vendored shadcn source, and converts
flat component files into folders. Vendored primitives sit inside `shared/ui/` rather than a
top-level directory so the existing per-layer `noRestrictedImports` rules keep applying without
a new override.

## Increment sequencing

Each row is one branch and one pull request, each independently green.

| # | Story | Scope | Astryx state after |
| --- | --- | --- | --- |
| 1 | US1 | Folder-per-component restructure, `shared/ui` barrel, backfill 5 missing tests | Fully installed, untouched |
| 2 | US2 | Vendor shadcn primitives; swap `Button`, `Text`, `Badge`, `Banner`, `Card`, `Skeleton`, `Layout`, `LayoutContent` | Installed; only `Theme`, `Dialog`, `Tabs`, `CodeBlock` remain |
| 3 | US3 | Swap `Dialog`, `DialogHeader`, `Tab`, `TabList` for Radix; delete `HTMLDialogElement` polyfill | Installed; only `Theme`, `CodeBlock` remain |
| 4 | US4 | Replace `CodeBlock` with the owned `code-preview` over `prism-react-renderer` | Installed; only `Theme` remains |
| 5 | US5a | **Token and theme handover**: own the tokens via `@theme inline`, own `color-scheme` and the heading reset, rewrite the provider to own `data-theme`, rewrite `test/render.tsx` | Installed but no longer referenced by any source file |
| 6 | US5b | Purge: delete generated artifacts, theme source, `build:theme`, three packages, `matchMedia` polyfill, orphaned CSS; write ADR; amend constitution to 2.0.0 | Gone |

Increment 5 is the highest-risk step and is deliberately isolated: it is the only one that
changes where design tokens come from. Increment 6 deletes only what increment 5 already proved
unreferenced, so a bisect between the two cleanly separates "tokens broke" from "deletion broke
something".

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Principle III (Astryx mandated) is contradicted for increments 2 to 6 | The feature's entire purpose is replacing that library, for the five documented reasons in the spec (recurring contrast failures, jsdom polyfills, an unverifiable theme build, a bundler quirk, pre-1.0 risk) | Amending the constitution first was considered and explicitly rejected by the maintainer: the amended Principle III should describe the design-system discipline that actually exists once shadcn is in place, rather than being written speculatively and corrected afterwards |
| Additional Constraints names Astryx in the fixed stack | Same | Same |
| Two coexisting component conventions (`primitives/` flat and excluded; everything else foldered and tested) | Re-running the shadcn CLI for an upstream fix must not fight the repo's structure, and hand-writing tests for third-party primitives would need redoing on every update | A single uniform convention was considered (spec Clarification 2, option B) and rejected as ongoing cost for no correctness gain. Matches the existing `vitest.config.ts` rationale that excludes generated code and pure types |
| Three new runtime dependencies (`clsx`, `tailwind-merge`, `class-variance-authority`) plus `prism-react-renderer` | Required by shadcn primitives; the highlighter replaces `CodeBlock` | Net dependency count still falls: three `@astryxdesign` packages leave, and the removed `intl-messageformat` transitive dependency goes with them. Hand-rolling class merging was rejected as reinventing a solved 1KB problem |

## Phase 0: Research

Complete. See [research.md](./research.md). Five questions were open; all are resolved, with two
findings that changed this plan:

1. **shadcn/ui fully supports Tailwind v4 and React 19**, including `@theme inline`, which is
   the exact bridge mechanism this repo already uses for Astryx. The migration reuses the
   pattern rather than inventing one.
2. **The token layer is the real bulk of the work** (63 utility occurrences across 19 files,
   plus `color-scheme`, the `@scope` attribute, and a heading reset), which is why increment 5
   exists as its own step.

## Phase 1: Design

Complete. Generated:

- **[data-model.md](./data-model.md)** — the migration inventory: every Astryx import mapped to
  its replacement with owner and risk, every token utility mapped to its owned equivalent, the
  component restructure map, and the deletion manifest with its verification command.
- **[quickstart.md](./quickstart.md)** — per-increment validation: exact commands and expected
  outcomes for each of the six pull requests, plus the parity and accessibility procedures.

`contracts/` intentionally omitted: no external interface changes.

### Post-design Constitution re-check

Unchanged from the pre-Phase-0 gate. The design introduces no new violation: the two sanctioned
failures are the feature's premise, the new `primitives/` convention is justified above and
bounded by a documented rule, and every other principle is preserved or strengthened. Domain
purity, layer direction, the coverage floor, and contract-first are all untouched by the chosen
approach.

**Ready for `/speckit-tasks`.**
