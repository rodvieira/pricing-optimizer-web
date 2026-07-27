---

description: "Task list for PT-BR localization with a language selector"

---

# Tasks: PT-BR localization with a language selector

**Input**: Design documents from `specs/004-pt-br-localization/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [quickstart.md](./quickstart.md) — all complete, no open
clarifications.

**Tests**: This repo's constitution mandates a 90% coverage floor (Principle IV) and non-trivial
logic must have unit tests. Test tasks below are **not optional**.

**Organization**: Unlike the six-PR Astryx-to-shadcn/ui migration, this feature converges to
**one pull request**, per explicit instruction from the person who requested this work. Phases
below are still organized by user story (so each is independently reviewable within the one
diff and independently verifiable per quickstart.md), but there is no branch-per-phase, no
sequential merge-before-next-phase gate, and only one `pr-reviewer` pass at the end, against the
whole diff.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1/US2/US3, matching spec.md's three prioritized user stories
- Every task names an exact file path

## Path Conventions

Single Next.js project. All paths are relative to `pricing-optimizer-web/` (this repo's root),
following the existing `app -> views -> features -> entities -> shared` layers under `src/`.

---

## Phase 1: Setup

- [X] T001 Confirm branch `004-pt-br-localization`, branched from up-to-date `main`
- [X] T002 Add dependencies: `pnpm add next-intl @radix-ui/react-select` (both confirmed
  peer-compatible with Next.js 16.2.11 / React 19.2.4 per research.md R1/R3 before adding)
- [X] T003 Write the ADR in `../docs/decisions/` (next available number) recording: the
  `next-intl` library choice and why (research.md R1), the client-only/no-routing/no-cookie
  mode decision and its accepted one-render-flash trade-off (research.md R2), the Radix
  `Select` primitive choice (research.md R3), and — the one real correction this planning
  phase produced — that error-copy mapping keys on `Problem.status`, not `Problem.type`,
  because the backend never populates `type` (research.md R4, confirmed by reading
  `pricing-optimizer-api/internal/adapter/httpapi/response.go` directly)

**Checkpoint**: Dependencies installed, decision recorded. Nothing behavioral changes yet.

---

## Phase 2: Foundational (blocks all user stories)

**Purpose**: The locale-owning provider and message-catalog skeleton every story depends on.

- [X] T004 Create `src/shared/ui/primitives/select.tsx` — vendor `@radix-ui/react-select` via
  `shadcn add select` (or hand-placed equivalent), flat and coverage-excluded like the other
  vendored primitives; add its entry to `vitest.config.ts`'s exclude list
- [X] T005 Create `src/shared/i18n/messages/en.json` and `src/shared/i18n/messages/pt-BR.json`
  with the full namespace/key skeleton from data-model.md section 2 (`nav`, `strategy`,
  `generateStream`, `history`, `export`, `urlInput`, `errors`, `metadata`, `studio`, `landing`)
  — placeholder English values in both files initially so the app builds; real Portuguese
  translations land per-story below, not deferred to the end
- [X] T006 [P] Create `src/shared/i18n/components/locale-provider/locale-provider.tsx`:
  `LocaleProvider` owning `locale` state (`"en" | "pt-BR"`, default `"en"`), a mount effect
  reading `localStorage`'s `pricing-optimizer-locale` key (falls back to `"en"` for any value
  other than exactly `"en"`/`"pt-BR"` — data-model.md invariant 2), a `setLocale` that updates
  state and writes `localStorage` synchronously, wrapping `next-intl`'s
  `NextIntlClientProvider` with the resolved `locale` and matching imported message catalog;
  `useLocale()` hook exposing `{ locale, setLocale }` — mirrors
  `shared/theme/components/theme-mode-provider/theme-mode-provider.tsx`'s exact shape
- [X] T007 [P] `src/shared/i18n/components/locale-provider/locale-provider.test.tsx`: default
  with nothing stored, adopts a validly stored locale, ignores a corrupted/unrecognized stored
  value (falls back to `"en"`), `setLocale` updates state and persists — same test shape as
  `theme-mode-provider.test.tsx`
- [X] T008 Create `src/shared/i18n/index.ts` barrel exporting `LocaleProvider`, `useLocale`
- [X] T009 Wire `LocaleProvider` into `src/shared/providers/app-providers.tsx`, composed
  alongside `ThemeModeProvider` (same file, same pattern, order: `QueryProvider` >
  `ThemeModeProvider` > `LocaleProvider` > `MotionConfig` — locale doesn't depend on theme or
  vice versa, so this ordering is arbitrary but pick one and don't nest unnecessarily deep)
- [X] T010 [P] `test/render.tsx`: confirm whether `LocaleProvider` needs to wrap
  component-under-test the way `AppProviders` mounts it for real (only if a component under
  test reads `useTranslations()`/`useLocale()` — check after Phase 3-5 tasks land which
  components need it; do not add unconditionally)

**Checkpoint**: `LocaleProvider` exists, is wired, defaults to English, and round-trips through
`localStorage`. No UI yet reads a translated string — `pnpm build` still succeeds unmodified.

---

## Phase 3: User Story 1 - Switch the app's display language (Priority: P1) 🎯 MVP

**Goal**: A real, accessible language control in the header that switches `locale` state with
no page reload and persists the choice.

**Independent Test**: Load fresh (no stored preference) — English. Select Portuguese — header
switches immediately, no navigation. Reload — still Portuguese.

- [X] T011 [US1] Create `src/shared/i18n/components/locale-selector/locale-selector.tsx`:
  composes the vendored `Select` (T004) over `useLocale()` (T006), two options (English /
  Português), accessible label (spec FR-001 explicitly rules out an unlabeled native
  `<select>`), keyboard-operable
- [X] T012 [US1] `src/shared/i18n/components/locale-selector/locale-selector.test.tsx`:
  renders current locale as selected, selecting the other option calls `setLocale`
- [X] T013 [US1] Create `src/shared/i18n/components/locale-selector/index.ts`; add to
  `src/shared/i18n/index.ts` barrel (T008)
- [X] T014 [US1] Render `LocaleSelector` in `src/shared/ui/app-header/app-header.tsx`, next to
  the existing `ThemeToggle`
- [X] T015 [US1] `test/e2e/i18n.spec.ts` (new file): language switch on `/` — select Portuguese,
  assert visible header text changed, assert URL unchanged, reload, assert still Portuguese;
  repeat on `/studio`; zero axe violations with the selector in place
- [X] T016 [US1] Manual verification per quickstart.md section 1, including the accepted
  one-render English-flash-before-Portuguese behavior on a hard reload with Portuguese stored
  (confirm it's a brief content swap, not a broken/blank state)

**Checkpoint**: The switch itself works end to end. Nothing is translated yet except whatever
placeholder strings T005 seeded — this alone is the MVP slice per spec.md's Story 1 priority.

---

## Phase 4: User Story 2 - No hardcoded English string leaks through (Priority: P2)

**Goal**: Every user-facing string enumerated in data-model.md section 2 moves from hardcoded
component source into the two message catalogs, with real Portuguese translations (not
placeholders).

**Independent Test**: With Portuguese selected, walk the full flow (landing, invalid URL, valid
generation, all three error statuses, export dialog, history) and find zero stray English
outside the LLM-generated pricing content itself.

### Navigation and chrome

- [X] T017 [P] [US2] `nav.*` keys (`overview`, `studio`) in both catalogs; update
  `src/shared/ui/app-header/app-header.tsx`'s `NAV_ITEMS` to resolve labels via
  `useTranslations()` instead of the hardcoded `label` strings

### Strategy metadata (shared across landing and Studio)

- [X] T018 [US2] `strategy.{anchor,freemium,value_based}.{label,blurb}` keys in both catalogs
  (content sourced from the current English strings in `strategy-meta.ts`, translated to
  pt-BR); remove the `label`/`blurb` fields from
  `src/entities/strategy/strategy-meta.ts`'s `STRATEGY_META` entirely (spec FR-011 — `variant`
  stays, it's a color-mapping key, not copy) — this is a real interface change, so it must
  land together with every consumer update below in the same commit/PR, not staged separately
- [X] T019 [US2] Update `src/entities/strategy/strategy-meta.test.ts` for the narrowed
  `StrategyMeta` shape (no more `label`/`blurb` fields to assert on)
- [X] T020 [P] [US2] Update `src/views/landing/components/strategy-trio/strategy-trio.tsx` to
  resolve `strategy.{strategy}.label`/`.blurb` via `useTranslations()` instead of reading
  `meta.label`/`meta.blurb`
- [X] T021 [P] [US2] Update `src/features/generate-stream/components/variation-card/variation-card.tsx`
  the same way (`meta.label` usage) — same task group as T020, different file, safe to
  parallelize

### `generate-stream` copy

- [X] T022 [US2] `generateStream.status.{queued,ready,failed,slow,generating}` keys; update
  `variation-card.tsx`'s `statusLabel()` to resolve through `useTranslations()` instead of
  returning literal strings
- [X] T023 [P] [US2] `generateStream.rationaleLabel` ("STRATEGY RATIONALE") and
  `generateStream.slowBanner` ("Taking longer than usual — model still streaming this
  variant.") keys; update the same file's two remaining literal strings
- [X] T024 [P] [US2] `generateStream.exportLabel` ("Export") and `generateStream.editInlineLabel`
  ("Edit inline") keys; update the two `CardActionButton` calls in the same file
- [X] T025 [P] [US2] `generateStream.mostPopularBadge` ("Most popular") and
  `generateStream.choosePlanCta` ("Choose plan") keys; update
  `src/features/generate-stream/components/pricing-tier-row/pricing-tier-row.tsx`

### `history` copy

- [X] T026 [US2] `history.recentGenerations` ("Recent generations") and `history.clear`
  ("Clear") keys; update `src/features/history/components/history-panel/history-panel.tsx`
- [X] T027 [US2] Same file: replace the hardcoded `new Intl.RelativeTimeFormat("en", ...)` with
  a locale-aware instance keyed off `useLocale()`'s current `locale` (memoized per locale, not
  reconstructed every render) — found during planning; not in the original issue's sweep list
  but the same class of bug FR-008 exists to prevent

### `export` dialog copy

- [X] T028 [US2] `export.dialogTitle` (`"Export — {strategyLabel}"`, interpolated) and
  `export.formatError` ("Couldn't generate this export format. Try switching tabs or
  reopening the dialog.") keys; update
  `src/features/export/components/export-dialog/export-dialog.tsx`. **Decision, record in the
  ADR (T003)**: `FORMAT_LABEL` values (`JSX`/`HTML`/`Stripe JSON`) are technical format
  identifiers, not prose — stay untranslated in both locales, the same way file extensions or
  `application/json` wouldn't be translated

### `urlInput` validation copy

- [X] T029 [US2] `urlInput.required` ("Paste a product URL to get started.") and
  `urlInput.invalid` ("Invalid URL — include a valid domain like flowbase.com.") keys; change
  `src/features/url-input/url-input-schema.ts`'s Zod `.min()`/`.refine()` messages to the
  stable key strings themselves (not display text — the schema stays framework/locale-agnostic
  per data-model.md section 2)
- [X] T030 [US2] Update `src/features/url-input/components/url-input-form/url-input-form.tsx`
  to resolve `formState.errors.url?.message` through `useTranslations()` before rendering,
  instead of rendering the raw (now-a-key) string directly
- [X] T031 [US2] Update `src/features/url-input/url-input-schema.test.ts` for the new
  key-shaped messages if any assertion checks the literal message text

### Error mapping (status-based, per data-model.md section 3 — corrected from the source
issue's `Problem.type` assumption)

- [X] T032 [US2] `errors.status{400,404,409,422,429,500,502}`, `errors.network`, and
  `errors.generic` keys (content: the eight-row table in data-model.md section 3, translated)
- [X] T033 [US2] Create `src/shared/api/problem-message.ts`: exported function taking a
  `Problem` and returning the matching translation key from T032's table (status → key, falling
  back to `errors.generic` for any unmapped status), plus `problem-message.test.ts` covering
  every row in the table and the fallback case (data-model.md invariant 4)
  🎯
- [X] T034 [P] [US2] Update `src/views/studio/studio-page.tsx`'s two `Alert` call sites
  (`analyze.error.problem` and `generateStream.state.problem`) to resolve the translated
  message via T033 instead of rendering `problem.title` directly; the `"Generation failed"`
  fallback string also moves to a `studio.*` key (T038)
- [X] T035 [P] [US2] Update `src/features/generate-stream/components/variation-card/variation-card.tsx`'s
  `Rationale` component's error-state `Alert` (`state.problem.title`/`.detail`) the same way —
  **found during planning grounding, not in the original issue's file list**: this is a third
  call site rendering a raw `Problem` string, easy to miss because it's inside a conditional
  branch of a component whose main job isn't error display

### Studio and landing chrome

- [X] T036 [US2] `studio.heading` ("Studio"), `studio.subheading` ("Paste a product URL — we
  generate three pricing strategies in parallel."), `studio.retry` ("Retry"),
  `studio.generationFailedFallback` ("Generation failed") keys; update `studio-page.tsx`
- [X] T037 [P] [US2] `studio.emptyTitle` ("Nothing generated yet") and `studio.emptyBody`
  ("Paste a product URL above to stream three pricing strategies side by side.") keys; update
  `src/views/studio/components/studio-empty-state/studio-empty-state.tsx`
- [X] T038 [P] [US2] `studio.audienceScraped` (interpolated: `"Scraped {title} — detected
  audience"`) and `studio.sophistication.{low,medium,high}` keys (mapping the
  `Sophistication` enum — `"low" | "medium" | "high"`, a fixed backend classification, not
  free-form LLM text, so it IS in scope per FR-006's reasoning); update
  `src/views/studio/components/audience-summary-bar/audience-summary-bar.tsx`'s
  `sophisticationLabel()`. **Decision, record in the ADR**: `siteProfile.audience.segment` (a
  free-form string, not an enum) stays English — it's backend/LLM-classified descriptive text,
  the same category as the generated pricing content FR-009 already excludes, not a fixed set
  of strings this app controls the wording of
