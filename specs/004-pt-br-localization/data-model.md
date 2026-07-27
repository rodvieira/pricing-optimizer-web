# Phase 1 Data Model: PT-BR localization with a language selector

**Feature**: `004-pt-br-localization` | **Date**: 2026-07-27

This feature introduces no backend entity or wire-format change. The "data" that governs
it is the locale state, the message catalogs, and the error-status mapping below —
verified against real call sites, not assumed.

---

## 1. Locale preference

| Field | Type | Notes |
|---|---|---|
| `locale` | `"en" \| "pt-BR"` | Binary, mirrors `ThemeMode`'s `"light" \| "dark"` shape exactly — no third state. |

Owned by a new `LocaleProvider` (`shared/i18n/components/locale-provider/`), following
`ThemeModeProvider`'s exact pattern:

- Initial React state: `"en"` (spec FR-002/FR-005 — English is the default whenever no
  valid stored preference exists, no `Accept-Language` negotiation per spec Assumptions).
- On mount, a `useEffect` reads `localStorage`'s `pricing-optimizer-locale` key; if it is
  exactly `"en"` or `"pt-BR"`, state updates to that value. Any other value (unset,
  corrupted, a stale value from a locale this app no longer supports) is ignored and the
  `"en"` default stands — this is the spec's corrupted-storage edge case.
- Selecting a language via the new selector updates state and writes
  `localStorage.setItem("pricing-optimizer-locale", locale)` synchronously, the same
  shape `ThemeModeProvider.setMode` already uses for
  `pricing-optimizer-theme-mode`.
- No pre-hydration script equivalent to `theme-init-script.ts`: `data-theme`/
  `color-scheme` are CSS-visible attributes a synchronous `<script>` can set before
  paint; translated text content requires React to actually render with the right
  `messages`, which cannot happen before hydration. This is `research.md` R2's accepted
  trade-off (a one-render flash of English for a returning pt-BR visitor), not an
  oversight.

## 2. Message catalog

Two JSON files, `shared/i18n/messages/en.json` and `shared/i18n/messages/pt-BR.json`,
loaded statically (`import enMessages from "./messages/en.json"`, no runtime fetch —
this app has exactly two locales, dynamic loading would be premature). Both files MUST
share identical key structure; a build-time or test-time check (see tasks.md) fails if
one catalog has a key the other lacks.

Namespaced by the area of the app each string belongs to, matching spec FR-006's sweep
list and real files checked against the current codebase:

