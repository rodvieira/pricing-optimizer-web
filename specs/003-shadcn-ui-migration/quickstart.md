# Validation Guide: Astryx to shadcn/ui migration

**Feature**: `003-shadcn-ui-migration` | **Date**: 2026-07-26

How to prove each increment actually works. Six increments, each its own branch and pull request,
each independently green. Mappings and deletion targets live in
[data-model.md](./data-model.md); decisions and their rationale in
[research.md](./research.md).

## Prerequisites

```bash
cd pricing-optimizer-web
pnpm install
```

Docker is not needed (this repo has no container-backed tests). A live backend is not needed:
Playwright intercepts routes via `test/e2e/mock-backend.ts`.

## The gate every increment must pass

Run all five before `pr-reviewer`, and again after fixing its findings:

```bash
pnpm typecheck        # tsc --noEmit
pnpm lint             # biome check . (includes the layer-boundary rules)
pnpm test:coverage    # vitest run --coverage, 90% floor, fails below
pnpm build            # next build, the real production output
pnpm test:e2e         # playwright + axe-core
```

Then, per the constitution and [always-run-pr-reviewer]:

```bash
git diff main...HEAD    # feed this to the pr-reviewer agent
```

**Expect a Principle III finding on increments 2 through 6.** The constitution still mandates
Astryx until increment 6 amends it. Link this spec and issue #33 in the pull request body so the
finding is dismissed as sanctioned rather than re-investigated or reverted. Every *other* finding
is real and must be fixed before pushing.

## Shared verification procedures

### Visual parity (increments 2, 3, 4, 5)

The repo's established method, from the earlier design-parity work: compare computed styles
against the mock rather than eyeballing screenshots.

```bash
pnpm dev    # then drive the comparison against docs/design/Pricing Optimizer.html
```

Compare `getComputedStyle` for font size, weight, line height, color, background, border, and
spacing on the changed components. Check **both** color schemes and **both** routes (`/` and
`/studio`). Use realistic variable-length generated copy, not the mock's fixed strings: mismatched
content length has broken parity here before.

### Accessibility (every increment touching markup)

`pnpm test:e2e` runs axe-core over `landing.spec.ts` and `studio.spec.ts`. Zero violations is the
bar. Separately confirm contrast for the five contrast-critical tokens flagged in
[data-model.md](./data-model.md) section 2 (`text-secondary`, `bg-muted`, `text-error`,
`text-warning`, `text-success`) at 4.5:1 or better in both schemes. This repo has shipped
contrast failures more than once; do not skip it because axe passed.

### Performance (increment 6, after deploy)

```bash
pnpm lighthouse https://pricing-optimizer-web.vercel.app
```

Baseline to beat: 99 landing, Studio at or above the 95 target. Local runs on a shared machine
swing 8+ points between identical builds; treat local as a smoke check and the deployed number as
authoritative.

---

## Increment 1 — Restructure and backfill tests

**Astryx untouched.** Highest-value, lowest-risk step: it puts tests around the components that
are about to be rewritten.

**Do**: convert flat component files to folders (component + test + `index.ts`), add the missing
`shared/ui/index.ts` barrel, and write real tests for the five untested components
(`color-accent-column`, `color-dot`, `eyebrow`, `panel-header`, `price-display`).

**Verify**:

```bash
pnpm test:coverage    # coverage should RISE; 5 previously-untested components now covered
pnpm lint             # no deep cross-layer import; barrels resolve
pnpm build
```

**Expected**: no rendered output changes anywhere. A test asserting behavior that did not exist
before is a bug in the test, not a feature. Tests must exercise real branching, not smoke-render.

**Done when**: every component directory has a test and a barrel; coverage is up; the diff
contains no behavioral change.

---

## Increment 2 — Presentational primitives

**Do**: vendor shadcn primitives into `shared/ui/primitives/` (flat, coverage-excluded), build the
owned `shared/ui/text/`, and swap `Button` (7 files), `Text` (4), `Badge`, `Banner` to `Alert`,
`Card`, `Skeleton`, and `Layout`/`LayoutContent`.

**Verify**: the full gate, plus visual parity, plus every `Text` variant in
[data-model.md](./data-model.md) section 1 resolving to its previous computed styles.

**Watch for**: `Text` is the risky one. Four `type` values and a `color` prop are in use; missing
one degrades typography silently. Enumerate them from the table, do not infer from a sample.

**Done when**: only `Theme`, `Dialog`, `Tabs`, and `CodeBlock` still import from Astryx.

---

## Increment 3 — Interactive components

**Do**: swap `Dialog`/`DialogHeader` and `Tab`/`TabList` for shadcn's Radix-backed equivalents.
Then delete the `HTMLDialogElement` polyfill from `test/setup.ts` and update the one test reaching
for `document.querySelector("dialog")` (`studio-page.test.tsx`) to Radix's `role="dialog"`.

**Verify** keyboard behavior by hand, because axe will not catch focus bugs:

1. Open the export dialog by keyboard only.
2. Tab through the three format tabs; confirm focus stays trapped inside the dialog.
3. Press Escape; confirm it closes and focus returns to the trigger.
4. Reopen for a *different* variation; confirm the format resets to JSX (existing behavior).

```bash
pnpm test:coverage    # must pass WITHOUT the deleted polyfill
pnpm test:e2e
```

