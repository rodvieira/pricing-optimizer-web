# Feature Specification: PT-BR localization with a language selector

**Feature Branch**: `004-pt-br-localization`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Add PT-BR localization with a language selector in the app
header, per GitHub issue #34." Full issue body is reproduced in this feature's PR/issue
history; the durable decisions this spec makes are captured below.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch the app's display language (Priority: P1)

A visitor opens the app (in English, the default) and wants to read it in Brazilian
Portuguese instead. They find a language control in the app header, next to the
light/dark toggle, select Portuguese, and every piece of application chrome — navigation,
buttons, labels, empty states, error messages, validation messages — immediately switches
to Portuguese. Their choice is remembered on their next visit, on this device.

**Why this priority**: This is the entire feature as scoped by the user who requested it:
a select control, defaulting to English, that switches the UI and persists the choice.
Everything else in this spec (string coverage, number formatting) is only valuable because
this control exists.

**Independent Test**: Load the app fresh (no stored preference) — it renders in English.
Select Portuguese from the header control — visible text throughout the current page
switches to Portuguese without a full page reload. Reload the page — it still renders in
Portuguese. Clear the stored preference (or use a fresh browser profile) — it renders in
English again.

**Acceptance Scenarios**:

1. **Given** a visitor with no stored language preference, **When** they load any page,
   **Then** the app renders in English and the language control shows English as selected.
2. **Given** a visitor on any page, **When** they select Portuguese from the language
   control, **Then** all translated UI text on the current page updates to Portuguese and
   the choice is persisted for future visits.
3. **Given** a visitor who previously selected Portuguese, **When** they reload the page or
   return later, **Then** the app renders in Portuguese without them having to reselect it.
4. **Given** a visitor who selected Portuguese, **When** they select English again,
   **Then** the app switches back and the stored preference updates to English.

---

### User Story 2 - No hardcoded English string leaks through in either language (Priority: P2)

A Portuguese-reading visitor uses the full product flow — landing page, pasting a URL,
watching the three strategies stream in, viewing an error, exporting a variation, opening
their history — and never hits a stray English sentence sitting in the middle of otherwise
Portuguese UI. This includes copy that is easy to miss because it is not part of the main
visible layout: validation errors, empty states, slow-generation messaging, export format
labels, and page titles.

**Why this priority**: A language switch that only translates half the app (a page title
that stays "Pricing Optimizer" while `Overview`/`Studio` become Portuguese, or a Zod
validation error that stays in English) reads as broken, not partially done, and actively
undermines trust in the whole feature. This is the bulk of the implementation effort, but
it's what makes User Story 1's mechanism actually deliver its promised value.

**Independent Test**: With Portuguese selected, walk both routes end to end (submit an
invalid URL, submit a valid one, let all three strategies complete, open the export
dialog in each format, trigger a network failure) and confirm no English string appears
anywhere except the LLM-generated pricing-page content itself (explicitly out of scope,
see Assumptions).

**Acceptance Scenarios**:

1. **Given** Portuguese is selected, **When** a visitor views the landing page, **Then**
   the hero copy, nav labels, and the three strategy names/blurbs render in Portuguese.
2. **Given** Portuguese is selected, **When** a visitor submits an invalid URL, **Then**
   the validation message renders in Portuguese.
3. **Given** Portuguese is selected, **When** a generation is slow or a network request
   fails, **Then** the status/error copy renders in Portuguese, not the raw backend
   `Problem` string.
