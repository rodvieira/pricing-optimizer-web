# Implementation Plan: PT-BR localization with a language selector

**Branch**: `004-pt-br-localization` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-pt-br-localization/spec.md`

## Summary

Add a two-language (English default, Portuguese/Brazil) UI switch to the app header,
persisted in `localStorage` with no `Accept-Language` negotiation and no URL-based
routing (both explicitly ruled out by the feature requester — see spec Assumptions).
Every hardcoded user-facing string in `app/`, `views/`, `features/`, `entities/`, and
`shared/ui/` moves into English/Portuguese message catalogs consumed via `next-intl`,
mounted in **client-only mode** (no middleware, no server-resolved locale) — a
`LocaleProvider` client component owns `locale` state exactly the way `ThemeModeProvider`
already owns `mode`, defaulting to English on the server and correcting from
`localStorage` on mount. Prices and other locale-sensitive numbers format via
`next-intl`'s `useFormatter` (backed by native `Intl.NumberFormat`). Backend `Problem`
errors map to a translated message keyed on `Problem.type`. Ships as one PR, per
explicit user instruction.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16.2.11 App Router, React 19.2.4 —
unchanged from the rest of this repo.

**Primary Dependencies**: `next-intl@^4.13` (confirmed peer-compatible with `next ^16.0.0`
and `react ^19.0.0` via the npm registry before choosing it — see research.md). No other
new dependency; number/currency formatting uses `next-intl`'s `useFormatter`, itself a
thin wrapper over native `Intl.NumberFormat` — no separate formatting library.

**Storage**: `localStorage` only (`pricing-optimizer-locale` key, mirroring the existing
`pricing-optimizer-theme-mode` key's naming and single-owner pattern). No cookie, no
server-side session, no database change — this is pure client UI state.

**Testing**: Vitest + React Testing Library for the locale provider/selector and any
formatting helper; Playwright + axe-core for an e2e language-switch test across `/` and
`/studio`, matching this repo's existing test stack exactly.

**Target Platform**: Web (existing Next.js frontend), no new platform.

**Project Type**: Web application (existing single Next.js project — this feature adds no
new project, service, or app).

**Performance Goals**: Language switch reflects in the UI in under 1 second of perceived
delay (spec SC-001) — in practice near-instant, since it is a client-state update with no
network request.

**Constraints**: No URL/routing change (spec Assumption); no `Accept-Language`
negotiation (spec Assumption); LLM-generated pricing content stays English (spec FR-009);
switching language must not interrupt an in-progress SSE stream (spec FR-010); coverage
stays at or above the existing 90% floor (constitution Principle IV).

**Scale/Scope**: Two locale catalogs (`en`, `pt-BR`) covering every user-facing string
across `app/`, `views/`, `features/`, `entities/strategy`, and `shared/ui/` per spec
FR-006 — full-app string-extraction sweep, one new provider, one new selector component,
no new routes, no new backend surface.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First (OpenAPI)**: No wire-format change. `Problem.type`-keyed error
  translation reads an existing response field; `openapi.yaml` is untouched. **PASS**.
- **II. Layered Architecture with an Isolated Domain Layer**: The locale provider and
  selector are cross-cutting infrastructure with no feature identity, so they belong in
  `shared/` — mirroring exactly where `shared/theme/` already sits and for the same
  reason (both `shared/ui/app-header.tsx` and other layers need it, so it cannot live in
  `features/` without creating a backward-layer import). Locale catalogs are data, not
  logic, and stay out of `shared/domain/` (which must remain framework-agnostic — a
  message catalog keyed for a specific i18n library's message format does not belong
  there). **PASS**, structure decision below names exact paths.
- **III. Design-System Discipline (shadcn/ui + Radix)**: The language selector is a new
  UI control needing the same accessible-control bar as everything else — compose the
  existing vendored primitives (a native `<select>` is explicitly ruled out as
  insufficient per spec FR-001; a Radix `Select`/`DropdownMenu`-based control is the
  vendored-primitive-compliant path, added as a new entry in `shared/ui/primitives/` the
  same way `Dialog`/`Tabs` were vendored in the shadcn migration). **PASS**, provided the
  selector is vendored, not hand-rolled from scratch.
- **IV. Test Rigor**: Locale provider (real branching: stored-vs-default resolution,
  update-on-select) and any formatting/error-mapping helpers need unit tests; the
  selector's accessibility needs e2e/axe coverage; 90% floor applies as everywhere else.
  **PASS**, no exemption needed or claimed.
- **V. Shipped-Artifact Discipline**: English-only in code/comments/commits (locale
  catalogs are product content, not authored artifacts — spec's own framing, matching
  `CLAUDE.md` rule 1's existing carve-out for generated pricing-page content). An ADR is
  required for the library and client-only-mode decision. **PASS**, ADR produced in
  Phase 0 (research.md) and finalized as a real ADR file before the PR opens.

No violations to justify — Complexity Tracking table is not needed.

**Re-checked after Phase 1 design** (research.md, data-model.md, quickstart.md): still
PASS across all five principles. The one design-time correction (R4: mapping error copy
on `Problem.status` rather than the never-populated `Problem.type`) doesn't change any
gate's outcome — it changes which field a within-scope requirement (FR-007) keys on, not
whether the requirement itself complies.

## Project Structure

### Documentation (this feature)

```text
specs/004-pt-br-localization/
├── plan.md              # This file
├── research.md          # Phase 0 output: library choice, client-only-mode decision
├── data-model.md         # Phase 1 output: locale preference, message catalog, error mapping
├── quickstart.md        # Phase 1 output: manual validation guide
└── tasks.md             # Phase 2 output (/speckit-tasks — not created by this command)
```

No `contracts/` directory: this feature adds no new external interface (no new API route,
no wire-format change) — it is a pure frontend UI/state feature over the existing backend
contract.

### Source Code (repository root)

```text
src/
  shared/
    i18n/                       # NEW — mirrors shared/theme/'s shape exactly
      components/
        locale-provider/        # LocaleProvider (owns `locale` state + localStorage),
                                 # useLocale() hook — same pattern as theme-mode-provider/
      messages/
        en.json                 # English message catalog
        pt-BR.json               # Portuguese (Brazil) message catalog
      locale-init-script.ts     # NOT needed for pre-paint (text can't be set via a
                                 # synchronous attribute the way data-theme/color-scheme
                                 # can — see research.md's accepted brief-flash tradeoff);
                                 # kept out unless research.md's investigation finds
                                 # otherwise
      index.ts                  # barrel: LocaleProvider, useLocale, LocaleSelector
    ui/
      primitives/
        select.tsx              # NEW vendored primitive (Radix Select), if the language
                                 # selector needs a real listbox rather than reusing an
                                 # existing primitive — confirmed in Phase 1
    providers/
      app-providers.tsx         # MODIFIED — compose LocaleProvider alongside
                                 # ThemeModeProvider (same file, same pattern)
  shared/ui/app-header/
    app-header.tsx              # MODIFIED — render the new language selector next to
                                 # ThemeToggle; NAV_ITEMS labels sourced from messages
  entities/strategy/
    strategy-meta.ts            # MODIFIED — labels/blurbs move to message catalogs;
                                 # any now-superseded English constant removed (spec FR-011)
  features/
    generate-stream/            # status/empty-state copy sourced from messages
    history/                    # empty-state/label copy sourced from messages
    export/                     # dialog copy, format labels sourced from messages
    url-input/                  # Zod validation messages sourced from messages
  app/
    layout.tsx                  # MODIFIED — metadata per locale, LocaleProvider mount

test/e2e/
  i18n.spec.ts                  # NEW — language switch on / and /studio, axe-clean
```

**Structure Decision**: `shared/i18n/` is a new peer of `shared/theme/`, following the
identical single-owner-provider + barrel shape that already exists for dark/light mode,
since both are cross-cutting client state with no feature identity (constitution
Principle II). Message catalogs live inside `shared/i18n/messages/` rather than at the
repo root, since they are consumed only through the provider, not imported directly by
feature code (features call `useTranslations()`/`useLocale()`, never read a catalog
file). No new top-level project or route is introduced.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
