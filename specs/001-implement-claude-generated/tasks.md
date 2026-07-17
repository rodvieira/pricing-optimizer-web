# Tasks: Studio & Landing — implement the generated design

**Input**: Design documents from `/specs/001-implement-claude-generated/`

**Prerequisites**: plan.md, spec.md

**Tests**: Included for `lib/api/generate.ts` (the SSE frame parser) per the constitution's
Test Rigor principle — non-trivial, non-obvious logic. Presentational components are not
separately unit-tested.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Fill `.specify/memory/constitution.md` for this repo
- [x] T002 Create feature spec `specs/001-implement-claude-generated/spec.md`
- [x] T003 Create implementation plan `specs/001-implement-claude-generated/plan.md`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the `lib/api/` wire-mapping layer every user story's UI depends on.

- [ ] T004 [P] `lib/api/analyze.ts` — wrap `apiClient.POST("/v1/analyze")`, map wire
      `SiteProfile` → domain `SiteProfile`
- [ ] T005 [P] `lib/api/generate.ts` — `streamGeneration()` async generator: raw `fetch()` +
      `ReadableStream` reader, SSE frame split, `StreamChunk` → domain `StreamEvent` mapping,
      non-2xx → single `{type:"error", problem}`
- [ ] T006 [P] `lib/api/get-generation.ts` — wrap `GET /v1/generations/{id}`
- [ ] T007 [P] `lib/api/export.ts` — wrap `POST /v1/export/{id}`, map wire `ExportResult` →
      domain `ExportResult`
- [ ] T008 `test/lib/api/generate.test.ts` — unit test `streamGeneration()`'s frame parser
      against a fixture `ReadableStream` (multi-chunk frames, a frame split across two
      reads, a terminal `done`, a non-2xx Problem response)
- [ ] T009 [P] `features/generate-stream/strategy-meta.ts` — `anchor→orange`,
      `freemium→teal`, `value_based→pink` label/variant map, shared by landing + Studio

**Checkpoint**: wire layer + strategy color mapping ready — user story work can begin.

---

## Phase 3: User Story 1 - Analyze a URL and watch three strategies stream in (P1) 🎯 MVP

**Goal**: paste a URL → see audience summary → three cards independently progress from
queued → generating → complete.

**Independent Test**: per `spec.md` User Story 1 acceptance scenarios.

### Implementation for User Story 1

- [ ] T010 [P] [US1] `features/url-input/url-input-schema.ts` — Zod URL validation/normalization
- [ ] T011 [US1] `features/url-input/use-analyze.ts` — TanStack Query mutation wrapping T004
- [ ] T012 [US1] `features/url-input/url-input-form.tsx` — react-hook-form + zod resolver,
      Astryx `TextInput`/`Button`, example chips (depends on T010, T011)
- [ ] T013 [US1] `features/generate-stream/use-generate-stream.ts` — `useReducer(streamReducer)`,
      `AbortController`, `start()` iterating T005's generator, cleanup-on-unmount (depends on T005)
- [ ] T014 [P] [US1] `features/generate-stream/pricing-tier-row.tsx` — one `PricingTier`:
      formatted price (`Intl.NumberFormat`, `customLabel` override), features, CTA, badge
- [ ] T015 [US1] `features/generate-stream/variation-card.tsx` — header (dot + Badge/status),
      rationale (types out via `partialText`, `Skeleton` while pending), tiers via T014,
      footer actions (depends on T009, T014)
- [ ] T016 [US1] `features/generate-stream/variation-grid.tsx` — 3-column responsive grid,
      renders three `variation-card.tsx` in fixed strategy order (depends on T015)
- [ ] T017 [P] [US1] `components/ui/app-header.tsx` — sticky header, logo mark (T009 colors),
      nav, reuses `features/theme/theme-toggle.tsx`
- [ ] T018 [US1] `app/layout.tsx` — swap Geist for Bricolage Grotesque + IBM Plex Sans/Mono,
      render `<AppHeader />` (depends on T017); verify Astryx `theme-neutral` font tokens
      pick up the swap
- [ ] T019 [US1] `app/studio/page.tsx` — orchestrates: `UrlInputForm` submit → `use-analyze`
      → audience bar → `useGenerateStream.start()` → `EmptyState`/`VariationGrid` (depends on
      T012, T013, T016, T018)

**Checkpoint**: User Story 1 fully functional and independently testable (needs
`go run ./cmd/api` locally to verify end-to-end).

---

## Phase 4: User Story 4 - Distinct empty/error/slow states (P1)

