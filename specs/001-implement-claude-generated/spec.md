# Feature Specification: Studio & Landing — implement the generated design

**Feature Branch**: `001-implement-claude-generated`

**Created**: 2026-07-16

**Status**: Draft

**Input**: User description: "Implement the claude.ai-generated Studio and landing page
design: real URL analysis, live SSE-streamed pricing variations across three psychological
strategies, hover comparison, and an export modal for JSX/HTML/Stripe formats"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Analyze a product URL and watch three pricing strategies stream in (Priority: P1)

A visitor pastes a product URL into the Studio, submits it, and watches the backend
classify the audience and then generate three distinct pricing-page variations
(anchor / freemium / value-based) live, each progressing independently from queued to
generating to complete.

**Why this priority**: This is the entire value proposition of the product — without it,
there is no demo to show a recruiter or hiring engineer.

**Independent Test**: Paste a real product URL, submit, and observe the audience summary
appear, then three cards populate with rationale text and pricing tiers without a page
reload, each reaching a "ready" state independently of the others' timing.

**Acceptance Scenarios**:

1. **Given** the Studio is empty, **When** a user submits a valid URL, **Then** the system
   calls `POST /v1/analyze`, displays the detected audience segment/sophistication, and
   immediately starts `POST /v1/generate`, showing all three strategy cards as "queued".
2. **Given** generation is streaming, **When** a `token` event arrives for a given strategy,
   **Then** only that strategy's card updates its rationale text — the other two cards are
   unaffected.
3. **Given** all three strategies reach `variation_completed`, **When** the stream emits
   `done`, **Then** every card shows its final pricing tiers and a "ready" indicator, and the
   Export/Edit-inline buttons on each card become enabled.

---

### User Story 2 - Compare strategies by hovering equivalent tiers (Priority: P2)

Once results are showing, a user hovers a pricing tier in one variation and sees the tier
at the same position highlighted in the other two variations, making the pricing-strategy
contrast visually obvious.

**Why this priority**: Reinforces the product's core insight (three different psychological
framings of comparable tiers) but isn't required for the primary generation flow to work.

**Independent Test**: With three completed variations showing, hover a tier row in any card
and confirm the tier at the same ordinal position in the other two cards is visually
highlighted; moving the mouse away from the grid clears all highlights.

**Acceptance Scenarios**:

1. **Given** three completed variations, **When** a user hovers tier index N in card A,
   **Then** tier index N in cards B and C are highlighted (an ordinal-position match, not a
   semantic one — tier counts can differ across strategies).
2. **Given** a tier is highlighted, **When** the pointer leaves the results grid, **Then** no
   tier remains highlighted.

---

### User Story 3 - Export a completed variation as JSX, HTML, or Stripe config (Priority: P2)

Once a variation is complete, a user opens its export modal, switches between JSX/HTML/
Stripe-JSON tabs, reads syntax-highlighted code, and copies it to the clipboard.

**Why this priority**: The concrete "take it with you" deliverable of the product, but only
reachable after a variation has already completed (depends on User Story 1).

**Independent Test**: With a completed variation, click Export, switch all three format
tabs and confirm each renders distinct, correctly-formatted content, then click Copy and
confirm the clipboard receives the currently visible tab's content.

**Acceptance Scenarios**:

1. **Given** a completed variation, **When** the user clicks "Export", **Then** a dialog
   opens calling `POST /v1/export/{id}` for the default format (JSX) and rendering the
   result in a syntax-highlighted code block.
2. **Given** the export dialog is open, **When** the user switches to the HTML or Stripe
   JSON tab, **Then** the corresponding format is fetched/rendered without closing the
   dialog.
3. **Given** the export dialog is open, **When** the user clicks "Copy code", **Then** the
   currently displayed code is copied and the button confirms the copy succeeded.

---

### User Story 4 - See a specific, actionable state for every failure/empty/slow case (Priority: P1)

A user sees a distinct visual state for: the Studio with nothing submitted yet, an invalid
URL, the backend being unreachable or erroring, and a single strategy taking unusually long
to generate — never a generic spinner or blank screen.

**Why this priority**: Directly requested and just as load-bearing for the "looks like a
real product, not a bootcamp project" goal as the happy path — P1 alongside User Story 1.

**Independent Test**: Trigger each condition (empty Studio, malformed URL, backend down,
one strategy artificially delayed) and confirm each renders its own distinct UI, not a
shared fallback.

**Acceptance Scenarios**:

1. **Given** the Studio has never been submitted to, **When** the page loads, **Then** an
   empty-state placeholder is shown instead of a blank results area.
2. **Given** a user types a string that isn't a valid URL, **When** they submit, **Then**
   inline validation blocks the request and shows a specific message — no request is sent.
3. **Given** `POST /v1/analyze` or the `/v1/generate` stream fails, **When** the failure
   surfaces, **Then** a dedicated error state renders the real `Problem.title`/`detail` and
   offers a retry action.
4. **Given** one strategy's stream has been in `"streaming"` for an extended period without
   completing, **When** that threshold passes, **Then** that card (only) shows a
   "taking longer than usual" indicator without blocking the other two cards.

