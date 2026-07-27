---

description: "Task list for the Astryx to shadcn/ui migration"

---

# Tasks: Replace Astryx with shadcn/ui and restructure components

**Input**: Design documents from `specs/003-shadcn-ui-migration/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [quickstart.md](./quickstart.md) — all complete, no open
clarifications.

**Tests**: This repo's constitution mandates a 90% coverage floor (Principle IV) and non-trivial
logic must have unit tests. Test tasks below are **not optional**.

**Organization**: Six phases, one per increment from `plan.md`. Each phase is its own branch and
pull request, each independently green (`typecheck`, `lint`, `test:coverage`, `build`,
`test:e2e`, then `pr-reviewer`). Do not start phase *N+1* until phase *N*'s PR is merged to
`main` — every phase after the first assumes the previous one's file layout already exists.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task in this phase)
- **[Story]**: US1-US6, matching the six increments (spec.md's Story 5 is split into US5 and US6
  per `plan.md`'s sequencing table, since the token handover and the purge are separate PRs)
- Every task names an exact file path

## Path Conventions

Single Next.js project. All paths are relative to `pricing-optimizer-web/` (this repo's root),
following the existing `app -> views -> features -> entities -> shared` layers under `src/`.

<!--
  This project has six increments defined in plan.md, not an open-ended set of user stories.
  A conventional "Foundational" phase (Phase 2) is folded into US1: this is a refactor of an
  existing app, and US1's restructure/backfill work is what the later increments depend on.
-->

---

## Phase 1: Setup

**Purpose**: Confirm the branch and prepare the one piece of structure every later increment
needs — a place for vendored primitives to live — without pulling in any component library yet.

- [ ] T001 Confirm current branch is `003-shadcn-ui-migration`, branched from an up-to-date
  `main` (`git fetch origin && git log main..origin/main --oneline` must be empty)
- [ ] T002 Create empty directory `src/shared/ui/primitives/` with a `.gitkeep`, to establish the
  vendored-and-excluded location decided in spec Clarification 2 before any primitive is added

**Checkpoint**: Nothing behavioral changes yet. `pnpm build` still succeeds unmodified.

---

## Phase 2: User Story 1 - Components get tested and consistently structured (Priority: P1) 🎯 MVP

**Goal**: Every component lives in a folder named after it, with a colocated test and an
`index.ts` barrel. The five untested `shared/ui` components gain real tests. Astryx is completely
untouched.

**Independent Test**: Run the full gate with the design system still installed and in use;
confirm no rendered output changed and coverage rose.

### Restructure: `shared/ui/` (9 components + new barrel)

- [ ] T003 [P] [US1] Convert `src/shared/ui/app-header.tsx` (+ its existing test) to
  `src/shared/ui/app-header/app-header.tsx`, `app-header.test.tsx`, `index.ts`
- [ ] T004 [P] [US1] Convert `src/shared/ui/card-action-button.tsx` (+ its existing test) to
  `src/shared/ui/card-action-button/card-action-button.tsx`, `card-action-button.test.tsx`,
  `index.ts`
- [ ] T005 [P] [US1] Convert `src/shared/ui/color-accent-column.tsx` to
  `src/shared/ui/color-accent-column/color-accent-column.tsx` + `index.ts`, and write
  `color-accent-column.test.tsx` covering its real branching (currently has **no test**)
- [ ] T006 [P] [US1] Convert `src/shared/ui/color-dot.tsx` to
  `src/shared/ui/color-dot/color-dot.tsx` + `index.ts`, and write `color-dot.test.tsx` (currently
  has **no test**)
- [ ] T007 [P] [US1] Convert `src/shared/ui/eyebrow.tsx` to `src/shared/ui/eyebrow/eyebrow.tsx` +
  `index.ts`, and write `eyebrow.test.tsx` (currently has **no test**)
- [ ] T008 [P] [US1] Convert `src/shared/ui/panel-header.tsx` to
  `src/shared/ui/panel-header/panel-header.tsx` + `index.ts`, and write `panel-header.test.tsx`
  (currently has **no test**)
- [ ] T009 [P] [US1] Convert `src/shared/ui/price-display.tsx` to
  `src/shared/ui/price-display/price-display.tsx` + `index.ts`, and write
  `price-display.test.tsx` (currently has **no test**)
- [ ] T010 [US1] Create `src/shared/ui/index.ts` as the layer's public barrel, exporting every
  component from T003-T009 (this barrel does not exist today; depends on T003-T009)
- [ ] T011 [US1] Update every import of the nine components above across `src/` (grep
  `from "@/shared/ui/` for each old flat path) to import from the new folder paths or the new
  barrel, matching the barrel-at-cross-layer-boundary convention already used elsewhere
  (`git grep -l 'shared/ui/(app-header|card-action-button|color-accent-column|color-dot|eyebrow|panel-header|price-display)"' src/`)

