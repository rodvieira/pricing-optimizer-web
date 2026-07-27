# Migration Inventory: Astryx to shadcn/ui

**Feature**: `003-shadcn-ui-migration` | **Date**: 2026-07-26

This feature introduces no data entities and changes no wire format. The structured data that
governs it is the migration inventory below: what maps to what, who owns each replacement, and
exactly what gets deleted. Treat these tables as the authoritative checklist; `/speckit-tasks`
derives from them.

---

## 1. Component mapping

`Owner` is either **vendored** (shadcn CLI output, flat in `shared/ui/primitives/`,
coverage-excluded) or **owned** (this repo's code, folder-per-component with a colocated test and
a barrel).

| Astryx import | Uses | Replacement | Owner | Increment | Risk |
| --- | --- | --- | --- | --- | --- |
| `Button` | 7 | shadcn `Button` | vendored | 2 | Low |
| `Text` | 4 | `shared/ui/text/` | **owned** | 2 | Medium |
| `Banner` | 2 | shadcn `Alert` | vendored | 2 | Low |
| `Card` | 2 | shadcn `Card` | vendored | 2 | Low |
| `Skeleton` | 2 | shadcn `Skeleton` | vendored | 2 | Low |
| `Badge` | 1 | shadcn `Badge` | vendored | 2 | Low |
| `Layout`, `LayoutContent` | 1 | Plain composition inside the dialog | owned | 2 | Low |
| `Dialog`, `DialogHeader` | 1 | shadcn `Dialog` (Radix) | vendored | 3 | Medium |
| `Tab`, `TabList` | 1 | shadcn `Tabs` (Radix) | vendored | 3 | Medium |
| `CodeBlock` | 1 | `shared/ui/code-preview/` | **owned** | 4 | High |
| `Theme`, `neutralTheme`, `defineTheme` | 2 | `shared/theme/components/theme-mode-provider/` | **owned** | 5 | High |

### Owned replacements: required behavior

**`shared/ui/text/`** must preserve the full scale currently in use, verified against the
existing call sites:

| Prop value in use | Seen in |
| --- | --- |
| `type="display-3"` | `studio-page.tsx` |
| `type="body"` | `studio-page.tsx`, `hero.tsx` |
| `type="label"` | `audience-summary-bar.tsx` |
| `type="supporting"` | `audience-summary-bar.tsx` |
| `color="secondary"` | `studio-page.tsx`, `audience-summary-bar.tsx` |
| `className` passthrough (e.g. `block`) | `studio-page.tsx` |

**`shared/ui/code-preview/`** must reimplement the four `CodeBlock` props currently passed:
`hasCopyButton`, `hasLineNumbers`, `title`, and `maxHeight={420}` with overflow scrolling
contained (the page must never scroll sideways). Languages needed: `tsx`, `html`, `json`.

**`theme-mode-provider/`** must take over the four `<Theme>` responsibilities from
[research.md R3](./research.md): writing `data-theme`, setting `color-scheme`, replacing the
`@scope` attribute mechanism, and reproducing the `h1`-`h6` reset. It must preserve, unchanged:
the binary light/dark semantics, the `pricing-optimizer-theme-mode` storage key, following the OS
scheme until the user chooses explicitly, and no runtime style injection.

---

## 2. Design-token mapping

The utility **names are preserved**; only their definitions move, from
`@astryxdesign/core/tailwind-theme.css` plus the generated theme to an owned `@theme inline`
block in `src/app/globals.css`. This is what keeps increment 5's diff concentrated in one file
instead of spread across 19.

| Utility | Uses | Semantic role | Notes |
| --- | --- | --- | --- |
| `text-secondary` | 12 | Muted-but-readable body text | **Contrast-critical.** The repo's past failures were here (4.19:1 against a 4.5:1 requirement). Verify in both schemes. |
| `border-border` | 12 | Default divider and outline | |
| `bg-muted` | 9 | Recessed surface | **Contrast-critical** as the background half of past failures. |
| `text-primary` | 7 | Primary body and heading text | |
| `border-border-strong` | 7 | Emphasised outline | |
| `bg-surface` | 3 | Raised surface | |
| `bg-border` | 3 | Hairline fills (1px rules) | Uses a border token as a background; preserve deliberately. |
| `bg-card` | 2 | Card surface | |
| `text-accent` | 2 | Accent text | |
| `text-error` | 2 | Error text | Contrast-critical. |
| `bg-body` | 1 | Page background | A missing `bg-body` on `<body>` was a real past bug; assert it stays applied. |
| `border-error` | 1 | Error outline | |
| `text-warning` | 1 | Warning text | Contrast-critical. |
| `text-success` | 1 | Success text | Contrast-critical. |

