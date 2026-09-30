# 013. Semantic tokens state their role, and component tokens read a compatible family

Date: 2026-09-30. Status: accepted.

## Context

Principle 8 read as if guardrails replaced review. They replace part of it. The rules CI enforces
cover the syntactic layer of the token discipline: no inline style, no literal, components read the
semantic tier and never a primitive (tier tests), output matches source (drift check), text pairs
meet AA (contrast test), a brand override is valid and rare (record 007).

None of them sees a component that paints an action background with a text colour. That reference
is a valid token of the right tier, with no literal and no drift, and it passes every check. It is
still a design error, and it is a fragile one: the day the text colour is retuned for contrast, the
button changes colour. Before this record the only thing that could catch it was a reviewer who
already knew what `--color-text-muted` is for: 86 of the 114 semantic tokens had no description of their own.

## Decision

**Two changes: move the detectable band of this error into a test, and write down the intent for
the rest.**

### 1. Families and slots (`packages/tokens/scripts/roles.mjs`)

Every semantic colour belongs to one **family**, read from its name:

| Family | Semantic colours | What it is |
| --- | --- | --- |
| surface | `surface.*` | the ground things sit on |
| tint | `*-subtle`, `action.primary-quiet` | a faint fill that stays near the surface |
| fill | `action.primary*`, `action.secondary*`, `status.<tone>` and its states, `accent.N`, `data.sequential.N` | a solid area of colour |
| scrim | `overlay.backdrop` | what covers the page behind a modal |
| ink | `text.*`, `action.text`, `status.<tone>-text` | text and icons on a surface |
| on-ink | `text.on-*`, `status.on-*`, `accent.on-N` | text and marks on a fill |
| line | `border.*` | edges and rules |

Every component colour token has a **slot**, read from the last slot word in its own name (`-bg`,
`-fg`, `-border`, `-focus-ring`, `-thumb`…; `item-bg-hover` is a bg). Each slot accepts some
families:

| Slot | Accepts | Why the others are out |
| --- | --- | --- |
| bg | surface, tint, fill, scrim | ink and line colours are tuned for strokes and text; an area in them is the error this record is about |
| fg | ink, on-ink | a surface, fill or line colour is not promised to read as text on anything |
| border | line, ink, fill | a tone may colour an edge (an invalid field, a subtle Badge). A surface or tint may not: it is built to sit at the surface's level, so a stroke in it vanishes |
| mark | surface, fill, ink, on-ink | a thumb, dot, check or indicator is drawn on a fill or a surface; a line, tint or scrim does not stand out from either |
| focus-ring | `--color-border-focus` only | one focus colour, everywhere |

The mapping is deliberately coarse. It separates what a colour is *for* (an area, a stroke, text),
which the names already encode, and stops there. A finer mapping (which fill, which ink) would be a
second copy of every component's design, and it would be wrong as soon as a component changes.

Two lists sit beside the mapping, each entry with its reason:

- `SLOT_OF` places the four names whose words do not say their slot (`--divider-color`) or say the
  wrong one (`--spinner-track` is the border of a ring, not an area). That is a classification, not an
  exception.
- `EXCEPTIONS` lists references that break the mapping on purpose: four today. `--chip-action-border`
  matches the chip's tint so its edge disappears. `--sheet-handle-bg` is a bar that has to be seen,
  so it takes the strong line colour. The switch track, unchecked, reads `border.strong` and, on
  hover, `text.faint`. That one is less an exception than a finding. The semantic tier has no name for
  an unchecked control fill, so the switch borrows a line colour and a text colour. It is logged in
  `tasks.md` as a missing semantic token, the fix record 007 names for a repeated override.
  An entry that stops being needed fails the test, so the list cannot rot.

The test runs over every brand's component tokens, so a brand override (record 007) is held to the
same slot as the base token it replaces. A new semantic colour that fits no family, or a component
colour whose name has no slot word, fails until it is placed. Placing it is the moment someone
decides what it is for. The failure names the token, its slot, the family it read, that token's
role, and the families the slot expects.

This is the semantic counterpart of the contrast test. That test turned "readable" into a ratio;
this one turns "painted with the right kind of colour" into a family check. Neither proves the
design is good. Each removes one band of error from what review has to look for.

### 2. Roles, stated once (`semantic/pulp.json`)

Every semantic token states the role it exists for, as its DTCG `$description`. A step of a scale
(`space.3`, `font.size.lg`, `accent.on-4`) may leave that to its group. The roles live in the base
brand's file, the same brand that carries the component tier (record 007). A role belongs to the name
and a value to the brand. So another brand states no role at all, and every brand, the base included,
says why *its value* is what it is in a `note` under `$extensions["com.pearpages.pulp"]` ("Ink, not
white: white on the brand orange is 2.8:1"). Before this record 23 descriptions were copied between the
two brand files. They are gone, and a test fails if a brand other than the base carries a
`$description`.

The build copies the role to every brand in `tokens.json` (`role`, and `note` where the brand has one).
`description` stays, as role and note together, so a reader of the old field loses nothing. The Tokens page shows it under each name, and an agent reads the same
field, as the component manifest carries each component's JSDoc (principle 11). A wrong-but-valid
choice then sits next to a sentence that says what the token is for. That is how the error that no
test reaches becomes visible to a reviewer or an agent.

## Consequences

- Principle 8 says what guardrails are for: taking the mechanical layer out of review, not replacing it.
- `tokens.json` semantic entries gain `role` and `note`; `description` stays, as the two joined. Nothing
  is removed. It ships as a tokens minor with a changeset.
- Writing the roles surfaced one reuse: the tooltip's maximum width reads `size.menu-width`. Its role
  now says so (one width for narrow floating panels), rather than claiming it for menus alone.
- Adding a semantic token now costs a sentence of role, in the base brand only. Adding a component
  colour token costs a slot word in its name.
- A tool that reads one brand's DTCG file on its own sees the roles only in the base brand's file.
  One source was worth that; `tokens.json` gives every brand the role.
- The check cannot see which fill or which ink: a hover that reads the pressed colour, or muted text
  where body text belongs, still passes. That band stays with review, now against a stated role.

## Revisit when

- The switch-track semantic token is added: remove its two exceptions.
- `EXCEPTIONS` grows past a handful. Like overrides (record 007), a pattern of exceptions means the
  semantic tier is missing a name, or the mapping is wrong.
- A renderer outside the DOM (record 012) needs the families: they are data about the semantic tier,
  and would move from `roles.mjs` into the tokens' `$extensions`.