### Restructure: feature and view components (apply the same shape)

- [ ] T012 [P] [US1] Convert `src/features/export/components/export-dialog.tsx` (+ test) to
  `src/features/export/components/export-dialog/` with `export-dialog.tsx`,
  `export-dialog.test.tsx`, `index.ts`; update `src/features/export/index.ts`'s re-export path
- [ ] T013 [P] [US1] Convert `src/features/generate-stream/components/variation-card.tsx` (+
  test) to `src/features/generate-stream/components/variation-card/` folder shape
- [ ] T014 [P] [US1] Convert `src/features/generate-stream/components/pricing-tier-row.tsx` (+
  test) to `src/features/generate-stream/components/pricing-tier-row/` folder shape
- [ ] T015 [P] [US1] Convert `src/features/generate-stream/components/variation-grid.tsx` (+
  test) to `src/features/generate-stream/components/variation-grid/` folder shape; update
  `src/features/generate-stream/index.ts`'s re-export path
- [ ] T016 [P] [US1] Convert `src/features/history/components/history-panel.tsx` (+ test) to
  `src/features/history/components/history-panel/` folder shape
- [ ] T017 [P] [US1] Convert `src/features/url-input/components/url-input-form.tsx` (+ test) to
  `src/features/url-input/components/url-input-form/` folder shape
- [ ] T018 [P] [US1] Convert `src/shared/theme/components/theme-mode-provider.tsx` (+ test) to
  `src/shared/theme/components/theme-mode-provider/` folder shape; update
  `src/shared/theme/index.ts`
- [ ] T019 [P] [US1] Convert `src/shared/theme/components/theme-toggle.tsx` (+ test) to
  `src/shared/theme/components/theme-toggle/` folder shape
- [ ] T020 [P] [US1] Convert `src/views/landing/components/hero.tsx` (+ test, if any) to
  `src/views/landing/components/hero/` folder shape
- [ ] T021 [P] [US1] Convert `src/views/landing/components/product-preview.tsx` (+ test, if any)
  to `src/views/landing/components/product-preview/` folder shape
- [ ] T022 [P] [US1] Convert `src/views/studio/components/audience-summary-bar.tsx` (+ test, if
  any) to `src/views/studio/components/audience-summary-bar/` folder shape
- [ ] T023 [US1] Update every remaining cross-file import broken by T012-T022 (`pnpm typecheck`
  is the source of truth for what is left; depends on T012-T022)

### Validation

- [ ] T024 [US1] Run the full gate (`pnpm typecheck && pnpm lint && pnpm test:coverage && pnpm
  build && pnpm test:e2e`); confirm coverage rose from backfilling T005-T009 and no rendered
  output changed
- [ ] T025 [US1] Run `pr-reviewer` against `git diff main...HEAD`; fix findings; open the PR
  linking issue #33 and this spec

**Checkpoint**: Every component has a folder, a test, and a barrel. Astryx is still fully
installed and unmodified. Merge before starting Phase 3.

---

## Phase 3: User Story 2 - Presentational primitives no longer come from Astryx (Priority: P1)

**Goal**: `Button`, `Text`, `Badge`, `Banner`, `Card`, `Skeleton`, `Layout`/`LayoutContent` no
longer come from Astryx. Visual output is unchanged in both color schemes.

**Independent Test**: Swap these primitives with the theme provider untouched; compare computed
styles against the mock; suite and accessibility checks stay green.

### Setup for this increment

- [ ] T026 [US2] Add dependencies: `pnpm add class-variance-authority clsx tailwind-merge` and
  `pnpm add -D shadcn` (CLI, dev-only — components are vendored source, not a runtime package)
