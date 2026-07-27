# Phase 0 Research: PT-BR localization with a language selector

**Feature**: `004-pt-br-localization` | **Date**: 2026-07-27

## R1: i18n library choice

**Decision**: `next-intl@^4.13`.

**Confirmed compatible** via the npm registry before choosing it (not assumed): the
published `peerDependencies` for `next-intl@4.13.4` are `next: "^12.0.0 || ^13.0.0 ||
^14.0.0 || ^15.0.0 || ^16.0.0"` and `react: "^16.8.0 || ^17.0.0 || ^18.0.0 ||
>=19.0.0-rc <19.0.0 || ^19.0.0"` — this repo runs Next.js 16.2.11 and React 19.2.4,
both inside range with no version pressure.

**Rationale**: Built specifically for the Next.js App Router (this repo's router),
provides ICU MessageFormat catalogs (pluralization, interpolation) and locale-aware
number/date formatting via `useFormatter` (a thin wrapper over native
`Intl.NumberFormat`/`Intl.DateTimeFormat`) rather than requiring a second formatting
library. Actively maintained, no version-pressure risk against this repo's stack.

**Alternatives considered**:

- *`react-i18next`.* Larger surface area (i18next core + React bindings), designed
  client-first with a weaker App Router story — no first-class Server Component
  integration, which this repo's `app/layout.tsx` metadata generation would need to work
  around. Rejected: more machinery than this feature's scope needs.
- *A hand-rolled `Record<string, string>` + React Context.* Zero new dependency, and
  would fit this feature's simplified scope (no routing, no server-resolved locale)
  almost as well as `next-intl`'s client-only mode does — but it means hand-rolling
  interpolation and, more importantly, number/currency formatting per locale from
  scratch, exactly the class of bug this repo's own SSE parser history warns against
  reinventing (see `CLAUDE.md`'s SSE section for the general lesson: hand-rolled
  parsing/formatting logic is where subtle bugs live). `next-intl`'s `useFormatter` gets
  pt-BR's `R$ 1.234,56` grouping/decimal convention correct via `Intl.NumberFormat`
  under the hood; a hand-rolled formatter would need to reimplement that. Rejected in
  favor of a well-audited library for a problem (locale-correct number formatting) this
  repo doesn't need to solve itself.

## R2: Routing and persistence strategy

**Decision**: No URL-based routing, no cookie, no `Accept-Language` negotiation.
`next-intl` mounted in **client-only mode**: a `LocaleProvider` client component (in
`shared/i18n/components/locale-provider/`) owns `locale` React state, defaulting to
`"en"`, wrapping `NextIntlClientProvider` with that `locale` and the matching imported
message catalog. On mount, a `useEffect` reads `localStorage`'s
`pricing-optimizer-locale` key and corrects `locale` if a valid stored value exists —
exactly the shape `ThemeModeProvider` already uses for `mode`/`pricing-optimizer-theme-mode`.

**This was resolved directly with the feature requester**, not left to the routing
trade-off `next-intl`'s own docs discuss (URL-prefixed locales vs. a cookie next-intl
can read server-side via `getRequestConfig`) — they explicitly asked for a plain select
control, English default, `localStorage`-only persistence, no `Accept-Language`
negotiation. Confirmed via `next-intl`'s own documentation that client-only,
non-routing usage (supplying `locale`/`messages` to `NextIntlClientProvider` from
application logic rather than from URL segments or middleware) is an officially
supported mode, not an unsupported workaround.

**Accepted trade-off, documented rather than silently absorbed**: because the initial
server-rendered HTML has no way to know a browser's `localStorage` value (unlike
`data-theme`/`color-scheme`, which the existing pre-hydration `<script>` in
`app/layout.tsx`'s `<head>` sets synchronously before paint), a returning visitor who
previously chose Portuguese will see the page render in English for one client render,
then switch to Portuguese once `LocaleProvider`'s mount effect reads `localStorage`.
This is a brief content swap, not a full reload, and is analogous to (but slightly more
visible than) the "resolved theme" flash class of bug this repo has fixed before for
CSS attributes — text content cannot be set via a synchronous script the same way a
`data-*` attribute can. Given the feature requester explicitly prioritized simplicity
(no cookie, no server-side locale resolution) over eliminating this flash, this is
accepted as-is rather than reintroducing the cookie/server-visibility machinery that
would remove it. Worth revisiting if user feedback flags it as a real problem.

**Caught during implementation**: the first implementation read `localStorage` as a
*lazy initializer* (the same pattern `ThemeModeProvider` uses for
`data-theme`/`color-scheme`), not as a post-mount effect as designed above. That is safe
for an attribute on an element carrying `suppressHydrationWarning`, but not for
translated *text content* deep in the tree — a stored `"pt-BR"` preference made the very
first client render disagree with the server-rendered English on real text nodes, which
React always treats as a hydration error (`Hydration failed because the server rendered
text didn't match the client`), not a suppressible warning. Caught by this feature's own
e2e suite (a returning pt-BR visitor navigating between routes threw the error in the
browser console) before merge, not assumed fixed. Corrected to match the design actually
described above: `locale` always starts `"en"` and only corrects via a `useEffect` after
mount.

**Alternatives considered**:

- *Cookie-based, server-resolved locale (`next-intl`'s own recommended non-routing
  pattern, via `getRequestConfig` reading a cookie in a Server Component).* Would
  eliminate the flash above, since the server could render the correct language on
  first paint. Rejected because it reintroduces exactly the server-visibility
  machinery the feature requester asked to avoid, for a portfolio-scale audience where
  a one-render content swap is a minor, acceptable cost.
