# Specification Quality Checklist: Replace Astryx with shadcn/ui and restructure components

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-07-26
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

### Deviations from the default checklist, deliberately accepted

Two items are marked pass with a qualification, because this feature is an internal refactor
rather than a user-facing capability. The checklist is written for the latter.

- **"No implementation details"** and **"Written for non-technical stakeholders"**: the spec's
  narrative, user stories, requirements, and success criteria are all framed around observable
  outcomes (visual parity, keyboard behavior, accessibility, no regression). Named libraries
  appear only in the "Scope: the actual surface" table and the two clarification option tables,
  where naming them *is* the content: the whole point of the feature is which library the repo
  depends on. Suppressing those names would make the document useless. The stakeholder for a
  dependency migration is a maintainer, and the spec is readable by a non-specialist reviewer
  down to that table.
- **"Success criteria are technology-agnostic"**: SC-006 and SC-008 reference the test
  environment and the build. Both are stated as outcomes ("runs with zero hand-written stubs",
  "succeeds with no manual pre-build step") rather than as prescriptions of how to get there.

### Clarifications resolved 2026-07-26

Both open questions were answered, so nothing blocks `/speckit-plan`:

1. **Code preview**: a lightweight runtime highlighter (`prism-react-renderer`) wrapped in an
   owned `shared/ui` component. Shiki rejected as disproportionate for three languages; dropping
   highlighting rejected as a visible downgrade on the most screenshot-worthy screen.
2. **Vendored primitives**: stay flat in a dedicated directory, excluded from coverage. Only
   owned components follow folder-per-component with a test and a barrel. The boundary goes in
   the ADR and the coverage exclude list.

### Constitution amendment: deferred by decision, not a spec defect

- Principle III mandates the very library this feature removes, and the stack constraint names
  it. **Decision (2026-07-26): the MAJOR amendment (1.2.0 to 2.0.0) runs as the final increment,
  not before**, so the amended text describes the design system that actually shipped rather than
  a speculative one. Captured in FR-017, the Assumptions, and its own spec section.
- **Carried risk the plan must handle**: increments 2 through 5 knowingly diverge from Principle
  III, and `pr-reviewer` reviews against that constitution, so it will flag Astryx removal on
  every increment. Each pull request must link the spec and issue #33 so the finding is dismissed
  as expected rather than re-investigated or reverted. The final amendment increment is
  mandatory, not optional.