- [ ] T027 [US2] Create `src/shared/ui/lib/cn.ts` (the `clsx` + `tailwind-merge` class-merge
  helper every shadcn primitive expects), with a colocated `cn.test.ts`

### Vendor shadcn primitives (flat, coverage-excluded per Clarification 2)

- [ ] T028 [P] [US2] Vendor `Button` into `src/shared/ui/primitives/button.tsx` via `shadcn add
  button` (or hand-placed equivalent), add its exclude-list entry in `vitest.config.ts`
- [ ] T029 [P] [US2] Vendor `Card` into `src/shared/ui/primitives/card.tsx`, same exclude-list
  entry
- [ ] T030 [P] [US2] Vendor `Badge` into `src/shared/ui/primitives/badge.tsx`, same exclude-list
  entry
- [ ] T031 [P] [US2] Vendor `Alert` (replacing `Banner`) into
  `src/shared/ui/primitives/alert.tsx`, same exclude-list entry
- [ ] T032 [P] [US2] Vendor `Skeleton` into `src/shared/ui/primitives/skeleton.tsx`, same
  exclude-list entry
- [ ] T033 [US2] Add `src/shared/ui/primitives/index.ts` re-exporting T028-T032 (depends on
  T028-T032)

### Owned replacement: typography

- [ ] T034 [US2] Create `src/shared/ui/text/text.tsx`: a `Text` component preserving every
  variant in use per `data-model.md` section 1 (`type`: `display-3`, `body`, `label`,
  `supporting`; `color`: `secondary`; `className` passthrough), plus `text.test.tsx` covering
  each variant and `index.ts`

### Swap call sites (grouped by the exact files verified in data-model.md)

- [ ] T035 [P] [US2] Replace `Button` in
  `src/features/generate-stream/components/pricing-tier-row/pricing-tier-row.tsx` with the
  vendored primitive from T028
- [ ] T036 [P] [US2] Replace `Button` in
  `src/features/history/components/history-panel/history-panel.tsx`, and `Text` in the same file
  with T034
- [ ] T037 [P] [US2] Replace `Button` in
  `src/features/url-input/components/url-input-form/url-input-form.tsx`
- [ ] T038 [P] [US2] Replace `Button` in
  `src/shared/theme/components/theme-toggle/theme-toggle.tsx`
- [ ] T039 [P] [US2] Replace `Button` in `src/shared/ui/card-action-button/card-action-button.tsx`
- [ ] T040 [P] [US2] Replace `Button` and `Text` in `src/views/landing/components/hero/hero.tsx`
- [ ] T041 [P] [US2] Replace `Banner`, `Button`, and `Text` in
  `src/views/studio/studio-page.tsx`
- [ ] T042 [P] [US2] Replace `Badge` in
  `src/features/generate-stream/components/pricing-tier-row/pricing-tier-row.tsx` (same file as
  T035; do both replacements in one pass)
- [ ] T043 [P] [US2] Replace `Banner`, `Card`, and `Skeleton` in
  `src/features/generate-stream/components/variation-card/variation-card.tsx`
- [ ] T044 [P] [US2] Replace `Card` in
  `src/views/landing/components/product-preview/product-preview.tsx`
- [ ] T045 [P] [US2] Replace `Text` in
  `src/views/studio/components/audience-summary-bar/audience-summary-bar.tsx`
- [ ] T046 [US2] Replace `Layout`/`LayoutContent` in
  `src/features/export/components/export-dialog/export-dialog.tsx` with a plain composed
  `<div>` structure (no library needed; depends on nothing above, but touches the same file as
  the Phase 5 `CodeBlock` work, so coordinate with whoever picks up US3/US4)

### Validation