- *URL-prefixed locales (`/en/`, `/pt-br/`).* Rejected per spec Assumptions — touches
  every route and internal `<Link>`, and was explicitly ruled out by the feature
  requester in favor of the simpler client-only approach.

## R3: Language selector primitive

**Decision**: Vendor `@radix-ui/react-select` (confirmed compatible: `peerDependencies`
accept `react: "^19.0"`) into `shared/ui/primitives/select.tsx`, following the exact
vendoring convention `Dialog`/`Tabs` already established in the shadcn/ui migration
(flat, coverage-excluded, re-vendor via `shadcn add select` for an upstream fix rather
than hand-editing). The language selector itself (`shared/i18n/components/
locale-selector/`) is owned, folder-per-component code composing this primitive —
mirrors exactly how `ThemeToggle` composes the vendored `Button` today.

**Rationale**: Spec FR-001 explicitly rules out an unlabeled native `<select>` styled to
look like something else. A Radix `Select` gives a real accessible listbox (keyboard
navigation, ARIA roles, labeling) for the same implementation cost as styling a native
element correctly, and keeps this feature inside the vendored-primitive discipline
constitution Principle III already establishes rather than hand-rolling a second,
parallel pattern.

**Alternatives considered**:

- *Native `<select>`, styled.* Simpler, but explicitly ruled out by spec FR-001 — a
  bare native select "styled to look like something else" was the exact case the spec
  named to avoid, following this repo's own accessibility track record (contrast
  failures shipped more than once; not repeating the same class of shortcut here).
- *A vendored `DropdownMenu` (Radix) instead of `Select`.* Both are viable Radix
  primitives for this; `Select` is the more semantically correct choice for "choose one
  value from a fixed list" (native `<select>`-equivalent ARIA role `listbox`/`option`),
  where `DropdownMenu`'s semantics are built for action menus. `Select` chosen for
  correctness, not convenience.

## R4: Backend error mapping — corrected from `Problem.type` to `Problem.status`

**Correction, found by reading the actual backend source before committing to a design**:
the feature spec (following the source issue) assumed mapping on `Problem.type` per RFC
7807 convention. Checked directly against `pricing-optimizer-api`'s
`internal/adapter/httpapi/response.go`: `writeProblem(w, r, status, title, detail)`
constructs `api.Problem{Status: status, Title: title}` and **never sets `Type` at all** —
every real call site across `analyze.go`, `generate.go`, `export.go`, `get_generation.go`,
`idempotency.go`, and `ratelimit.go` was grepped directly, and none of them pass a `type`
value. `Problem.type` is optional on the wire and, in practice, always absent from the
real backend (the one exception is this frontend's own `networkFailureProblem` in
`shared/api/network-error.ts`, which sets a client-synthesized `type: "about:blank"` for
connection failures the backend never even saw). Mapping on `type` as originally planned
would put nearly every real error into the generic-fallback bucket, defeating the
purpose. This is exactly the kind of assumption worth verifying against source before
building a feature on it, not after.

**Decision**: map on `Problem.status` (the HTTP status code) instead — always populated,
and the backend's actual distinct error categories line up with it cleanly:

| Status | Real call sites (grepped, not assumed) | Category |
|---|---|---|
| 400 | malformed request body (analyze, generate, export) | client sent invalid JSON |
| 404 | generation/variation not found (export, get-generation) | not found |
| 409 | generation already in progress for this idempotency key (idempotency) | conflict |
| 422 | invalid analyze/generate request (validation failure) | validation |
| 429 | rate limit exceeded | rate limited |
| 502 | could not fetch or parse the target site (analyze) | upstream/target-site failure |
| 500 | could not start/stream generation, could not export, could not fetch generation, could not analyze the site, could not encode the response | generic server error |
| 0 | `networkFailureProblem` (client never reached the server) | network failure |

A small, explicit `Record<number, MessageKey>`-shaped mapping (not a dynamic lookup
against arbitrary backend strings), with one generic fallback message per locale for any
status not in the table above (covers any future status the backend starts returning).
Lives alongside the existing `Problem` handling in `shared/api/` (exact file confirmed in
data-model.md), consumed by the UI layer (`studio-page.tsx`) that currently renders the
raw backend `title`/`detail` strings directly.

**Rationale**: `status` is the one field every real `writeProblem` call site actually
populates, so it is the only reliable discriminant available today. Grouping by status
matches how a user actually experiences these failures (a validation problem needs
different copy from "the target site couldn't be reached" needs different copy from "the
server is having a problem"), and needs no backend change to work correctly.

**Alternatives considered**:

- *Map on `Problem.type` as the source issue originally suggested.* Rejected once source
  code confirmed the backend never populates it — see Correction above.
- *Surface the raw backend `title`/`detail` unchanged.* Rejected: an English error
  string appearing in an otherwise-Portuguese UI is exactly the "half-translated, reads
  as broken" failure mode spec User Story 2 calls out.
- *Ask the backend to add a `locale` parameter and return translated `Problem` strings.*
  Rejected: out of scope for a frontend-only feature and disproportionate to the actual
  problem (eight distinct status-keyed cases), matching the same reasoning the spec
  already applies to keeping LLM-generated content English-only (a contract change is a
  separate, larger feature).