- [X] T039 [P] [US2] `landing.eyebrow` ("PSYCHOLOGY-DRIVEN PRICING"), `landing.headline` (the
  two-sentence hero headline), `landing.subcopy`, `landing.openStudioCta` ("Open the Studio
  →"), `landing.watchLiveRunCta` ("Watch a live run") keys; update
  `src/views/landing/components/hero/hero.tsx`
- [X] T040 [P] [US2] `landing.preview.{anchor,freemium,value}.{label,price,hint}` keys; update
  `src/views/landing/components/product-preview/product-preview.tsx`'s `PREVIEW_CARDS` — this
  is static illustrative data, not live API content, but per FR-006's "every user-facing
  string" scope, leaving this one section hardcoded English while the rest of the landing page
  translates is exactly User Story 2's named failure mode

### Page metadata

- [X] T041 [US2] (corrected: page metadata is out of scope, see ADR-0019 & spec Assumptions) `metadata.title`/`metadata.description` keys; update `src/app/layout.tsx`'s
  `export const metadata` to resolve per the current locale (Server Component — use
  `getTranslations`, not the client-only `useTranslations` hook, per research.md's
  Server-Component caveat)

### Validation

- [X] T042 [P] [US2] Catalog-parity test (new, e.g.
  `src/shared/i18n/messages/messages.test.ts`): `en.json` and `pt-BR.json` have identical key
  sets — fails loudly if a key exists in one and not the other (data-model.md invariant 1)
- [X] T043 [US2] Extend `test/e2e/i18n.spec.ts` (or a new `test/e2e/studio-i18n.spec.ts`): with
  Portuguese selected, walk the full flow per quickstart.md section 2 (invalid URL, full
  generation via the mocked backend, each error status `test/e2e/mock-backend.ts` can
  simulate, export dialog in all three formats, history) and assert no stray English string
  outside the mocked LLM-generated pricing content

**Checkpoint**: Zero hardcoded English string reachable when Portuguese is selected, outside
LLM-generated content and the intentionally-untranslated format identifiers (T028's decision).

---

## Phase 5: User Story 3 - Prices and numbers read naturally in each language (Priority: P3)

**Goal**: Pricing-tier amounts format with pt-BR grouping/decimal conventions when Portuguese
is selected, with no change to the underlying value or any export payload.

**Independent Test**: With Portuguese selected, view a completed generation's tiers — prices
use pt-BR punctuation. Switch to English — reverts to current (unchanged) behavior exactly.

- [X] T044 [US3] Update
  `src/features/generate-stream/components/pricing-tier-row/pricing-tier-row.tsx`'s
  `formatPrice()` to use the current `locale` from `useLocale()` (T006) instead of the
  hardcoded `"en-US"` passed to `Intl.NumberFormat` — `"pt-BR"` maps directly, no translation
  table needed, `Intl.NumberFormat` already knows pt-BR's conventions natively
- [X] T045 [P] [US3] `pricing-tier-row.test.tsx` (or a new colocated formatting test): the same
  `amount`/`currency` input formats with `en`'s and `pt-BR`'s distinct grouping/decimal
  punctuation (data-model.md invariant 5) — assert the punctuation differs, not a specific
  hardcoded currency symbol
- [X] T046 [US3] (landing preview kept as static translated strings, not real Intl formatting — decorative, not real Price data) Decide and implement per T040's landing-preview scope: if `PREVIEW_CARDS`'
  static prices were moved to real formatted values in T040, confirm they also respect
  `useLocale()`'s current locale, not just translated surrounding text — otherwise note in the
  ADR why the static preview stays a fixed display string
- [X] T047 [US3] Manual verification per quickstart.md section 3, including the Stripe-config
  export regression check (export payload numeric values unaffected by UI locale)

**Checkpoint**: All three user stories complete and independently verified.

---

## Final Validation & Gate

- [X] T048 Run the full gate: `pnpm typecheck && pnpm lint && pnpm test:coverage && pnpm build
  && pnpm test:e2e`; confirm coverage stays at or above the 90% floor
- [X] T049 Accessibility manual check per quickstart.md's Accessibility section: selector
  reachable/operable via keyboard alone, accessible name present, axe-core clean across all
  e2e specs including the new i18n ones
- [X] T050 Confirm `entities/strategy/strategy-meta.ts`'s English `label`/`blurb` fields are
  genuinely gone (T018), not left alongside their catalog-key replacements — `grep` to confirm
  no remaining reference
- [X] T051 Run `pr-reviewer` against `git diff main...HEAD` (the whole feature, one pass, since
  this is one PR); fix every blocking finding before pushing
- [ ] T052 Open the single PR, linking this spec and issue #34, noting the `Problem.type` →
  `Problem.status` correction and the intentionally-untranslated-format-identifiers decision
  (T028) so reviewers don't flag either as an oversight
- [ ] T053 Close issue #34 once merged, referencing the PR

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. Blocks every user story — nothing can render a
  translated string or own locale state before `LocaleProvider` and the catalog skeleton exist.
- **US1 (Phase 3)**: Depends on Foundational. Independently testable/demoable on its own — this
  is the MVP slice (spec.md's Story 1 priority).
- **US2 (Phase 4)**: Depends on Foundational (needs the provider) and benefits from US1 existing
  (so there's a control to switch language with while verifying each string), but each
  individual string-extraction task is independent of the others — see Parallel Opportunities.
- **US3 (Phase 5)**: Depends on Foundational (needs `useLocale()`); independent of US2's string
  extraction (touches `formatPrice`, a different concern from string catalogs) but naturally
  sequenced last since it's the lowest-priority story.

Unlike the shadcn migration's tasks.md, there is no merge gate between phases — all five phases
land in the same PR. Phase ordering above is for logical dependency and reviewability within
that one diff, not separate merge points.

### Parallel Opportunities

- **Within Phase 2**: T006/T007 (provider) and T004 (Select primitive) are independent; T010
  is deferred until Phase 3-5 determine whether it's needed.
- **Within Phase 4**: T017, T020/T021, T023, T024, T025, T034/T035, T037, T038, T039, T040 all
  touch different files with no dependency on an incomplete task in the same phase — the
  largest parallelization opportunity in this feature. T018/T019 (the `strategy-meta.ts`
  interface change) should land as one unit before T020/T021 (its consumers), not in parallel
  with them.
- **Within Phase 5**: T044 and T045 touch the same file (implementation + its test) — sequence,
  don't parallelize those two specifically.

---

## Implementation Strategy

### MVP First (Phase 1 + 2 + 3 only)

Setup + Foundational + US1 alone is a complete, demoable slice: a working language switch that
persists, even before any string is translated beyond whatever placeholders Phase 2 seeded.
Useful as a checkpoint to verify the mechanism before the much larger string-extraction sweep
in Phase 4.

### Single PR

All five phases (Setup through Final Validation) land in one pull request, per explicit
instruction — do not open intermediate PRs per phase the way the shadcn/ui migration did.
`pr-reviewer` runs once, against the complete diff, at the end (T051).

---

## Notes

- `[P]` tasks touch different files with no dependency on an incomplete task in the same phase.
- `[Story]` labels map every user-story-phase task to its story for traceability back to
  spec.md and issue #34.
- Two corrections surfaced during planning that the ADR (T003) and PR description (T052) must
  both carry, so a reviewer doesn't mistake either for an unreviewed deviation: the
  `Problem.type` → `Problem.status` error-mapping key change (research.md R4), and a third
  raw-`Problem`-rendering call site (`variation-card.tsx`, T035) the original issue's file list
  didn't name.
- Avoid: translating `FORMAT_LABEL`'s format identifiers (T028's explicit decision),
  translating `siteProfile.audience.segment` (T038's explicit decision — free-form backend
  text, not this app's copy), or leaving `strategy-meta.ts`'s English fields orphaned next to
  their catalog replacements (T050).