- [ ] T047 [US2] Visual parity pass: compare `getComputedStyle` for every swapped component
  against `docs/design/Pricing Optimizer.html`, both color schemes, both routes (per
  `quickstart.md`'s Increment 2 section)
- [ ] T048 [US2] Run the full gate; confirm zero axe violations and 4.5:1 contrast held
- [ ] T049 [US2] Run `pr-reviewer` against `git diff main...HEAD`; the PR body MUST link this
  spec and issue #33 so the expected Principle III finding is dismissed as sanctioned, not
  reverted; fix every other finding; open the PR

**Checkpoint**: Only `Theme`, `Dialog`/`DialogHeader`, `Tab`/`TabList`, and `CodeBlock` still
import from Astryx. Merge before starting Phase 4.

---

## Phase 4: User Story 3 - Interactive components no longer need browser polyfills (Priority: P2)

**Goal**: The export dialog's `Dialog` and tab switching come from Radix via shadcn. The
`HTMLDialogElement` jsdom polyfill is deleted.

**Independent Test**: Replace, then delete the polyfill and confirm the suite still passes
without it — verified by deletion, not assumed.

- [ ] T050 [US3] Add dependency: `pnpm add @radix-ui/react-dialog @radix-ui/react-tabs`
- [ ] T051 [P] [US3] Vendor `Dialog` into `src/shared/ui/primitives/dialog.tsx` via `shadcn add
  dialog`, add its exclude-list entry
- [ ] T052 [P] [US3] Vendor `Tabs` into `src/shared/ui/primitives/tabs.tsx` via `shadcn add
  tabs`, add its exclude-list entry
- [ ] T053 [US3] Replace `Dialog`/`DialogHeader` and `Tab`/`TabList` in
  `src/features/export/components/export-dialog/export-dialog.tsx` with T051/T052, preserving:
  width 720, the `Export — {strategyLabel}` header, and the reset-to-`jsx`-on-`variationId`-change
  behavior (depends on T051, T052)
- [ ] T054 [US3] Update `src/views/studio/studio-page.test.tsx`: replace
  `document.querySelector("dialog")` with a query against Radix's `role="dialog"` semantics
- [ ] T055 [US3] Delete the `HTMLDialogElement.prototype.showModal`/`close` polyfill block from
  `test/setup.ts`
- [ ] T056 [US3] Manually verify keyboard behavior per `quickstart.md`'s Increment 3 checklist:
  open by keyboard, tab through formats with focus trapped, Escape closes and returns focus to
  the trigger

### Validation

- [ ] T057 [US3] Run the full gate; confirm every dialog test passes **without** the deleted
  polyfill (depends on T055)
- [ ] T058 [US3] Run `pr-reviewer`, PR body linking spec + issue #33; fix findings; open the PR

**Checkpoint**: Only `Theme` and `CodeBlock` still import from Astryx. Merge before starting
Phase 5.

---

## Phase 5: User Story 4 - The export preview still reads as code (Priority: P2)

**Goal**: `CodeBlock` is replaced by an owned component over `prism-react-renderer`, per
Clarification 1. All three export formats stay readable and copyable.

**Independent Test**: Replace only the code preview; verify each format renders and copies
correctly.

- [ ] T059 [US4] Add dependency: `pnpm add prism-react-renderer`
- [ ] T060 [US4] Create `src/shared/ui/code-preview/code-preview.tsx`: wraps
  `prism-react-renderer`, themed from this repo's own tokens (not a bundled preset), supporting
  `tsx`, `html`, `json`; reimplements `hasCopyButton`, `hasLineNumbers`, `title`, and
  `maxHeight={420}` with contained overflow scrolling
- [ ] T061 [US4] Write `src/shared/ui/code-preview/code-preview.test.tsx` covering: each
  language renders as highlighted code, copy places the full unmodified content on the
  clipboard, long content scrolls without the page scrolling sideways, and empty/single-line
  content doesn't collapse or misalign
- [ ] T062 [US4] Add `src/shared/ui/code-preview/index.ts` barrel
- [ ] T063 [US4] Replace `CodeBlock` in
  `src/features/export/components/export-dialog/export-dialog.tsx` with T060, mapping
  `FORMAT_LANGUAGE`'s existing `tsx`/`html`/`json` values through

### Validation

- [ ] T064 [US4] Manually verify all three export formats per `quickstart.md`'s Increment 4
  section, in both color schemes
- [ ] T065 [US4] Run the full gate
- [ ] T066 [US4] Run `pr-reviewer`, PR body linking spec + issue #33; fix findings; open the PR

**Checkpoint**: Only `Theme` still imports from Astryx anywhere in `src/`. Merge before starting
Phase 6.

---

## Phase 6: User Story 5 - Token and theme handover (highest risk, deletes nothing)

**Goal**: Own all 14 bridged token utilities, `color-scheme`, the heading reset, and
`data-theme`, without deleting Astryx yet. This is the increment `research.md` (R3, R4) and
`data-model.md` (sections 2 and 5) exist to de-risk — read both before starting.

**Independent Test**: Per `quickstart.md`'s Increment 5 table — every theme edge case (fresh
dark-OS visitor, live OS-scheme change, returning visitor, hard reload, dark-mode bespoke
tokens, `bg-body`, raw headings) verified explicitly.

