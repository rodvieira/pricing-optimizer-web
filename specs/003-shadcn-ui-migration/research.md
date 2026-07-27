# Phase 0 Research: Astryx to shadcn/ui migration

**Feature**: `003-shadcn-ui-migration` | **Date**: 2026-07-26

Five questions were open entering Phase 0. All are resolved. Two of the answers changed the
implementation plan.

---

## R1: Does shadcn/ui support Tailwind v4, React 19, and Next.js 16?

**Decision**: Yes. Proceed with the current shadcn CLI (4.15.0), vendoring primitives over Radix.

**Rationale**: shadcn/ui shipped full support for React 19 and Tailwind v4. The CLI initialises
Tailwind v4 projects directly and supports the `@theme` directive including `@theme inline`.
Primitives dropped `forwardRef` (matching React 19 semantics) and each now carries a `data-slot`
attribute for styling hooks. Existing Tailwind v3 or React 18 projects keep working, so support
is additive rather than a breaking migration.

This repo is already on Tailwind v4 via `@tailwindcss/postcss` with no `tailwind.config.*` file,
which is the v4-native setup shadcn expects. React is 19.2.4.

**The material find**: this repo *already* bridges design tokens into Tailwind with
`@theme inline` (for Astryx, in `src/app/globals.css`). shadcn's v4 story uses the same
mechanism. The migration therefore replaces the *contents* of an existing, understood bridge
rather than introducing a new styling concept. That materially lowers the risk of increment 5.

**Alternatives considered**:

- *Radix primitives directly, no shadcn.* Rejected: shadcn's value here is precisely the
  pre-audited, Tailwind-styled, accessible defaults. Going straight to Radix means rebuilding
  that styling layer by hand, which is what the current situation already suffers from.
- *Stay on Tailwind v3 for compatibility.* Unnecessary; v4 is supported and already in place.

