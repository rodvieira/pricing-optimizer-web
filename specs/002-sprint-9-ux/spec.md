# Feature Specification: Sprint 9 UX polish — motion, accessibility, e2e coverage

**Feature Branch**: `002-sprint-9-ux`

**Created**: 2026-07-16

**Status**: Draft

**Input**: User description: "Sprint 9 UX polish: motion transitions respecting
prefers-reduced-motion, an e2e Playwright + axe-core accessibility suite covering the
landing page and Studio flow (happy path, invalid URL, backend error, export dialog),
and fixing the real color-contrast violations that suite found"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Content animates in without jarring pops, and never against a user's motion preference (Priority: P2)

Variation cards, the audience summary bar, and a completed variation's tier list fade/
slide in smoothly instead of popping in instantly, matching the generated design's
intent — but a user with `prefers-reduced-motion` enabled sees none of it.

**Why this priority**: Polish on top of an already-functional Sprint 8 flow — valuable,
not blocking.

**Independent Test**: Submit a URL in the Studio and watch the three cards and audience
bar animate in; then enable `prefers-reduced-motion` at the OS/browser level and repeat —
confirm no motion plays.

**Acceptance Scenarios**:

1. **Given** the Studio has just started streaming, **When** the audience bar and the
   three variation cards first render, **Then** each fades/slides in with a short,
   staggered transition.
2. **Given** the OS/browser has `prefers-reduced-motion: reduce` set, **When** the same
   flow runs, **Then** no animation plays — content simply appears.

---

### User Story 2 - An automated suite proves the Studio flow and accessibility, without a live backend (Priority: P1)

A Playwright e2e suite drives the landing page and the full Studio flow (empty state,
invalid URL, a mocked happy-path generation, a mocked backend failure, the export
dialog) and runs axe-core on the pages that don't require a live SSE stream, so
regressions are caught by `pnpm test:e2e` instead of only manual browser verification.

**Why this priority**: The Studio's User Story 1 (analyze → stream → complete) so far had
only manual browser verification (session-only) and unit tests — no repeatable
end-to-end coverage exists. This is the highest-value gap to close.

**Independent Test**: Run `pnpm test:e2e` with no backend running — every test passes
using route-intercepted mocks for `/v1/analyze`, `/v1/generate`, and `/v1/export/{id}`.

**Acceptance Scenarios**:

1. **Given** no backend is running, **When** the e2e suite runs, **Then** the landing
   page, the Studio empty state, invalid-URL blocking, a full mocked happy-path stream to
   completion, a mocked backend failure, and the export dialog's tab behavior all pass.
2. **Given** axe-core runs against the landing page and the Studio empty state, **When**
   results are inspected, **Then** there are zero `serious`/`critical` violations.

---

### Edge Cases

- What happens when a `serious` accessibility violation is real (not a test bug)? It
  must be fixed in the actual UI, not suppressed in the test — see the color-contrast
  fixes this feature includes as the concrete precedent.
- What happens to a user who has an animation in progress and navigates away? Not
  addressed here — Framer/Motion's own unmount handling covers it; no product-specific
  guard needed for the current transition set (opacity/translate only, no persistent
  timers).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST wrap its content in `MotionConfig` with
  `reducedMotion="user"` so every animation automatically respects
  `prefers-reduced-motion` without per-component logic.
- **FR-002**: Variation cards, the audience summary bar, and a completed variation's
  tier list MUST animate in with a short (≤0.3s) fade/slide transition.
- **FR-003**: A Playwright e2e suite MUST cover: landing page render + a11y, Studio empty
  state + a11y, invalid-URL client-side blocking (no network call), a mocked happy-path
  analyze→generate→complete flow, a mocked backend failure banner, and the export
  dialog's format-tab behavior — all without requiring a live `pricing-optimizer-api`.
- **FR-004**: Every `serious`/`critical` axe-core violation found MUST be fixed in the
  actual UI (not the test), with the fix traceable to the specific low-contrast token
  usage that caused it.

### Key Entities

None — this feature adds no new domain types; it's UI polish and test infrastructure
over the existing Studio/landing feature (see `specs/001-implement-claude-generated/`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `pnpm test:e2e` passes with zero backend dependency.
- **SC-002**: Zero `serious`/`critical` axe-core violations on the landing page and the
  Studio empty state.
- **SC-003**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all still pass.

## Assumptions

- Full Lighthouse scoring (HANDOFF.md Sprint 9's "≥95" target) is not run as part of this
  feature — no CI/tooling for it exists yet in this repo, and Astryx's own
  runtime-style-injection notice (a real, but non-blocking, performance suggestion logged
  to the console) would need its `theme-neutral/built` export, which isn't present in the
  currently installed package version (0.1.6) — noted for a future pass, not chased here.
- E2e coverage of the *live* SSE stream against a real backend is out of scope (matches
  `specs/001-implement-claude-generated/spec.md`'s same assumption) — the mocked
  route-interception approach proves the frontend's own logic, not the real contract.