**Goal**: idle, invalid-URL, backend-error, and single-strategy-slow all render distinctly.

**Independent Test**: per `spec.md` User Story 4 acceptance scenarios.

### Implementation for User Story 4

- [ ] T020 [US4] Idle state: Astryx `EmptyState` in `app/studio/page.tsx` when no submission
      yet (depends on T019)
- [ ] T021 [US4] Inline URL validation error surfaced by `url-input-form.tsx`'s Zod resolver
      (depends on T012) — no network call on invalid input
- [ ] T022 [US4] Analyze/generate failure: Astryx `Banner status="error"` rendering the real
      `Problem.title`/`detail` with a retry action, wired to T011/T013's error states
      (depends on T019)
- [ ] T023 [US4] Per-strategy "taking longer than usual" timer in
      `use-generate-stream.ts` (10s since entering `"streaming"`, cleared on
      completion/error/unmount), surfaced in `variation-card.tsx` (depends on T013, T015)

**Checkpoint**: all four states in User Story 4 visually distinct and demonstrable.

---

## Phase 5: User Story 2 - Hover comparison across variations (P2)

**Goal**: hovering a tier highlights the ordinally-equivalent tier in the other two cards.

**Independent Test**: per `spec.md` User Story 2 acceptance scenarios.

### Implementation for User Story 2

- [ ] T024 [US2] Lift `hoveredTierIndex` state into `variation-grid.tsx`, clear on
      `onMouseLeave` of the grid (depends on T016)
- [ ] T025 [US2] `pricing-tier-row.tsx` accepts `isHighlighted`/`onHoverStart` props, applies
      Astryx tint styling on match (depends on T014, T024)

**Checkpoint**: hover-compare works across all three cards once results are showing.

---

## Phase 6: User Story 3 - Export dialog (P2)

**Goal**: export a completed variation as JSX/HTML/Stripe JSON with copy-to-clipboard.

**Independent Test**: per `spec.md` User Story 3 acceptance scenarios.

### Implementation for User Story 3

- [ ] T026 [P] [US3] `features/export/use-export.ts` — query/mutation wrapping T007, keyed by
      `(variationId, format)`, fetched lazily per tab
- [ ] T027 [US3] `features/export/export-dialog.tsx` — Astryx `Dialog` + `DialogHeader` +
      `TabList` (jsx/html/stripe) + `CodeBlock` (`hasCopyButton`, `hasLineNumbers`) (depends
      on T026)
- [ ] T028 [US3] Wire `variation-card.tsx`'s "Export" button to open T027, disabled until
      `completed` (depends on T015, T027)

**Checkpoint**: export works for any completed variation in all three formats.

---

## Phase 7: Landing page

- [ ] T029 [P] Redesigned `app/page.tsx` — hero, static illustrative preview panel, strategy
      blurb row using T009's mapping (depends on T009, T017, T018)

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T030 `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all clean
- [ ] T031 Manual browser verification via the `run` skill: landing renders with new fonts/
      header, `/studio` empty state, URL validation, dark/light toggle on both routes
- [ ] T032 File a GitHub issue for "Edit inline" real behavior (out of scope per spec.md
      Assumptions) if not already tracked
- [ ] T033 Run `pr-reviewer`-equivalent self-review of the branch diff before opening the PR
      (no dedicated agent configured in this repo yet — do a careful manual pass against the
      constitution instead)

---

## Dependencies & Execution Order

- Phase 2 (Foundational) blocks all user stories.
- User Story 1 (Phase 3) and User Story 4 (Phase 4) are both P1 and share `app/studio/page.tsx`
  — implement sequentially (US1 then US4), not in parallel, since US4's states live inside
  the same page US1 builds.
- User Story 2 (Phase 5) and User Story 3 (Phase 6) both depend on User Story 1's
  `variation-card.tsx`/`variation-grid.tsx` existing, but are independent of each other and
  of User Story 4 — can be done in either order after Phase 3.
- Landing (Phase 7) only depends on Phase 2's `strategy-meta.ts` and Phase 3's header/layout
  work (T017, T018) — independent of Studio's user stories otherwise.
- Polish (Phase 8) depends on all prior phases.

## Notes

- Commit per logical group (roughly one commit per phase or per 2-3 related tasks), not one
  commit per task — mirrors this product's existing PR history style (e.g. backend PR #32's
  4-commit structure).
- If a real blocker surfaces mid-implementation (a design ambiguity with no reasonable
  default, a backend contract gap), file a GitHub issue on `pricing-optimizer-web` rather
  than silently working around it, per the constitution's Development Workflow section.