### Token layer

- [ ] T067 [US5] In `src/app/globals.css`, define all 14 token utilities from `data-model.md`
  section 2 in an owned `@theme inline` block, using the **exact same utility names**
  (`text-secondary`, `border-border`, `bg-muted`, `text-primary`, `border-border-strong`,
  `bg-surface`, `bg-border`, `bg-card`, `text-accent`, `text-error`, `bg-body`, `border-error`,
  `text-warning`, `text-success`) so no call site changes
- [ ] T068 [US5] In the same file, reproduce the `h1`-`h6` reset currently shipped by
  `src/shared/theme/generated/pricing-optimizer.css`'s `@layer reset` block (font family, size,
  weight, line height per heading level)
- [ ] T069 [US5] Rework the `@layer reset, theme, base, ..., utilities;` order in
  `src/app/globals.css` to drop the Astryx-specific layers while keeping utilities winning over
  component defaults (see the load-bearing-order comment already in the file)
- [ ] T070 [US5] Move `entities/strategy/strategy-meta.ts`'s Astryx color variants
  (`orange`/`teal`/`pink`) to owned token references consistent with T067; update
  `strategy-meta.test.ts` if assertions touch the variant values

### Theme ownership

- [ ] T071 [US5] Rewrite `src/shared/theme/components/theme-mode-provider/theme-mode-provider.tsx`
  to write `data-theme` on `document.documentElement` directly and drop the `<Theme>`/
  `pricingOptimizerTheme` import, preserving: binary light/dark, the
  `pricing-optimizer-theme-mode` `localStorage` key, and OS-following behavior while
  `hasExplicitPreference` is false
- [ ] T072 [US5] Extend `src/shared/theme/theme-init-script.ts` to set `color-scheme` on
  `document.documentElement.style` alongside `data-theme`, so the pre-hydration script keeps
  both in sync before paint
- [ ] T073 [US5] Update `src/shared/theme/components/theme-mode-provider/theme-mode-provider.test.tsx`
  for the rewritten provider (depends on T071)
- [ ] T074 [US5] Rewrite `test/render.tsx` to stop wrapping components in Astryx's `<Theme>`

### Validation (all items are past real bugs — verify each explicitly, per quickstart.md)

- [ ] T075 [US5] Verify: fresh visitor, dark OS, no stored preference renders dark and the
  toggle icon reflects the *resolved* scheme, not raw stored state
- [ ] T076 [US5] Verify: OS scheme change while the page is open, with no explicit preference
  set, updates live
- [ ] T077 [US5] Verify: a returning visitor's existing `pricing-optimizer-theme-mode` value is
  still honored
- [ ] T078 [US5] Verify: hard reload shows no flash of the wrong color scheme before hydration
- [ ] T079 [US5] Verify: both `--po-accent-rust` and `--po-text-muted` resolve to their **dark**
  `light-dark()` values in dark mode (depends on T072 setting `color-scheme` correctly)
- [ ] T080 [US5] Verify `<body>` still carries the `bg-body` utility class (a past real bug)
- [ ] T081 [US5] Verify raw `h1`-`h6` elements still render with heading typography (depends on
  T068)
- [ ] T082 [US5] Confirm zero remaining source imports:
  `grep -rl "@astryxdesign" src/ test/` must return no matches (Astryx stays installed; only
  unreferenced)
- [ ] T083 [US5] Run `pnpm build && pnpm start` and re-verify T075-T081 against the real
  production build, not just `pnpm dev` (this repo has a known Turbopack dev-only quirk that
  previously dropped theme CSS after repeated hot reloads — do not chase it as a real bug if
  seen only in `pnpm dev`)

### Gate

- [ ] T084 [US5] Run the full gate
- [ ] T085 [US5] Run `pr-reviewer`, PR body linking spec + issue #33; fix findings; open the PR

**Checkpoint**: No source file references Astryx. The packages are still installed and the
generated theme files still exist, both intentionally, so Phase 7's diff is deletion-only. Merge
before starting Phase 7.

