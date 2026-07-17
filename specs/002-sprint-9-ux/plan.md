# Implementation Plan: Sprint 9 UX polish — motion, accessibility, e2e coverage

**Branch**: `002-sprint-9-ux` | **Date**: 2026-07-16 | **Spec**: `./spec.md`

**Input**: Feature specification from `/specs/002-sprint-9-ux/spec.md`

## Summary

Adds the Sprint 9 polish items HANDOFF.md scoped after the Studio/landing feature:
motion transitions (via the already-installed `motion` package, unused until now),
a Playwright + axe-core e2e suite backfilling coverage for the Studio flow built in
`specs/001-implement-claude-generated/`, and fixes for the real color-contrast bugs that
suite immediately found.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16, React 19

**Primary Dependencies**: `motion` (framer-motion's successor package, already a
dependency, unused before this feature), `@playwright/test` + `@axe-core/playwright`
(already devDependencies, no `playwright.config.ts` existed yet)

**Testing**: Playwright (new `test/e2e/`), existing Vitest suite unaffected

**Target Platform**: Browser

**Project Type**: Same single Next.js project as `specs/001-implement-claude-generated/`

**Constraints**: Animations must respect `prefers-reduced-motion` (accessibility
requirement, not just nice-to-have — `MotionConfig reducedMotion="user"` handles this
globally rather than per-component). E2e tests must not require a live backend (route
interception per this repo's existing `NEXT_PUBLIC_API_URL` default).

## Constitution Check

- **III. Design-System Discipline (Astryx)**: PASS. Motion transitions are additive to
  existing Astryx components, not a replacement for them.
- **IV. Test Rigor**: PASS — this feature exists specifically to close a Test Rigor gap
  (no e2e coverage existed for the Studio flow built in the prior feature).
- **V. Shipped-Artifact Discipline**: PASS.

No violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-sprint-9-ux/
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
playwright.config.ts             # new — didn't exist before
test/e2e/
├── mock-backend.ts               # route-interception helpers for analyze/generate/export
├── landing.spec.ts               # render + axe
└── studio.spec.ts                # empty state + axe, invalid URL, happy path, error, export dialog

app/layout.tsx                    # + MotionConfig reducedMotion="user"
app/page.tsx                      # contrast fixes (text-disabled -> text-secondary/-primary)
components/ui/app-header.tsx      # nav contrast fix (text-secondary on bg-muted failed WCAG AA)
features/generate-stream/
├── variation-grid.tsx            # + staggered entrance motion; contrast fix
├── variation-card.tsx            # + tier-list entrance motion; contrast fix
```

**Structure Decision**: No new top-level directories. `test/e2e/` was an empty directory
already present in the repo's structure (per this repo's `CLAUDE.md`); this feature is
the first to populate it.

## Complexity Tracking

Not applicable — no violations.