4. **Given** Portuguese is selected, **When** a visitor opens the export dialog, **Then**
   the dialog title and error copy render in Portuguese (the format tab labels — JSX,
   HTML, Stripe JSON — are technical identifiers and stay as-is in both languages, the
   same way a file extension isn't translated), while the exported code itself
   (JSX/HTML/Stripe config) is unaffected.
5. **Given** Portuguese is selected, **When** a visitor views the browser tab, **Then**
   the page title still reads "Pricing Optimizer" (the brand name, not translated in
   either language) — page metadata is explicitly out of scope for this feature (see
   Assumptions).

---

### User Story 3 - Prices and numbers read naturally in each language (Priority: P3)

A Portuguese-reading visitor viewing a generated pricing tier sees the price formatted the
way a Brazilian reader expects (comma as the decimal separator, period as the thousands
separator, e.g. `R$ 1.234,56`), not the raw English convention with the currency symbol
and decimal point unchanged.

**Why this priority**: Lower priority than Stories 1-2 because it affects only the numeric
tokens inside otherwise-translated UI, and the app's actual price values already render
correctly for an English reader today — this story only adds the Portuguese convention. It
still matters because a portfolio piece that translates every label but leaves "$49.00"
unformatted for a pt-BR reader reads as incomplete localization, not real localization.

**Independent Test**: With Portuguese selected, view a completed generation's pricing
tiers and the export dialog's Stripe config preview; confirm every rendered price uses
pt-BR grouping/decimal conventions while the underlying value (and the Stripe config
export itself, which is API-facing, not UI copy) is unchanged.

**Acceptance Scenarios**:

1. **Given** Portuguese is selected, **When** a visitor views a pricing tier's price,
   **Then** it renders using pt-BR number formatting conventions for the tier's currency.
2. **Given** English is selected, **When** a visitor views the same price, **Then** it
   renders using the existing English formatting, unchanged from current behavior.

---

### Edge Cases

- A visitor's browser has no stored preference and Portuguese-language settings — the app
  still defaults to English (this spec deliberately does not negotiate from
  `Accept-Language`; see Assumptions).
- A generation is actively streaming when the visitor switches language mid-stream — the
  strategy labels/blurbs and static chrome switch immediately; the LLM-generated pricing
  copy inside the streaming variation does not (it is not translated content, see
  Assumptions), and switching language must not interrupt or restart the stream.
- A visitor has a completed generation loaded from local history (not a live stream) when
  they switch language — the chrome around it (labels, buttons) switches; the historical
  generation's own content does not, consistent with the live-stream case.
- The stored language value in `localStorage` is corrupted or holds an unrecognized value
  (e.g. a leftover value from a future third locale that no longer exists) — the app falls
  back to English rather than crashing or rendering a blank UI.
- A backend error response has a status code this app's error-copy mapping does not
  recognize — the visitor still sees a Portuguese-language generic error, not a raw
  English fallback string and not a blank message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app header MUST offer a language control, alongside the existing theme
  toggle, that is a real accessible control (keyboard-operable, labeled, exposed to
  assistive technology) rather than an unlabeled native `<select>` styled to look like
  something else.
- **FR-002**: The language control MUST offer exactly two options: English and Portuguese
  (Brazil). English MUST be the state shown when no preference has ever been stored.
- **FR-003**: Selecting a language MUST update all translated UI text on the current page
  without a full page navigation/reload.
- **FR-004**: The selected language MUST persist in `localStorage`, following the same
  single-owner pattern the existing theme preference uses (one place owns the current
  locale; no second, unsynchronized source of truth for it).
- **FR-005**: On load, if a valid stored language preference exists, the app MUST render in
  that language. If no preference is stored, or the stored value is not one of the two
  supported languages, the app MUST default to English. (This spec does not negotiate an
  initial language from the browser's `Accept-Language` header — see Assumptions.)
- **FR-006**: Every user-facing string in `app/`, `views/`, `features/`, `entities/`, and
  `shared/ui/` MUST be sourced from a locale catalog, not hardcoded in component source,
  including: navigation labels, the strategy display metadata (labels and blurbs) in
  `entities/strategy`, status/empty-state copy in `features/generate-stream` and
  `features/history`, export dialog copy and format labels in `features/export`, URL
  validation messages in `features/url-input`. Page `metadata` (title/description) in
  `app/` is explicitly OUT of scope — it is read by a Server Component before any client
  JS runs, and this feature has no server-visible locale signal by design (see
  Assumptions); found and corrected during implementation, not planned from the start.
- **FR-007**: When the backend returns an RFC 7807 error (`title`/`detail` in English),
  the app MUST present a translated error message mapped from the response's HTTP status
  code rather than displaying the raw backend string, with a generic translated fallback
  message for any status not explicitly mapped. (The response's optional `type` field is
  not a reliable discriminant — confirmed by reading the backend, it is never populated
  today — so this spec keys on `status`, which every error response does carry.)
- **FR-008**: Prices and other locale-sensitive numbers rendered in the UI MUST format
  using the selected language's number/currency conventions.
- **FR-009**: The LLM-generated pricing-page content (headline, feature copy, and other
  text produced by `POST /v1/generate`) MUST remain English regardless of the selected UI
  language — this spec covers application chrome only, not generated content.
- **FR-010**: Switching language MUST NOT interrupt, restart, or otherwise affect an
  in-progress SSE generation stream.
- **FR-011**: Any English-string constant module fully superseded by this feature's locale
  catalogs (for example, the current hardcoded labels/blurbs in
  `entities/strategy/strategy-meta.ts`) MUST be removed, not left in the codebase
  unreferenced alongside its replacement.

### Key Entities

- **Locale preference**: The visitor's selected UI language (English or Portuguese,
  Brazil), persisted per-browser in `localStorage`. Binary, like the existing theme
  preference — no third "system/negotiated" state.
- **Locale catalog**: The complete set of translated strings for one language, covering
  every user-facing string enumerated in FR-006, keyed consistently between the English
  and Portuguese catalogs so no key exists in one and not the other.
- **Error message mapping**: A translated, per-language message for each distinct error
  status this app's error UI distinguishes, plus one generic fallback per language.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can switch the entire application's display language in one
  interaction, with no page reload, in under 1 second of perceived delay.
- **SC-002**: 100% of application-chrome strings (navigation, forms, statuses, errors,
  empty states, export dialog) render in the selected language — zero hardcoded English
  strings remain reachable when Portuguese is selected, excluding LLM-generated pricing
  content, technical format identifiers, and page metadata by design (see Assumptions).
- **SC-003**: A returning visitor's language choice is honored on 100% of subsequent visits
  from the same browser until they change it again.
- **SC-004**: Prices render with correct locale-appropriate grouping/decimal conventions in
  both supported languages, with no change to the underlying numeric value or to any
  API-facing export (JSX/HTML/Stripe config).

## Assumptions

- **No `Accept-Language` negotiation.** The original feature request considered
  negotiating an unset preference from the browser's language settings; the person who
  requested this feature simplified that away explicitly — an unset preference always
  defaults to English, matching the existing theme preference's "explicit choice only,
  otherwise a fixed default" shape (the theme preference's own OS-following behavior is a
  narrower exception specific to `prefers-color-scheme`, not a precedent this spec follows).
