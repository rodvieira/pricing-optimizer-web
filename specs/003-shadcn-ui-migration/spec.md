# Feature Specification: Replace Astryx with shadcn/ui and restructure components

**Feature Branch**: `003-shadcn-ui-migration`

**Created**: 2026-07-26

**Status**: Draft

**Tracking Issue**: [#33](https://github.com/rodvieira/pricing-optimizer-web/issues/33)

**Input**: Replace Astryx (`@astryxdesign/core` 0.1.x, Meta's StyleX-based design system) with
shadcn/ui + Tailwind, restructure components into folder-per-component with colocated tests
and index barrels, minimize raw HTML in favor of components, hold the line on state and layer
discipline, and delete every artifact the migration makes dead.

## Why this change

The design system is the one part of this stack where originality costs more than it returns.
Five concrete problems, all already observed in this repo rather than hypothesised:

1. **A recurring accessibility bug class.** Contrast failures have shipped more than once
   (informational text at 4.19:1 and at 2.23:1, against a 4.5:1 requirement). `CLAUDE.md`
   carries a dedicated "Color-contrast discipline" section that exists only because this kept
   recurring.
2. **The test suite cannot run on stock jsdom.** `test/setup.ts` hand-rolls `window.matchMedia`
   and `HTMLDialogElement.prototype.showModal`/`close` purely because the design system reaches
   for browser APIs jsdom does not implement.
3. **A theme build step nothing can verify.** Four generated artifacts are committed because
   the production build never regenerates them. No check confirms the committed output still
   matches its source, so editing the theme and forgetting to rebuild fails silently.
4. **A dev-server bundling quirk** that silently dropped theme CSS after repeated hot reloads,
   which cost real debugging time before being confirmed harmless.
5. **Pre-1.0 dependency risk** on a `0.1.x` component library with no stability guarantee.

For a portfolio piece a reviewer evaluates in minutes, the recognisable, widely-audited choice
is worth more than the novel one. The backend's Clean Architecture, the contract-first codegen,
and the observability work already carry the interesting part of the story.

## Scope: the actual surface

The migration touches **16 distinct imports across 14 source files**, plus the stylesheet entry
point and the generated theme directory. An earlier estimate of "seven components" was wrong;
multi-line import statements hid roughly half the surface. The verified list:

| Current import | Files | Replacement route | Risk |
| --- | --- | --- | --- |
| `Button` | 7 | shadcn/ui `Button` (Radix) | Low |
| `Text` | 4 | **No shadcn equivalent.** Needs an owned typography component preserving the `display-3`/`body`/`label`/`supporting` scale and the `color` prop | Medium |
| `Banner` | 2 | shadcn/ui `Alert` | Low |
| `Card` | 2 | shadcn/ui `Card` | Low |
| `Skeleton` | 2 | shadcn/ui `Skeleton` | Low |
| `Theme`, `neutralTheme` | 2 | Owned provider writing `data-theme` plus CSS custom properties | **High** |
| `Badge` | 1 | shadcn/ui `Badge` | Low |
| `Dialog`, `DialogHeader` | 1 | shadcn/ui `Dialog` (Radix) | Medium |
| `Tab`, `TabList` | 1 | shadcn/ui `Tabs` (Radix) | Medium |
| `Layout`, `LayoutContent` | 1 | Plain layout composition, no library needed | Low |
| `CodeBlock` | 1 | **No shadcn equivalent.** Currently supplies syntax highlighting, a copy button, line numbers, and a title for the export preview | **High** |
| `defineTheme` | 1 | Removed with the theme source | High |

Two items carry real unknowns and are raised as clarifications below: the `CodeBlock`
replacement and how shadcn's vendored-source model reconciles with this repo's
folder-per-component convention.

Note: `useTheme` from the design system is **not** imported anywhere. The repo already owns its
own `useThemeMode`. The comment in `test/setup.ts` naming `useTheme` is stale, though the
`matchMedia` polyfill itself is still load-bearing while `<Theme>` remains mounted.

### The design-token layer is a larger surface than the components

Component imports are the visible half of the dependency. The larger half is the **token
layer**: `@astryxdesign/core/tailwind-theme.css` bridges the design system's semantic tokens
into Tailwind utilities, and the app uses **63 occurrences of 14 such utilities across 19
files**, none of which appear in any import statement:

| Utility | Uses | Utility | Uses |
| --- | --- | --- | --- |
| `text-secondary` | 12 | `bg-surface` | 3 |
| `border-border` | 12 | `bg-border` | 3 |
| `bg-muted` | 9 | `bg-card`, `text-accent`, `text-error` | 2 each |
| `text-primary` | 7 | `bg-body`, `border-error`, `text-warning`, `text-success` | 1 each |
| `border-border-strong` | 7 | | |

Three further responsibilities currently sit with the design system and have no obvious owner
once it is removed:

1. **`color-scheme`.** `<Theme>` sets it from `data-theme`. The bespoke tokens in `globals.css`
   use `light-dark()`, which resolves against `color-scheme`. Remove `<Theme>` without taking
   this over and both bespoke accent colors silently resolve to their light values in dark mode.
2. **`data-astryx-theme="pricing-optimizer"` on `<html>`.** The generated theme CSS is wrapped
   in `@scope ([data-astryx-theme="pricing-optimizer"])`, so every token resolves only inside
   that attribute.
3. **A heading reset.** The generated CSS ships a `@layer reset` block giving `h1` through `h6`
   their font family, size, weight, and line height. Nothing else in the app sets those.

**Consequence for sequencing**: the token layer must be taken over in its own increment, before
the design system is uninstalled and separately from the component swaps. A single pull request
that both re-founds the design tokens and deletes the old system would be unreviewable. This is
why the plan carries six increments rather than the five user stories below suggest, splitting
Story 5 into a token-and-theme handover followed by the purge.

## Constitution conflict (amendment deliberately deferred to the end)

**This feature contradicts the governing constitution as currently written.** Two places:

- **Principle III is titled "Design-System Discipline (Astryx)"** and states that Astryx "is
  the component library," that new UI "MUST compose existing Astryx components," and that "no
  second dark-mode provider may be added." It also names `CodeBlock` specifically as a reason
  the library was chosen.
- **Additional Constraints (Stack & Cost)** lists Astryx among the fixed core stack items.

Per the constitution's own Governance section, a backward-incompatible redefinition of a
principle requires a **MAJOR version bump (1.2.0 to 2.0.0)** with a Sync Impact Report.

**Decision (2026-07-26): the amendment happens as the final increment, after the migration is
complete, not before it.** The rationale is that the amended Principle III should describe the
design-system discipline that actually exists once shadcn/ui is in place (how vendored
primitives are governed, where the owned typography and code-preview components live, who owns
`data-theme`), rather than being written speculatively and then corrected. The same amendment
will fold in a pre-existing drift: **Principle II still describes `domain/`, `features/`,
`components/ui/`, and `lib/api/`**, which ADR-0016 superseded with
`app -> views -> features -> entities -> shared`.

**Consequences of deferring, which the plan must account for:**

- Increments 2 through 5 knowingly diverge from Principle III while in flight. This is a
  sanctioned, time-boxed divergence recorded here, not an oversight.
- The `pr-reviewer` agent reviews against this constitution and **will** flag Astryx removal as
  a Principle III violation on every increment. Each pull request description MUST link this
  specification and issue #33 so the finding is dismissed as expected rather than
  re-investigated or "fixed" by reverting.
- The final increment is not optional. Leaving the constitution describing a library the repo no
  longer uses would be worse than the original inconsistency, because it would be silent.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Components get tested and consistently structured (Priority: P1)

A maintainer opening any component finds it in a predictable place: a folder named after the
component, holding the component, its test, and a barrel declaring what leaves it. Nothing is
untested merely because it looked too small to bother with.

**Why this priority**: This ships value on its own and de-risks everything after it. Five of
nine files in `shared/ui/` currently have **no test at all** (`color-accent-column`,
`color-dot`, `eyebrow`, `panel-header`, `price-display`), and `shared/ui/` has no barrel.
Writing those tests *before* the components get rewritten is what makes the rest of this
migration verifiable rather than hopeful.

**Independent Test**: Restructure and add the missing tests with the design system still in
place. The suite passes, coverage holds at or above its floor, and no rendered output changes.

**Acceptance Scenarios**:

1. **Given** a component that previously sat as a single flat file, **When** a maintainer looks
   for it, **Then** it lives in a folder named after it containing the component, a test, and a
   barrel.
2. **Given** the five previously untested shared components, **When** the suite runs, **Then**
   each has a test exercising its real branching behavior, not a smoke render.
3. **Given** the restructure is complete, **When** the layer-boundary lint runs, **Then** no
   import direction violation is reported and every cross-layer import resolves through a barrel.

---

### User Story 2 - Presentational primitives no longer come from Astryx (Priority: P1)

An end user loads the landing page and Studio and sees exactly what they saw before: identical
type scale, spacing, colors, and states in both light and dark. Nothing in the interface signals
that the component library underneath changed.

**Why this priority**: The largest share of the surface (`Button` across 7 files, `Text` across
4, plus `Badge`, `Banner`, `Card`, `Skeleton`, `Layout`) and the lowest risk per swap. Doing it
before the interactive and theme work keeps each later step small.

**Independent Test**: Swap the presentational primitives while the theme provider stays as it
is. Compare rendered output against the design mock in both color schemes; the suite and
accessibility checks stay green.

**Acceptance Scenarios**:

1. **Given** any view using the replaced primitives, **When** compared against
   `docs/design/Pricing Optimizer.html`, **Then** computed typography, spacing, and color match
   within the tolerance the existing parity checks already use.
2. **Given** the typography scale had four named variants and a color prop, **When** the owned
   replacement renders, **Then** every variant and color combination previously used still
   resolves to the same computed styles.
3. **Given** a reviewer runs the accessibility checks, **When** they complete, **Then** zero
   violations are reported and all informational text meets 4.5:1.

---

### User Story 3 - Interactive components no longer need browser polyfills (Priority: P2)

A user opens the export dialog, switches between export formats, closes it with the keyboard,
and everything behaves as before. A maintainer running the test suite no longer needs
hand-written stubs for browser APIs.

**Why this priority**: Smaller surface than Story 2 but higher behavioral risk (focus
management, keyboard handling, modal semantics). Its completion is what allows the
`HTMLDialogElement` polyfill to be deleted, which is a concrete, checkable win.

**Independent Test**: Replace the dialog and tab components, then remove the
`HTMLDialogElement` polyfill and confirm the suite still passes rather than assuming it will.

**Acceptance Scenarios**:

1. **Given** the export dialog, **When** a keyboard-only user opens it, moves through the format
   tabs, and dismisses it, **Then** focus is trapped while open, returns to the trigger on
   close, and Escape closes it.
2. **Given** the `HTMLDialogElement` polyfill is deleted, **When** the suite runs, **Then**
   every dialog test passes without it.
3. **Given** the accessibility checks run against the open dialog, **When** they complete,
   **Then** zero violations are reported.

---

### User Story 4 - The export preview still reads as code (Priority: P2)

A user exporting a variation sees the generated JSX, HTML, or Stripe config presented as
readable code with a working copy button, the same as before.

**Why this priority**: Isolated to one component, but the replacement has no drop-in equivalent
and introduces a dependency decision (see Clarification 1). Separating it keeps that decision
from blocking the rest of the migration.

**Independent Test**: Replace only the code preview and verify each of the three export formats
renders readably and copies correctly.

**Acceptance Scenarios**:

1. **Given** each of the three export formats, **When** the preview renders, **Then** the
   content is presented as code and remains readable in both color schemes.
2. **Given** the preview is displayed, **When** the user activates copy, **Then** the full
   exported content reaches the clipboard unchanged.
3. **Given** a long export, **When** it overflows, **Then** it scrolls within its own container
   without the page scrolling sideways.

---

### User Story 5 - Astryx is gone, with nothing left behind (Priority: P1)

A maintainer searching the repository for the old design system finds nothing outside the
decision records that explain why it was removed. The install is smaller and the theme has one
owner.

**Why this priority**: This is the actual goal of the feature. It depends on Stories 2, 3, and 4
completing first, so it is sequenced last despite its priority.

**Independent Test**: Remove the theme provider, the theme source, the generated artifacts, the
build script, and the dependencies, then run every gate plus a repository-wide search.

**Acceptance Scenarios**:

1. **Given** the migration is complete, **When** the repository is searched case-insensitively
   for the old library name, **Then** matches appear only in decision records and this
   specification.
2. **Given** the toggle is used, **When** a user switches color scheme, **Then** behavior is
   unchanged: binary light and dark, one owner of the theme attribute, no flash of the wrong
   scheme before hydration, and an unset preference still following the operating system live.
3. **Given** the theme build script and its generated output are deleted, **When** a clean
   production build runs, **Then** it succeeds with no missing-asset or missing-style errors.
4. **Given** the dependency manifest and lockfile, **When** inspected, **Then** no entry for the
   removed library or its theme package remains.

---

### Edge Cases

- **A user with an unset color-scheme preference on a dark-OS machine.** The known past bug was
  a toggle whose icon tracked raw stored state instead of the resolved scheme. The replacement
  must resolve before it renders.
- **A user who loads a page before scripts hydrate.** The pre-hydration attribute write must
  survive the theme handover, or the wrong scheme flashes.
- **A returning user with a previously persisted preference.** Existing stored values must keep
  working, or every returning user silently loses their choice.
- **A generation still streaming when a component swap changes loading placeholders.** Skeleton
  and streaming states must stay visually stable while text arrives token by token.
- **Text longer than the mock's sample data.** The design mock uses fixed strings; real generated
  copy varies in length, which has broken layout parity before.
- **A reduced-motion user.** Existing motion behavior must not regress into unconditional
  animation.
- **An export whose content is empty or a single line.** The code preview must not collapse or
  misalign.

## Requirements *(mandatory)*

### Functional Requirements

**Replacement and parity**

- **FR-001**: The system MUST render the landing and Studio routes with no perceptible visual
  difference from the current implementation in both light and dark schemes, verified against
  `docs/design/Pricing Optimizer.html`.
- **FR-002**: The system MUST preserve the existing typography scale, including every named
  variant and color combination currently in use, through an owned component rather than
  scattered utility classes at each call site.
- **FR-003**: The system MUST keep color-scheme behavior identical: binary light and dark, a
  single owner of the theme attribute, no second color-mode provider, no flash of the wrong
  scheme before hydration, persisted preferences honored, and an unset preference following the
  operating system live without exposing a third toggle state.
- **FR-004**: The system MUST preserve keyboard and focus behavior for every interactive
  component replaced, including focus trapping and restoration for modal content.
- **FR-005**: The system MUST continue to present exported content as readable code with a
  working copy action for all three export formats.

**Structure and discipline**

- **FR-006**: Each component MUST live in a directory named after it, containing the component,
  its test, and a barrel that declares its public surface.
- **FR-007**: Every component directory MUST contain a test exercising the component's own
  branching behavior. The five currently untested shared components MUST be covered.
- **FR-008**: The system MUST reduce raw markup by promoting repeated ad-hoc structures into
  components. Non-semantic layout wrappers MAY remain; the target is eliminating repetition, not
  reaching zero elements.
- **FR-009**: The pure domain layer MUST remain free of framework imports.
- **FR-010**: The layer dependency direction MUST hold, enforced by the existing per-layer import
  restrictions. No lower layer may import from a higher one.
- **FR-011**: The system MUST prefer derived over duplicated state. No new state may mirror a
  value already derivable from existing state.

**Removal**

- **FR-012**: The system MUST remove the generated theme artifacts, the theme source, the theme
  build script, and all three design-system packages from the dependency manifest and lockfile.
- **FR-013**: The system MUST remove the `HTMLDialogElement` polyfill, verified by deletion
  followed by a passing suite rather than by assumption. **Corrected 2026-07-26 by Phase 0
  research**: the `matchMedia` polyfill MUST be **kept**. It serves two consumers, the old design
  system *and* this repo's own color-mode provider, which reads `prefers-color-scheme` to follow
  the operating system until the user chooses explicitly. Only its stale comment is corrected.
- **FR-014**: The system MUST remove the removed library's stylesheet import and any layer or
  bridge declarations left orphaned by it.
- **FR-015**: The system MUST remove any wrapper component that existed only to adapt the old
  library's interface and has no remaining consumer.
- **FR-016**: A case-insensitive repository-wide search for the removed library MUST return
  matches only in decision records and this specification.

**Process**

- **FR-017**: The constitution MUST be amended with a MAJOR version bump as the final increment,
  redefining the design-system principle and the stack constraint to describe the design system
  that actually shipped, and correcting Principle II's stale folder structure in the same pass.
  Until then, each pull request MUST link this specification so the expected Principle III
  divergence is recognised as sanctioned.
- **FR-018**: Each increment MUST pass a `pr-reviewer` review against its own branch diff before
  the branch is pushed or a pull request opened, with blocking findings fixed first.
- **FR-019**: Every increment MUST leave all gates green: type check, lint, unit tests at the
  coverage floor, production build, and the end-to-end plus accessibility suite.
- **FR-020**: The decision MUST be recorded as an ADR superseding the original design-system
  choice, covering context, decision, rejected alternatives, and consequences.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer comparing the interface before and after, in both color schemes,
  identifies no unintended visual difference on either route.
- **SC-002**: Zero automated accessibility violations, with every piece of informational text
  meeting the 4.5:1 contrast requirement.
- **SC-003**: Test coverage remains at or above the 90% floor for statements, branches,
  functions, and lines.
- **SC-004**: 100% of component directories contain both a test and a barrel.
- **SC-005**: Zero references to the removed library remain outside decision records.
- **SC-006**: The test suite carries no browser API stub that exists only to serve the removed
  library. The one remaining stub (`matchMedia`) is justified by this repo's own color-mode
  provider and documented as such.
- **SC-007**: Performance does not regress against current production scores (99 landing, Studio
  at or above the 95 target).
- **SC-008**: A clean install and production build succeed from an empty dependency tree with no
  manual pre-build step.
- **SC-009**: Repeated ad-hoc markup is measurably reduced from the current 84 raw elements, with
  every removal replaced by a component rather than deleted outright.

## Assumptions

- **The constitution is amended last, by decision.** `/speckit-constitution` runs as the final
  increment and bumps to 2.0.0, so the amended text describes the design system that actually
  shipped. Increments in flight diverge from Principle III by sanction, not by accident.
- **Incremental delivery, one pull request per user story.** The instruction that each
  implementation gets a review pass implies several increments rather than one large change.
- **Visual parity is verified the way this repo already verifies it**: computed-style comparison
  against the design mock, as an earlier parity pass established, plus the existing end-to-end
  suite.
- **The warm-cream palette and the heading typeface stay.** This is a dependency swap, not a
  redesign; the mock remains the reference.
- **The mocked backend stays the basis for automated end-to-end runs**, with real-stack
  verification done once manually as before.
- **Localization is out of scope.** Issue #34 covers it and is explicitly sequenced after this
  work, because this refactor rewrites nearly every component holding a user-facing string.
- **Backend and contract are untouched.** No change to `openapi.yaml` or the generated client.
- **Existing persisted color-scheme values remain compatible**, so returning users keep their
  preference across the handover.

## Clarifications

Both open questions were resolved on 2026-07-26.

### Resolved 1: Code preview uses a lightweight runtime highlighter

**Question**: `CodeBlock` renders the export preview with syntax highlighting, a copy button,
line numbers, and a title. shadcn/ui has no equivalent, and the constitution names `CodeBlock`
specifically as a reason Astryx was chosen. What replaces it?

**Decision**: a lightweight runtime highlighter (`prism-react-renderer`), wrapped in an owned
`shared/ui` component.

**Rationale**: it keeps the visual polish on the export screen, which is the most
screenshot-worthy view in a portfolio piece, at a fraction of Shiki's install weight. Shiki was
rejected as disproportionate for three languages (`tsx`, `html`, `json`). Dropping highlighting
entirely was rejected as a visible downgrade on the one screen most likely to be looked at.

**Implications the plan must carry**: the highlighter's theme must be driven by the existing
palette rather than a bundled preset, so both color schemes stay correct; and the wrapper owns
the copy button, line numbers, and title that Astryx previously supplied, since the library
provides only tokenisation.

### Resolved 2: Vendored primitives stay flat and coverage-excluded

**Question**: shadcn/ui is not a dependency; its CLI copies source into the repo as flat files
you then own. Do vendored primitives follow the folder-per-component convention, given every
component directory must carry a test and the coverage floor is global?

**Decision**: vendored primitives stay flat in their own dedicated directory and are excluded
from coverage. Only owned components and compositions follow folder-per-component with a
colocated test and a barrel.

**Rationale**: re-running the shadcn CLI to pick up an upstream fix must not fight the repo's
structure, and hand-writing tests for third-party primitives would mean redoing that work on
every update. This matches the exclusion rationale already established in `vitest.config.ts`,
where generated code and pure type declarations are excluded for the same reason: they are not
this repo's logic to test.

**Implications the plan must carry**: the boundary between "vendored, flat, excluded" and
"owned, foldered, tested" must be written into the ADR and the coverage exclude list, not left
as tribal knowledge, because it is the one place where two conventions legitimately coexist.
Anything that wraps or composes a vendored primitive is owned code and is therefore tested.