**Sources**: [Tailwind v4 - shadcn/ui](https://ui.shadcn.com/docs/tailwind-v4),
[Next.js 15 + React 19 - shadcn/ui](https://ui.shadcn.com/docs/react-19)

**Residual risk**: published guides target Next.js 15; this repo is on 16.2.11. shadcn primitives
are framework-agnostic React plus Tailwind classes, so runtime risk is minimal, but `shadcn init`
may probe for a Next 15-shaped config. Mitigation: vendor components with `shadcn add` and
hand-place them into `shared/ui/primitives/` rather than trusting `init` to wire the project.

---

## R2: What replaces `CodeBlock` for the export preview?

**Decision**: `prism-react-renderer` 2.4.1, wrapped in an owned `shared/ui/code-preview/`
component that supplies the copy button, line numbers, and title.

**Rationale**: confirmed on the registry at 2.4.1 with a single permissive peer dependency
(`react >=16`), so it adds no version pressure against React 19. It is a tokeniser plus a render
prop: it emits tokens and leaves markup and theming to the caller. That is exactly the shape
needed here, because the palette must come from this repo's own tokens rather than a bundled
preset in order to stay correct in both color schemes.

The wrapper is owned code and therefore folder-per-component with a colocated test, per spec
Clarification 2. It must reimplement four things Astryx's `CodeBlock` supplied as props:
`hasCopyButton`, `hasLineNumbers`, `title`, and `maxHeight` (currently 420) with overflow
scrolling inside its own container.

**Alternatives considered**:

- *Shiki.* Best fidelity via real TextMate grammars, but disproportionate: this app highlights
  exactly three languages (`tsx`, `html`, `json`) and Shiki's weight and build integration cost
  outweigh the accuracy gain on a preview pane.
- *No highlighting (monospace plus copy).* Zero new dependency and lowest risk, but the export
  dialog is the most screenshot-worthy screen in a portfolio piece; losing highlighting is a
  visible downgrade exactly where it is most looked at.

---

## R3: What exactly does `<Theme>` do that must be taken over?

**Decision**: four distinct responsibilities, all of which move to owned code in increment 5.

This is the finding that restructured the plan. `<Theme>` is not merely a `data-theme` writer:

1. **`color-scheme`.** `<Theme>` sets it from `data-theme`. `globals.css` defines two bespoke
   tokens with `light-dark()` (`--po-accent-rust`, `--po-text-muted`), which resolve *against*
   `color-scheme`. Removing `<Theme>` without taking this over makes both silently resolve to
   their light values in dark mode: a real, quiet visual regression.
2. **`data-astryx-theme="pricing-optimizer"` on `<html>`.** The generated theme CSS is wrapped in
   `@scope ([data-astryx-theme="pricing-optimizer"]) to ([data-astryx-theme])`. Every token
   resolves only inside that attribute, so the attribute and the CSS must be removed together.
3. **A heading reset.** The generated CSS ships a `@layer reset` block giving `h1` through `h6`
   their font family, size, weight, and line height. Nothing else in the app sets these, so raw
   headings lose their typography unless the reset is reproduced.
4. **Skipping runtime style injection.** The current provider passes a pre-built theme object so
   `<Theme>` does *not* inject styles at runtime, which is what keeps the warm palette present on
   first paint. The replacement must preserve that property by construction, since it ships plain
   CSS with no runtime injection at all.

**Consequence**: the existing binary light/dark semantics, `localStorage` key
(`pricing-optimizer-theme-mode`), OS-following-when-unset behavior, and the pre-hydration init
script are all already owned by this repo and carry over unchanged. Only the four items above
transfer. The init script gains one line: it must set `color-scheme` alongside `data-theme`.

**Alternatives considered**:

- *Adopt `next-themes`.* Rejected on two grounds: the constitution forbids a second color-mode
  owner (a rule worth keeping even as Principle III is rewritten), and the repo's existing
  provider already implements the exact semantics wanted, including the subtle
  "follow the OS until the user chooses" behavior that a past bug was traced to.

---

## R4: How large is the token surface, and can it move in one step?

**Decision**: 63 occurrences of 14 bridged token utilities across 19 files. It moves in one
increment (5), but that increment does nothing else.

Measured inventory (see [data-model.md](./data-model.md) for the full mapping):
`text-secondary` 12, `border-border` 12, `bg-muted` 9, `text-primary` 7, `border-border-strong`
7, `bg-surface` 3, `bg-border` 3, `bg-card` / `text-accent` / `text-error` 2 each, and
`bg-body` / `border-error` / `text-warning` / `text-success` 1 each.

**Rationale for keeping it in one increment**: these utilities are a single coherent contract. A
partial migration would mean two token sources defining overlapping utility names in the same
Tailwind layer, where resolution order decides the winner. That is a worse failure mode (silent,
specificity-dependent) than a single larger diff whose blast radius is understood. Critically,
because the utility *names* are preserved and only their definitions move, no call site changes:
the diff is concentrated in `globals.css`, not spread across 19 files.

**Alternatives considered**:

- *Rename tokens to shadcn's own vocabulary* (`bg-background`, `text-muted-foreground`, and so
  on). Rejected for this feature: it would touch all 19 files, mixing a mechanical rename into a
  dependency swap and destroying the "no call site changes" property that makes increment 5
  reviewable. Worth a separate follow-up if desired.

---

## R5: Are the jsdom polyfills still needed, and when can each go?

**Decision**: they retire in different increments. Verify by deletion and a passing suite, never
by assumption.

- **`HTMLDialogElement.prototype.showModal`/`close`** exists because Astryx's `<Dialog>` calls
  them on the native element. Radix's dialog does not use the native `<dialog>` element, so this
  polyfill retires with **increment 3**. One test currently reaches for
  `document.querySelector("dialog")` (`studio-page.test.tsx`) and must be updated to Radix's
  `role="dialog"` semantics in the same increment.
- **`window.matchMedia`** is used by two independent things: Astryx's `<Theme>`, and the repo's
  *own* `ThemeModeProvider` (for `prefers-color-scheme`). The owned provider keeps needing it, so
  this polyfill **cannot** be deleted. It stays, and its comment gets corrected.

**Correction to an earlier assumption**: the spec's deletion manifest originally listed both
polyfills for removal. That is wrong for `matchMedia`; keeping it is required, not optional.
`data-model.md`'s deletion manifest reflects the corrected position.

**Also corrected**: `test/setup.ts`'s comment attributes `matchMedia` use to
"Astryx's `<Theme>`/`useTheme`". `useTheme` from Astryx is not imported anywhere in this repo;
the repo owns `useThemeMode` instead. The comment is stale independent of this migration.