| Namespace | Real source (today, hardcoded) | Example keys |
|---|---|---|
| `nav` | `shared/ui/app-header/app-header.tsx`'s `NAV_ITEMS` | `nav.overview`, `nav.studio` |
| `strategy` | `entities/strategy/strategy-meta.ts`'s `STRATEGY_META` | `strategy.anchor.label`, `strategy.anchor.blurb` (×3 strategies) |
| `generateStream` | `features/generate-stream/` status/empty-state copy, incl. slow-generation messaging | `generateStream.pending`, `generateStream.slow` |
| `history` | `features/history/components/history-panel/` | `history.empty`, `history.title` |
| `export` | `features/export/components/export-dialog/` dialog copy + `FORMAT_LANGUAGE` labels | `export.title`, `export.format.jsx` |
| `urlInput` | `features/url-input/url-input-schema.ts` Zod messages | `urlInput.required`, `urlInput.invalid` |
| `errors` | New — status-keyed error copy, see section 3 | `errors.status400`, `errors.generic` |
| `studio` | `views/studio/` empty state, audience summary bar | `studio.emptyTitle`, `studio.emptyBody` |
| `landing` | `views/landing/` hero, product preview (the static `PREVIEW_CARDS` price/label strings — FR-006 covers "every user-facing string," and leaving this one page's copy English while everything else translates would be the exact half-translated failure mode User Story 2 names) | `landing.hero.title`, `landing.preview.anchor.price` |

**`urlInputSchema`'s validation messages become translation keys, not display strings.**
The schema is a module-level constant (defined once, not per-render, and not
locale-aware itself); rather than turning it into a per-locale factory, its `min()`/
`refine()` messages become stable keys (e.g. `"urlInput.required"`,
`"urlInput.invalid"`) that `url-input-form.tsx` resolves through `useTranslations()`
when rendering `formState.errors`, instead of rendering `error.message` directly. This
keeps the schema itself framework/locale-agnostic (consistent with `shared/domain/`'s
purity rule elsewhere in this repo) while still surfacing translated copy.

**`entities/strategy/strategy-meta.ts`'s `label`/`blurb` fields are removed**, per spec
FR-011 — `STRATEGY_META` keeps `strategy` and `variant` (the color-mapping key, unrelated
to language) but no longer carries English text directly; callers resolve
`strategy.{strategy}.label`/`.blurb` through `useTranslations()` instead. Confirmed via
grep that both current consumers (`views/landing/components/strategy-trio/`,
`features/generate-stream/components/variation-card/`) already sit in Client Components,
so adding a translation-hook call at each call site is a mechanical change, not a new
Server/Client boundary.

## 3. Error message mapping (corrected from the source issue's assumption)

The source issue assumed the backend's RFC 7807 `Problem.type` field was a stable,
populated discriminant. Checked directly against `pricing-optimizer-api`'s
`internal/adapter/httpapi/response.go` and every `writeProblem(...)` call site
(`analyze.go`, `generate.go`, `export.go`, `get_generation.go`, `idempotency.go`,
`ratelimit.go`): **`type` is never set**. `status` is the only field every call site
populates. See `research.md` R4 for the full correction and the status table.

| Key | Status | Category |
|---|---|---|
| `errors.status400` | 400 | Malformed request body |
| `errors.status404` | 404 | Generation or variation not found |
| `errors.status409` | 409 | Generation already in progress (idempotency conflict) |
| `errors.status422` | 422 | Invalid analyze/generate request (validation failure) |
| `errors.status429` | 429 | Rate limit exceeded |
| `errors.status500` | 500 | Generic server error |
| `errors.status502` | 502 | Could not fetch or parse the target site |
| `errors.network` | 0 (client-synthesized, see `networkFailureProblem`) | Backend unreachable |
| `errors.generic` | (fallback) | Any status not in this table |

A single exported function (exact home TBD in tasks.md — alongside `shared/api/`'s
existing `Problem` handling, e.g. a new `shared/api/problem-message.ts`) takes a
`Problem` and returns the matching translation key; `studio-page.tsx`'s two `Alert`
call sites (`analyze.error.problem.title` / `generateStream.state.problem?.title`,
currently rendering the raw backend string) resolve that key through
`useTranslations()` instead. `detail` (developer-oriented, e.g. a raw validation error
string) is not shown to the end user in translated form — only the mapped `title`
replacement is; `detail` was already only shown as `Alert`'s secondary `description`
line and stays out of scope for translation (it is arbitrary backend text, not a
finite set of known messages).

## 4. Deletion (per spec FR-011)

| Artifact | Reason |
|---|---|
| `entities/strategy/strategy-meta.ts`'s `label`/`blurb` fields | Superseded by `strategy.*` message-catalog keys (section 2) |
| `shared/ui/app-header/app-header.tsx`'s inline `NAV_ITEMS` label strings | Superseded by `nav.*` keys (labels only — `href` values are routing, not copy, and stay) |

Nothing else in this feature deletes an existing module outright — everything else moves
a string literal into a catalog key at its existing call site.

## 5. Invariants (assert in tests, per constitution Principle IV)

1. `en.json` and `pt-BR.json` have identical key sets (no key present in one and missing
   from the other).
2. `LocaleProvider` defaults to `"en"` with no stored preference, and to `"en"` for any
   stored value other than exactly `"en"` or `"pt-BR"`.
3. Selecting a language updates `localStorage` synchronously and re-renders visible text
   without a full page navigation.
4. Every status in the table in section 3 resolves to its mapped key; every other status
   resolves to `errors.generic` — never to a raw, untranslated backend string.
5. Price formatting for a given `currency` produces locale-correct grouping/decimal
   punctuation for both `"en"` and `"pt-BR"` (e.g. `1234.56` in `"USD"` renders
   `$1,234.56` for `en` and `US$ 1.234,56` for `pt-BR`; the point is the
   grouping/decimal punctuation flips, not a specific currency symbol).
6. Switching language does not abort, restart, or otherwise affect an in-progress SSE
   generation stream (spec FR-010) — the stream's own `AbortController` lifecycle is
   untouched by a `LocaleProvider` state change elsewhere in the tree.
