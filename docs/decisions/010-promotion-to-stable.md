# 010. What earns a component `stable`

Date: 2026-09-29. Status: accepted.

## Context

Every component carries `@status experimental | stable | deprecated` in its JSDoc, and the manifest
fails to build without one. The Status page says what `stable` means: the props, tokens and `data-*`
attributes are a contract, and removing or renaming one is a major (principle 9). It says what
`experimental` means only by contrast: shipped and tested, but the API may still change in a minor.

What it does not say is how a component moves from one to the other. When the Status page was built
(2026-09-15) tiers 1 to 4 were marked `stable` and tier 5 `experimental`, because tier 5 was the one
on React Aria (record 001). That was a line drawn by build order, not by evidence. Since then every
new component has shipped `experimental` from the scaffold, and seventeen now carry it: Combobox,
DatePicker, Picker and the rest of the React Aria tier, and also Divider, Link, Avatar and Chip,
which have no vendor and no keyboard model at all. Nothing written says what any of them has to do
to leave.

The status did its job at least once. Record 008 renamed the React Aria `Table` to `DataGrid` and gave
`Table` to a plain `<table>`, a break in every name the component had. It was acceptable in a minor
only because the component was `experimental`, and it was found only because bitepals tried to use
the grid in production and could not. That is the pattern this record writes down: the API is not
known to be right until a real consumer has used it, and the status has to stay open until then.

## Decision

**`stable` is a commitment: pulp will not break the component's public API without a major version.
`experimental` is the absence of that commitment.** Nothing else distinguishes them: an
experimental component is shipped, tested, themed and documented to the same bar as a stable one.

The public API is what a consumer writes against: the props and their types, the part names (both
`Menu.Trigger` and the flat `MenuTrigger`), the entry point, the `data-*` attributes, and the
component token names.

A component is promoted when **all five** of these hold:

1. **A settled API.** At least one release has gone out since the component's public surface last
   broke. A release that renamed a prop, removed a part or narrowed a type restarts the count. The
   evidence is `packages/react/api.snapshot.txt`, which pins every prop, part, type and default:
   the component's lines there did not change across the most recent release.
2. **Proven by a real consumer.** It is used in production by at least one real consumer (bitepals,
   today), not a story, a test or the consumer fixture, and that use surfaced no change to its API. If
   it did surface one, that change ships first and restarts criterion 1, as record 008 did for
   `DataGrid`.
3. **Verified accessibility.** Its axe checks pass: the `axe` case in `Name.test.tsx` and the four
   brand × scheme matrix stories in `pnpm test:storybook`. A complex component also gets a manual
   review beyond axe, with the keyboard alone and with a screen reader (VoiceOver on Safari at
   least), covering every interaction its `@accessibility` block claims. Complex means one that owns
   focus or a keyboard model: the React Aria tier (record 001), Menu (record 004), Tabs, Dialog,
   Sheet, Toast.
4. **A complete token contract.** `tokens/component/<kebab-name>.json` defines the component's
   visual values, every one referencing the semantic tier, and the stylesheet holds no literal and
   no primitive. A vendor the component themes has every visual variable mapped from a token.
5. **Complete documentation, from JSDoc.** The prose that says when to use it, `@do` and `@dont`
   (the manifest treats them as optional; promotion does not), and an `@accessibility` block that
   says what the component guarantees and what it leaves to the consumer. The Docs page and the
   Status page render from that block, so nothing is written twice.

**How a promotion ships.** One pull request changes `@status experimental` to `@status stable` and
nothing else about the component. Its description walks the five criteria with the evidence for
each: the release it has been unchanged since, the consumer page that uses it, who ran the manual
review and with which screen reader and browser. Its changeset is a minor that says "`Name` is
stable", so the promotion is visible in the release notes.

**Before 1.0.** "A major" is read as principle 9 reads it before 1.0: the next minor (0.6 → 0.7),
with a changeset that says so in its first line.

**There is no demotion.** A stable component that turns out wrong is deprecated for one major
beside its replacement (principle 9), never moved back to `experimental`: that would be the break the
commitment rules out.

## Consequences

- The seventeen experimental components have a way out, and it is per component, not per tier.
  Divider or Link could qualify in one release; DatePicker waits for a consumer and a screen reader
  review.
- Criterion 2 makes bitepals the gate for every promotion for now. A component no consumer has a use
  for stays experimental until one does, which is the honest status: nobody has tested its API.
- Heatmap fails criterion 4 today: record 009 kept the vendor's day sizes (`12px`, `20px`) as
  literals. Promoting it means the dimension token that record declined to invent.
- The thirty components marked `stable` on 2026-09-15 keep their status: the commitment is already
  made, and breaking it to re-audit them would be the thing it forbids. Where one falls short of a
  criterion (a missing `@do`, a literal), the gap is fixed in place, never by an API change.
- Criteria 2 and 3 are judgement, recorded in the pull request; criterion 1 is read off the API
  snapshot's history, which also shows the status flip. Only part of 4 and 5 is checked today (the
  token tests check references; the manifest requires `@accessibility`). Having the manifest
  build fail a `stable` component without `@do` and `@dont` would make criterion 5 a guardrail.
- **Revisit when** pulp reaches 1.0 (the pre-1.0 clause goes), or when a second real consumer
  appears: then criterion 2 may ask for two.
