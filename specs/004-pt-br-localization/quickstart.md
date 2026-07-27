# Validation Guide: PT-BR localization with a language selector

**Feature**: `004-pt-br-localization` | **Date**: 2026-07-27

How to prove this feature actually works. One PR, one merge — see
[data-model.md](./data-model.md) for the exact catalog/mapping shape and
[research.md](./research.md) for the decisions and their rationale.

## Prerequisites

```bash
cd pricing-optimizer-web
pnpm install
```

Docker not needed. A live backend is not needed for the language-switch behavior itself
(Playwright mocks the backend via `test/e2e/mock-backend.ts`), but the error-mapping
table in data-model.md section 3 was verified against the real
`pricing-optimizer-api` source, not a mock — re-check that repo directly if the backend's
error responses ever change shape.

## The gate this PR must pass

```bash
pnpm typecheck        # tsc --noEmit
pnpm lint             # biome check . (includes the layer-boundary rules)
pnpm test:coverage    # vitest run --coverage, 90% floor, fails below
pnpm build            # next build, the real production output
pnpm test:e2e         # playwright + axe-core
```

Then, per the constitution: `git diff main...HEAD` fed to `pr-reviewer` before pushing.

## Manual validation

### 1. Default language and the switch itself (User Story 1)

```bash
pnpm build && pnpm start
```

1. Open the app in a fresh browser profile (or clear `localStorage` first) — it renders
   in English; the language control shows English selected.
2. Select Portuguese from the header control. Visible text on the current page switches
   to Portuguese with no page reload/navigation (watch the URL bar — it must not change).
3. Reload the page — it still renders in Portuguese (persisted via `localStorage`, not a
   URL or cookie).
4. Open dev tools, inspect `localStorage`, confirm a `pricing-optimizer-locale` key holds
   `"pt-BR"`.
5. Switch back to English; confirm the stored value updates to `"en"` and the UI reverts.
6. **Accepted trade-off, confirm it's no worse than expected**: with Portuguese already
   stored, do a hard reload and watch closely for a one-frame flash of English before
   Portuguese appears (see research.md R2). This is expected, not a bug — confirm it is
   a brief content swap, not a broken/blank state, and not a full page reload.

### 2. No hardcoded English leaks through (User Story 2)

With Portuguese selected, walk the full flow and confirm no English string appears
anywhere except the LLM-generated pricing-page content itself:

1. Landing page: hero copy, nav labels (`Overview`/`Studio` equivalents), the three
   strategy names and blurbs in the product preview.
2. Studio: submit an empty/invalid URL — the validation message is in Portuguese.
3. Submit a valid URL and let all three variations complete — status/empty-state copy
   (including any slow-generation messaging, if the mocked backend can simulate it)
   renders in Portuguese; the generated pricing-page content (headline, feature bullets,
   tier names/taglines from the LLM) stays English by design (spec FR-009) — confirm this
   is the *only* English visible.
4. Open the export dialog for a completed variation: dialog title, the three format tab
   labels, and the copy-button label are in Portuguese; the exported code itself
   (JSX/HTML/Stripe config, all three formats) is unaffected — still real code, not
   translated.
5. Trigger each error case in data-model.md section 3's table that the mocked backend
   can simulate (`test/e2e/mock-backend.ts` — extend it if a case isn't mockable yet) and
   confirm the displayed message is the mapped Portuguese copy, never the raw English
   `title`/`detail` string.
6. Check the browser tab title — still "Pricing Optimizer" in both languages (the brand
   name; page metadata is explicitly out of scope, see spec.md's Assumptions and
   ADR-0019).

### 3. Numbers and prices (User Story 3)

With Portuguese selected:

1. View a completed generation's pricing tiers — prices use pt-BR grouping/decimal
   punctuation (comma decimal, period thousands separator).
2. Open the export dialog's Stripe config format — the exported JSON's numeric values are
   unaffected (API-facing data, not UI copy); only the on-screen tier prices change
   formatting, never the export payload.
3. Switch back to English and confirm the same prices render with English conventions,
   matching current (pre-feature) behavior exactly — this is a regression check, not just
   a new-behavior check.

### 4. Edge cases (from spec.md, all past-precedent-style checks — verify explicitly)

| Scenario | Expected |
|---|---|
| No stored preference, browser set to Portuguese-language OS/browser settings | Still renders English (no `Accept-Language` negotiation, per spec Assumptions) |
| Language switched mid-stream during an active generation | Chrome switches immediately; the streaming generation is not interrupted or restarted; the generated content itself stays English |
| A history entry (not a live stream) viewed after switching language | Chrome around it switches; the historical generation's own content does not |
| `localStorage`'s locale key holds a corrupted/unrecognized value (e.g. `"fr"`) | Falls back to English, not a crash or blank UI |
| A backend error status not in data-model.md's table | Shows the generic Portuguese fallback message, never a raw English string |

## Accessibility

`pnpm test:e2e`'s axe-core checks (`landing.spec.ts`, `studio.spec.ts`, and the new
`i18n.spec.ts`) must stay zero-violation with the language selector in place. Separately
confirm by hand: the selector is reachable and operable via keyboard alone (Tab to focus,
Enter/Space to open, arrow keys to move between options, Enter to select), and has an
accessible name a screen reader would announce (not just a flag emoji or unlabeled
control).

## Done when

- Every acceptance scenario in `spec.md` passes as described above.
- The full gate is green.
- An ADR exists in `../docs/decisions/` covering the library choice (next-intl,
  client-only mode) and the status-based error mapping correction.
- `entities/strategy/strategy-meta.ts`'s English `label`/`blurb` fields are gone, not
  left alongside their catalog-key replacements (spec FR-011).
- `pr-reviewer` run against the diff, blocking findings fixed, before the PR opens.
