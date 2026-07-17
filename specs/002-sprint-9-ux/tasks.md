# Tasks: Sprint 9 UX polish — motion, accessibility, e2e coverage

**Input**: Design documents from `/specs/002-sprint-9-ux/`

**Prerequisites**: plan.md, spec.md

## Phase 1: Setup

- [x] T001 `playwright.config.ts` — chromium project, `webServer` auto-starting `pnpm dev`
- [x] T002 `package.json` — add `test:e2e` script
- [x] T003 `.gitignore` — add `/test-results`, `/playwright-report`, `/blob-report`,
      `/playwright/.cache` (Playwright artifacts, previously untracked/unignored)

## Phase 2: User Story 1 - Motion transitions respecting reduced-motion (P2)

- [x] T004 `app/layout.tsx` — wrap the app in `<MotionConfig reducedMotion="user">`
- [x] T005 [P] `features/generate-stream/variation-grid.tsx` — staggered fade/slide-in
      per card
- [x] T006 [P] `features/generate-stream/variation-card.tsx` — fade-in for the completed
      tier list
- [x] T007 [P] `app/studio/page.tsx` — fade/slide-in for the audience summary bar

## Phase 3: User Story 2 - E2e + accessibility suite (P1)

- [x] T008 `test/e2e/mock-backend.ts` — route-interception helpers for
      `/v1/analyze`/`/v1/generate`/`/v1/export/{id}`
- [x] T009 [P] `test/e2e/landing.spec.ts` — render + axe-core, theme toggle
- [x] T010 [P] `test/e2e/studio.spec.ts` — empty state + axe-core, invalid-URL blocking
      (no network call), mocked happy-path stream to completion, mocked backend failure,
      export dialog tab behavior + reset-on-new-variation
- [x] T011 Fix the real color-contrast violations T009/T010 found (not test workarounds):
  - `components/ui/app-header.tsx` inactive nav link (`text-secondary` on `bg-muted`,
    4.19:1 — needed 4.5:1)
  - `app/page.tsx` preview-card price hint and mock URL bar (`text-disabled` /
    `text-secondary` on `bg-muted`, as low as 2.23:1)
  - `features/generate-stream/variation-grid.tsx` and `variation-card.tsx` (`text-disabled`
    used for real informational text, not an actually-disabled control)
- [x] T012 Fix `test/e2e/studio.spec.ts`'s own bug: Astryx's `Tab` renders as a plain
      `<button>` with `aria-current`, not the ARIA tabs pattern — `getByRole("tab", ...)`
      never matched; corrected to `getByRole("button", ...)`

## Phase 4: Polish

- [x] T013 `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all clean
- [x] T014 `pnpm test:e2e` — all 7 tests passing

## Notes

All tasks completed and verified in-session (`pnpm exec playwright test` run to green
after fixing T011/T012). Lighthouse scoring and Astryx's `theme-neutral/built` runtime-
style-injection optimization are explicitly out of scope per `spec.md`'s Assumptions.