---

## Phase 7: User Story 6 - Astryx is gone, with nothing left behind (Priority: P1)

**Goal**: Delete everything Phase 6 made dead, correct the one polyfill that must NOT be
deleted, write the superseding ADR, and amend the constitution to 2.0.0.

**Independent Test**: Delete per the manifest, then a clean install and build succeed with no
manual step, and a repo-wide search for the old library returns nothing outside decision
records.

### Deletion (per data-model.md section 4)

- [ ] T086 [P] [US6] Delete `src/shared/theme/generated/` (all four files)
- [ ] T087 [P] [US6] Delete `src/shared/theme/pricing-optimizer-theme.ts`
- [ ] T088 [US6] Remove the `build:theme` script from `package.json`
- [ ] T089 [US6] Remove `@astryxdesign/core`, `@astryxdesign/theme-neutral`, and
  `@astryxdesign/cli` from `package.json`; run `pnpm install` to update `pnpm-lock.yaml`
- [ ] T090 [US6] Remove the three `@astryxdesign/*` `@import` lines and the
  `@import "../shared/theme/generated/pricing-optimizer.css"` line from `src/app/globals.css`
  (superseded by Phase 6's T067-T069)
- [ ] T091 [US6] **Do NOT delete** the `window.matchMedia` polyfill in `test/setup.ts` — it
  serves `ThemeModeProvider`, not just the removed library (per `research.md` R5). Correct its
  comment, which currently attributes the need to `useTheme`, an import that does not exist in
  this repo
- [ ] T092 [US6] Grep for any `shared/ui` wrapper whose only remaining purpose was adapting an
  Astryx API with zero consumers left after Phases 3-6; delete any found

### Documentation

- [ ] T093 [US6] Write an ADR in `../docs/decisions/` superseding the original Astryx decision:
  context (the five problems from spec.md's "Why this change"), decision (shadcn/ui + Radix +
  owned `Text`/`code-preview`), rejected alternatives (staying on Astryx, adopting `next-themes`,
  Shiki, uniform vendored-primitive testing — see `research.md`), and consequences, following the
  format of the repo's existing ADRs

### Constitution amendment (deliberately last — see spec.md's "Constitution conflict" section)

- [ ] T094 [US6] Run `/speckit-constitution` to bump `.specify/memory/constitution.md` to
  **2.0.0** with a Sync Impact Report: rewrite Principle III to describe the design-system
  discipline that now exists (shadcn/ui + Radix, the vendored-flat-and-excluded vs.
  owned-foldered-and-tested rule from Clarification 2, single ownership of `data-theme`), update
  the "Additional Constraints (Stack & Cost)" fixed-stack list to name the new stack, and correct
  Principle II's stale `domain/`/`features/`/`components/ui/`/`lib/api/` references to the
  current `app -> views -> features -> entities -> shared` layering from ADR-0016

### Final validation

- [ ] T095 [US6] From a clean tree: `rm -rf node_modules && pnpm install && pnpm build` succeeds
  with no manual pre-build step
- [ ] T096 [US6] Run the full gate one final time
- [ ] T097 [US6] Run `grep -ri astryx . --exclude-dir=node_modules --exclude-dir=.git`; confirm
  matches appear only under `docs/decisions/` and `specs/003-shadcn-ui-migration/`
- [ ] T098 [US6] Run `pnpm lighthouse` against the deployed result post-merge; confirm no
  regression against the 99 landing / 95+ Studio baseline
- [ ] T099 [US6] Run `pr-reviewer`, PR body linking spec + issue #33 and noting this is the
  increment that resolves the sanctioned Principle III divergence; fix findings; open the PR
- [ ] T100 [US6] Close issue #33, referencing the six merged PRs

**Checkpoint**: Feature complete. All nine success criteria in spec.md are met.

---

## Dependencies & Execution Order

### Phase Dependencies (strictly sequential — this is a single-line migration, not parallel tracks)

- **Setup (Phase 1)**: No dependencies.
- **US1 (Phase 2)**: Depends on Setup. Blocks every later phase — it establishes the
  folder-per-component convention every subsequent swap follows.
- **US2 (Phase 3)**: Depends on US1's restructure being merged.
- **US3 (Phase 4)**: Depends on US2 (touches the same `export-dialog` file US2's T046 already
  restructured).
- **US4 (Phase 5)**: Depends on US3 (same file again, now Radix-based).
- **US5 (Phase 6)**: Depends on US2-US4 leaving only `Theme` as the remaining Astryx import.
- **US6 (Phase 7)**: Depends on US5 proving nothing references Astryx before anything is
  deleted.

There is no valid parallel-team decomposition here the way the template's default assumes: every
phase after US1 narrows the same shrinking Astryx surface, and US3/US4/US5 all touch
`export-dialog.tsx` or the theme provider in sequence. Within a phase, tasks marked `[P]` touch
different files and may be split across contributors; phases themselves are strictly ordered.

### Within Each Phase

- Restructure/vendor before swap (US1 before anything; primitives vendored before call sites
  updated in US2/US3)
- Swap before validation
- Validation and `pr-reviewer` before opening the PR
- PR merged before the next phase starts

### Parallel Opportunities

- **Within Phase 2 (US1)**: T003-T009 (shared/ui backfill) are mutually independent; T012-T022
  (feature/view restructures) are mutually independent and independent of T003-T009.
- **Within Phase 3 (US2)**: T028-T032 (vendoring) are independent of each other; T035-T045 (call
  site swaps) are independent of each other once T028-T034 land, since they touch different
  files (T035 and T042 share a file — sequence those two, not parallel).
- **Within Phase 6 (US5)**: T067-T068 (both in `globals.css`) should be one contributor, not
  split; T071-T074 (theme provider) are a separate independent group from T067-T070.
- **Within Phase 7 (US6)**: T086-T087 (pure deletions) can run in parallel with each other.

---

## Parallel Example: Phase 2 (US1)

```bash
# Backfill the five untested shared/ui components together — different files, no shared state:
Task: "Convert color-accent-column.tsx to a folder + write its missing test"
Task: "Convert color-dot.tsx to a folder + write its missing test"
Task: "Convert eyebrow.tsx to a folder + write its missing test"
Task: "Convert panel-header.tsx to a folder + write its missing test"
Task: "Convert price-display.tsx to a folder + write its missing test"
```

## Parallel Example: Phase 3 (US2)

```bash
# Vendor the five primitives with no interactive/Radix dependency together:
Task: "shadcn add button -> src/shared/ui/primitives/button.tsx"
Task: "shadcn add card -> src/shared/ui/primitives/card.tsx"
Task: "shadcn add badge -> src/shared/ui/primitives/badge.tsx"
Task: "shadcn add alert -> src/shared/ui/primitives/alert.tsx"
Task: "shadcn add skeleton -> src/shared/ui/primitives/skeleton.tsx"
```

---

## Implementation Strategy

### MVP First (Phase 1 + Phase 2 only)

1. Complete Setup.
2. Complete US1: restructure and backfill tests, Astryx untouched.
3. **STOP and VALIDATE**: this alone is a real, shippable improvement (coverage rose, structure
   is consistent) independent of whether the rest of the migration ever proceeds.
4. Merge and demo if desired before continuing.

### Incremental Delivery

Each of the remaining five phases is its own merged, deployed increment. Astryx keeps working in
production through Phase 6; Phase 7 is the only one that removes it. If work stops after any
phase, the app is in a fully working, fully green state — there is no phase that leaves the
repo broken pending a later one.

### Constitution divergence, tracked across every phase after US1

Phases 3 through 7 knowingly diverge from Principle III (v1.2.0) until Phase 7's amendment. Every
PR from Phase 3 onward must link this spec and issue #33 in its description so `pr-reviewer`'s
expected finding is recognized as sanctioned, not treated as a regression to revert.

---

## Notes

- `[P]` tasks touch different files with no dependency on an incomplete task in the same phase.
- `[Story]` labels map every implementation task to its increment for traceability back to
  spec.md and issue #33.
- Commit after each task or small logical group; keep the branch-per-phase, one-logical-unit
  convention from the constitution's Workflow section.
- Every phase's "Checkpoint" is a real merge point, not just a suggestion: the next phase's tasks
  assume the previous phase's files exist in their new shape.
- Avoid: reordering phases (each narrows the same shrinking Astryx surface), skipping the
  `matchMedia` correction in T091, or treating the Phase 7 constitution amendment as optional.