- **No URL-based routing.** Locale is a piece of client-side UI state (selector +
  `localStorage`), not a routing concern — no `/en/`, `/pt-br/` URL segments, no
  middleware-based locale detection, no change to any existing route or internal `<Link>`.
  This keeps the change concentrated in the UI layer and converges to a single pull
  request, as requested, rather than the multi-file routing sweep the URL-prefixed
  alternative would have required.
- **LLM-generated pricing content stays English.** `POST /v1/generate` has no
  `locale`/`language` parameter in `openapi.yaml`; generating Portuguese pricing copy
  would require a contract change, a backend prompt change, and regeneration on both
  sides. That is explicitly a separate, future feature.
- **Two languages only, for now.** English and Portuguese (Brazil). The locale catalog
  structure should not make adding a third language structurally difficult, but no third
  language is in scope.
- **Page metadata (`app/layout.tsx`'s title/description) stays static English, out of
  scope.** A direct consequence of "no URL-based routing" above: `export const metadata`
  is read by a Server Component before any client JS runs, and this feature has no
  server-visible locale (no cookie, no URL segment) for it to read. Found during
  implementation, not planned from the start — see ADR-0019 for the full reasoning,
  including why a client-side `document.title` workaround wouldn't have been meaningful
  either (the title is the brand name, already identical in both languages).
- **Backend error responses' HTTP status codes are a small, enumerable set** (400, 404,
  409, 422, 429, 500, 502, plus this app's own client-synthesized network-failure case),
  confirmed by reading every error response site in the backend, so a translated mapping
  keyed on status is feasible without any backend change.