**Done when**: the dialog polyfill is gone and the suite passes without it. Do not assume; delete
and run.

---

## Increment 4 — Code preview

**Do**: build `shared/ui/code-preview/` over `prism-react-renderer`, reimplementing
`hasCopyButton`, `hasLineNumbers`, `title`, and `maxHeight` (420) with contained scrolling.
Replace `CodeBlock` in the export dialog.

**Verify**, for each of `jsx`, `html`, and `stripe`:

1. Content renders as highlighted code, readable in both schemes.
2. Copy places the **full, unmodified** export on the clipboard (compare against the API response,
   not against what is visible).
3. A long export scrolls inside its own container; the page does not scroll sideways.
4. An empty or single-line export neither collapses nor misaligns.

**Watch for**: the highlighter theme must be driven by this repo's palette, not a bundled preset,
or dark mode will be wrong.

**Done when**: only `Theme` still imports from Astryx.

---

## Increment 5 — Token and theme handover

The highest-risk increment. It is isolated on purpose: it is the only one that changes where
design tokens come from, and it deletes nothing.

**Do**:

1. Define all 14 token utilities in an owned `@theme inline` block in `globals.css`, keeping the
   **same utility names** so no call site changes.
2. Take over `color-scheme` (in both the provider and the pre-hydration init script) so the two
   `light-dark()` bespoke tokens keep resolving.
3. Reproduce the `h1`-`h6` reset the generated CSS provided.
4. Rewrite `theme-mode-provider` to own `data-theme` directly, dropping `<Theme>`.
5. Rewrite `test/render.tsx` to stop wrapping in Astryx's `<Theme>`.
6. Move `entities/strategy`'s Astryx color variants to owned tokens.
7. Rework the `@layer` order so utilities still beat component defaults.

**Verify** the theme edge cases explicitly, all of which are past real bugs:

| Scenario | Expected |
| --- | --- |
| Fresh visitor, dark OS, no stored preference | Renders dark; toggle shows the *resolved* scheme, not raw state |
| OS scheme changes while the page is open, preference never set | Follows live |
| Returning visitor with a stored preference | Honors it; the existing `pricing-optimizer-theme-mode` key still works |
| Hard reload | No flash of the wrong scheme before hydration |
| Dark mode | Both `light-dark()` tokens resolve to their **dark** values |
| Any page | `<body>` still carries `bg-body` |
| Raw `h1`-`h6` | Still styled |

```bash
pnpm typecheck && pnpm lint && pnpm test:coverage && pnpm build && pnpm test:e2e
pnpm start    # verify against a real production build, not just dev
```

**Watch for**: Turbopack has silently dropped theme CSS from the dev bundle after repeated hot
reloads in this repo before. If styles look wrong in dev, restart the dev server and confirm
against `pnpm build && pnpm start` before treating it as a real bug.

**Done when**: no source file imports from `@astryxdesign/*`, while the packages are still
installed. Confirm:

```bash
grep -rl "@astryxdesign" src/ test/    # expect: no matches
```

---

## Increment 6 — Purge, ADR, and constitution

Deletes only what increment 5 already proved unreferenced, so a bisect cleanly separates
"tokens broke" from "deletion broke something".

**Do**: work through the deletion manifest in [data-model.md](./data-model.md) section 4. Write
the ADR superseding the Astryx decision (context, decision, rejected alternatives, consequences,
following the existing ADR format). Run `/speckit-constitution` for the MAJOR bump to 2.0.0:
rewrite Principle III to describe shadcn discipline including the vendored-versus-owned rule,
update the fixed-stack list, and fix Principle II's stale folder names in the same pass.

**Do NOT delete** the `matchMedia` polyfill. It serves this repo's own `ThemeModeProvider`, not
just Astryx (see [research.md R5](./research.md)). Correct its stale comment instead.

**Verify from a clean tree**:

```bash
rm -rf node_modules
pnpm install          # no @astryxdesign in the resolution output
pnpm build            # succeeds with NO manual pre-build step
pnpm typecheck && pnpm lint && pnpm test:coverage && pnpm test:e2e

grep -ri astryx . --exclude-dir=node_modules --exclude-dir=.git
# expect: matches only in docs/decisions/ and specs/003-shadcn-ui-migration/
```

**Done when**: the grep is clean, a clean install and build succeed with no pre-step, the ADR is
written, and the constitution is at 2.0.0 with a Sync Impact Report.

---

## Feature-level acceptance

Map back to the spec's success criteria before closing issue #33:

| Criterion | How to confirm |
| --- | --- |
| SC-001 visual parity | Computed-style comparison, both routes, both schemes |
| SC-002 accessibility | Zero axe violations; 4.5:1 verified on the five contrast-critical tokens |
| SC-003 coverage | `pnpm test:coverage` at or above 90% |
| SC-004 structure | Every component directory has a test and a barrel |
| SC-005 no references | The final grep is clean |
| SC-006 stock jsdom | Only the justified `matchMedia` polyfill remains, with a correct comment |
| SC-007 performance | Deployed Lighthouse at or above baseline |
| SC-008 clean build | `rm -rf node_modules && pnpm install && pnpm build` with no pre-step |
| SC-009 less raw markup | Raw element count below the 84 baseline, each removal replaced by a component |
