# 006. Primitive names collide with Tailwind's default theme: declare the layer order, prefix at 1.0

Date: 2026-09-20 (group 11). Status: accepted for the layer order. The prefix is deferred to the
first major, with the trigger below.

## Context

bitepals is a Next.js app on Tailwind v4 that imports `tokens.css` and `theme.css`. Tailwind ships
its own default theme of custom properties, and **48 of the names pulp emits are also Tailwind's**
(measured 2026-09-20 against tailwindcss 4.3.0): `--radius-sm`, `--radius-lg`,
`--font-weight-medium`, `--font-weight-semibold`, and every step of
`--color-{neutral,red,green,blue,orange,teal,violet,pink}-N`. Six of those are new today: the accent
ramps of group 11 added teal, violet and pink to the pulp brand.

Every one of them is a **primitive**. Decision record 005 covers the bridge's own variables, which
are semantic and carry the `reference` keyword precisely so Tailwind emits nothing for them; it says
nothing about the tier underneath.

The collision is a cascade-layer race, and both orders are wrong in a different place:

- Tailwind's `theme` layer **after** `@layer tokens`: Tailwind wins, so pulp's own
  `--radius-surface: var(--radius-lg)` resolves to Tailwind's `0.5rem`. Every surface lost its
  corners in bitepals, with nothing failing anywhere.
- Tailwind's `theme` layer **before** `tokens`: pulp wins, so a Tailwind utility written against a
  default name reads a pulp value — `font-semibold` is pulp's semibold, `bg-red-500` is pulp's red.

Neither is a bug in either tool. pulp is claiming names in a shared global namespace.

## Decision

1. **The consumer declares the layer order, and pulp documents it**: `@layer reset, theme, tokens,
   …`, so pulp's primitives win and a component never resolves to a value pulp did not choose. This
   is what bitepals does today and it is now written next to `theme.css` in the tokens README. A
   consumer who prefers Tailwind's palette to pulp's can invert it knowingly; what it must not do is
   leave the order to first appearance and to the bundler, which is how the corners were lost.
2. **The primitive tier is prefixed (`--pulp-color-red-500`, `--pulp-radius-lg`) in the first
   major.** It is the real fix: the collision cannot happen, no consumer has to order anything, and
   **nobody who follows the rules breaks**, because a component may not read a primitive and the
   published API is the semantic tier (`scripts/public-tokens.mjs`, which lists no primitive). It is
   still a rename of every name in a shipped file, so it waits for the version where a rename is
   allowed to cost something.

## Consequences

- Until then, a Tailwind consumer that does not declare the order can silently repaint, in exactly
  the way `public-tokens.mjs` describes for a semantic rename: CSS drops nothing, nothing errors.
  The README paragraph is the whole mitigation, which is why it is a decision and not a note.
- A new primitive ramp is a new chance to collide. That is an argument for the prefix, not against
  the ramp: the accents were added on the semantic tier's terms and no component reads them.
- **Revisit when** 1.0 is planned, or earlier if a second Tailwind consumer hits it. The work is a
  prefix in `scripts/format.mjs` where the tier is decided, the primitive references in both brand
  files, and a changeset that calls it breaking.