**Bespoke tokens that must survive the handover** (currently unlayered in `globals.css`):

| Token | Current definition | Requirement |
| --- | --- | --- |
| `--po-accent-rust` | `light-dark(#bb5330, #e0916f)` | Needs `color-scheme` set, or silently resolves light in dark mode |
| `--po-text-muted` | `light-dark(#8d887c, #a3a3a3)` | Same |
| `--po-text-compact-control` | `12.5px` | Shared by three genuinely-identical controls; keep as one token |
| `--font-family-heading` / `-body` / `-code` | Mapped from `next/font` variables | Astryx components read these directly; owned components must too |

**Also token-dependent**: `entities/strategy` carries Astryx non-semantic color variants
(`orange`/`teal`/`pink`) as per-strategy display metadata, consumed by both the landing preview
and Studio's variation cards. These become owned tokens in increment 5.

---

## 3. Component restructure map

Flat file to folder. Every target folder holds the component, a colocated test, and `index.ts`.

| Current | Target | Test today |
| --- | --- | --- |
| `shared/ui/app-header.tsx` | `shared/ui/app-header/` | Exists |
| `shared/ui/card-action-button.tsx` | `shared/ui/card-action-button/` | Exists |
| `shared/ui/color-accent-column.tsx` | `shared/ui/color-accent-column/` | **MISSING, backfill** |
| `shared/ui/color-dot.tsx` | `shared/ui/color-dot/` | **MISSING, backfill** |
| `shared/ui/eyebrow.tsx` | `shared/ui/eyebrow/` | **MISSING, backfill** |
| `shared/ui/panel-header.tsx` | `shared/ui/panel-header/` | **MISSING, backfill** |
| `shared/ui/price-display.tsx` | `shared/ui/price-display/` | **MISSING, backfill** |

`shared/ui/` has **no barrel today**; increment 1 adds one. The same folder-per-component shape
applies to `features/*/components/`, `features/*/hooks/`, `views/*/components/`, and
`shared/theme/components/`.

---

## 4. Deletion manifest

Verification is by deletion followed by a passing suite, never by assumption.

| Artifact | Increment | Verification |
| --- | --- | --- |
| `src/shared/theme/generated/` (4 files) | 6 | Clean `pnpm build` succeeds |
| `src/shared/theme/pricing-optimizer-theme.ts` | 6 | No import resolves to it |
| `build:theme` script in `package.json` | 6 | Clean install and build with no manual pre-step |
| `@astryxdesign/core` | 6 | Absent from `package.json` and `pnpm-lock.yaml` |
| `@astryxdesign/theme-neutral` | 6 | Same |
| `@astryxdesign/cli` | 6 | Same |
| `HTMLDialogElement` polyfill in `test/setup.ts` | **3** | Full suite passes without it |
| The three `@astryxdesign/*` CSS imports in `globals.css` | 5 | Visual parity holds in both schemes |
| `@astryxdesign/core/tailwind-theme.css` import | 5 | All 14 token utilities still resolve |
| Astryx entries in the `@layer` order declaration | 5 | Utilities still beat component defaults |
| Any `shared/ui` wrapper with no remaining consumer | 6 | Grep for consumers before deleting |

### Correction: `matchMedia` must NOT be deleted

The spec's original manifest listed both jsdom polyfills for removal. That is wrong for
`window.matchMedia`: it serves *two* consumers, Astryx's `<Theme>` **and** this repo's own
`ThemeModeProvider`, which reads `prefers-color-scheme` to follow the OS until the user chooses.
The owned provider keeps that behavior, so the polyfill stays. Only its stale comment (which
attributes the need to `useTheme`, an import that does not exist in this repo) gets corrected.

### Final gate

```bash
grep -ri astryx . --exclude-dir=node_modules --exclude-dir=.git
```

Must return matches only in `docs/decisions/` and `specs/003-shadcn-ui-migration/`.

---

## 5. Invariants (assert every increment)

1. `shared/domain/` imports nothing from `react`, `next`, `zod`, `@tanstack/*`, or
   `shared/api/schema.ts`.
2. Layer direction `app -> views -> features -> entities -> shared` holds; `biome check` passes
   with no `noRestrictedImports` violation.
3. Cross-layer imports resolve through a barrel, never a deep path.
4. Coverage at or above 90% on statements, branches, functions, and lines.
5. Zero axe violations; every informational text at or above 4.5:1 in both schemes.
6. Exactly one owner writes `data-theme`; the toggle exposes two states, not three.
7. No pre-hydration flash: the init script sets `data-theme` **and** `color-scheme` before paint.
8. `<body>` keeps its `bg-body` class (a past real bug).
9. No `console.log`; no emoji in code or commits; English throughout.