---

### Edge Cases

- What happens when the backend returns `409 Conflict` on `/v1/generate` (an identical
  in-flight generation already exists, per the idempotency contract)? The stream-level error
  state should surface this distinctly from a generic 500, since it's not actually a failure.
- What happens when the user navigates away from `/studio` mid-stream? The in-flight fetch
  reader must be aborted (no dangling network activity, no state updates after unmount).
- What happens when a strategy's `PricingTier` list has a different length than another
  strategy's (e.g. freemium's 4 tiers vs. anchor's 3)? Hover-highlighting only aligns by
  ordinal position — a tier with no positional counterpart in a shorter list simply has
  nothing to highlight in that card.
- What happens when `Price.customLabel` is set (e.g. "Contact us")? The rendered price
  shows the custom label instead of a formatted currency amount.
- What happens when the export dialog is open and the user hasn't switched tabs — is the
  HTML/Stripe content fetched eagerly or only on first view? Only on first view of each tab,
  to avoid three export calls when the user only wants one format.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Studio MUST accept a pasted URL, validate it client-side before
  submission, and call `POST /v1/analyze` on submit.
- **FR-002**: On a successful analyze response, the Studio MUST display the returned
  audience segment and sophistication, then immediately call `POST /v1/generate` with the
  resulting `SiteProfile`.
- **FR-003**: The Studio MUST consume the `/v1/generate` SSE stream via a `fetch()` +
  `ReadableStream` reader (not browser `EventSource`, which cannot send the required POST
  body) and demultiplex it into three independently-progressing strategy states using the
  existing `domain/stream.ts` `streamReducer`.
- **FR-004**: Each of the three strategy cards MUST independently render one of: queued
  (pending), generating (incremental rationale text + tier skeleton), complete (final
  tiers + enabled Export/Edit-inline actions), or errored.
- **FR-005**: The Studio MUST support hovering a pricing tier and highlighting the
  ordinally-equivalent tier in the other two variations; leaving the grid MUST clear all
  highlights.
- **FR-006**: A completed variation MUST expose an export action that opens a dialog calling
  `POST /v1/export/{id}` per format (jsx/html/stripe), rendering syntax-highlighted,
  copyable code per tab.
- **FR-007**: The system MUST render a distinct UI for each of: empty/idle Studio, inline
  URL-validation error, analyze/generate request failure (showing the real backend
  `Problem`), and a single strategy exceeding a "taking too long" threshold.
- **FR-008**: The landing page MUST present the product's value proposition, a CTA into the
  Studio, and an illustrative (non-live) preview of the three-strategy output, without
  making any backend calls itself.
- **FR-009**: The app MUST support light/dark theme via the existing Astryx `<Theme>`
  provider on both the landing page and the Studio, with no second theme-mode owner
  introduced.

### Key Entities

- **SiteProfile**: the scraped/classified product page (URL, value proposition, industry,
  audience) returned by analyze and consumed by generate. Already defined in
  `domain/site-profile.ts`.
- **StreamEvent / GenerateStreamState**: the domain-level demultiplexed view of the SSE
  stream, one state per `PricingStrategy`. Already defined in `domain/stream.ts`; this
  feature is the first real consumer.
- **Variation**: one completed strategy's headline, tiers, and rationale. Already defined in
  `domain/variation.ts`.
- **ExportResult**: the generated JSX/HTML/Stripe-JSON text for a given variation and
  format. Already defined in `domain/export.ts`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from pasting a URL to seeing all three completed pricing
  variations with zero page reloads and zero full-page loading spinners (each card
  progresses independently and visibly).
- **SC-002**: Every one of the four states in User Story 4 (empty, invalid URL, backend
  error, slow strategy) renders a visually distinct treatment, verifiable by inspection
  without reading code.
- **SC-003**: Exporting any completed variation in any of the three formats succeeds and
  the copied clipboard content matches what's rendered on screen.
- **SC-004**: `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` all pass with zero
  errors on the final implementation.

## Assumptions

- The backend (`pricing-optimizer-api`) is run locally via `go run ./cmd/api` for manual
  end-to-end verification; this feature does not include deploying it. `NEXT_PUBLIC_API_URL`
  defaults to `http://localhost:8080` per the existing `lib/api/client.ts`.
- No authentication exists anywhere in this product yet (confirmed in the backend's own
  decision log, ADR-0010) — the Studio has no concept of "my generations", only the
  generation currently in progress in the browser tab.
- `features/history/` (a saved-generations list) is out of scope for this feature — it does
  not appear in the generated design and is not required by any user story above.
- Mobile/responsive stacking of the three-column results grid is required (the design
  prompt explicitly asked for it) but a dedicated mobile-only user story is not needed — it's
  a layout requirement of User Story 1, not a separate journey.
- "Edit inline" (mentioned in the generated design's card footer) has no defined behavior in
  either the design prompt or the mock beyond being present and disabled until a variation
  completes. Out of scope to implement actual inline editing in this feature; the button
  exists in a disabled/enabled state matching the mock but wiring real inline edit
  functionality is a follow-up (file a GitHub issue if this gap needs tracking before the
  PR is opened).
