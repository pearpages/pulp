# 004. Menu keeps its own interaction model, reviewed against React Aria

Date: 2026-09-14 (tier 5). Status: accepted, with migration criteria.

## Context

`Menu` (tier 4) implements the WAI-ARIA menu button pattern by hand: roving focus,
wraparound, Home/End, single-character typeahead, Enter/Space/click select, Escape and Tab
close with focus return. Record 001 makes React Aria the layer for complex widgets, so the
question is whether Menu should move too. This is the review it promised.

## What React Aria's Menu has that pulp's does not

| Capability | pulp Menu | React Aria Menu |
| --- | --- | --- |
| Arrow, Home, End, wraparound, disabled skipped | yes | yes |
| Typeahead | one character, jumps to next match | multi-character buffer with timeout |
| Selection (checkbox and radio items, `aria-checked`) | no | yes |
| Sections with headings | no | yes |
| Submenus | no | yes |
| Long press to open, touch and virtual-cursor handling | click only | yes |
| Return focus, Escape, outside dismiss | yes | yes |
| Autocomplete inside a menu | no | yes |

Everything pulp's Menu claims, it does, and its tests pin it. What it lacks are features,
not correctness.

## Decision

Menu stays as it is. Migrating now would replace tested code with equivalent behaviour
and change nothing a consumer can see. The public API (`Menu`, `Menu.Trigger`,
`Menu.Content`, `Menu.Item`, `Menu.Separator`, `data-placement`, `tone`) is pulp's, so
the swap stays internal when it happens.

Migrate to React Aria's Menu the first time any of these is needed: selectable items,
sections, submenus, or multi-character typeahead. Do it as one change that keeps
`Menu.test.tsx` green; add tests for the new capability alongside.

## Consequences

Two interaction stacks coexist (record 001). The `internal/useRovingFocus.ts` hook stays
in use by Tabs and Accordion regardless, so nothing is orphaned by a later migration.
