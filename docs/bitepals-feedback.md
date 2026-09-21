# What bitepals found using pulp 0.3.0: how to run group 11

Working notes for the session that builds group 11 of [`tasks.md`](../tasks.md). bitepals
(`~/Projects/bitepals`) moved its tokens and ten primitives onto pulp 0.3.0 on 2026-09-20. This is what
it ran into, in the order it blocks bitepals. Its own record is
`~/Projects/bitepals/docs/adrs/0007-pulp-design-system.md` (decisions) and
`~/Projects/bitepals/plans/pulp-migration-discussion.md` (the same list, from its side). Delete this
file when group 11 is done.

How to work: as in group 10. One item per commit on branch `bitepals-feedback`, the add-component skill
for anything new, `pnpm verify` green before each commit, one changeset each, tick the item with the
date. **Stop and ask Pere before** a change to a semantic token, to the primitive tier's names, or to a
public API that is already `stable`.

## Blocks a swap in bitepals

1. **An accent palette, and `accent` on Avatar and Chip.** bitepals colours a person's avatar and chip
   from a hash of their id: it is how friends are told apart in a list. Avatar and Chip take no colour,
   rightly (a literal cannot follow the scheme or be contrast-tested), so bitepals could not swap
   either. Ask: about eight categorical accent pairs at the semantic tier (`color.accent.1…8`, each a
   `light-dark()` fill plus its on-colour, in both brands, in the contrast tests) and
   `accent?: 1 | … | 8` on Avatar (initials background) and Chip. The consumer hashes to an index.
   Source to read: `apps/web/design-system/ui/components/{avatar,chip}/`, `stringToColor` in
   `apps/web/lib/`.
2. **Overlays on a phone.** bitepals kept its own Modal and BottomSheet because:
   - its overlays follow `window.visualViewport` (`--vvh`, `--vv-offset-top`) so a focused input stays
     above the iOS keyboard and form-accessory bar; `@pearpages/modals` has nothing like it. Source:
     `apps/web/design-system/hooks/use-visual-viewport-height.ts`, and how `modal.css` /
     `bottom-sheet.css` consume the two variables. This belongs in the vendor.
   - the vendor makes everything outside the dialog's portal `inert`. Is pulp's toast region exempt? A
     toast fired from inside a dialog ("Place removed · Undo") must stay pressable. Test it in a
     browser with both open; fix or document.
   - sizes: the vendor has `auto | md | full`, bitepals has `sm | md | lg`. Probably documentation:
     how a consumer sets `--modal-width-*` per dialog.
3. **`bottom-center` toasts.** The three placements do not fit a mobile app with a bottom nav:
   `bottom-end` sits on the nav, and `--toast-offset` is one value for both axes. bitepals went to
   `top-center`. Ask: `bottom-center`, a block offset separate from the inline one
   (`--toast-offset-block`), and `env(safe-area-inset-bottom)` added to it.

## Brand and tokens

4. **The bitepals brand's weights are not the product's.** `font.weight.medium` 600 /
   `semibold` 700 in `semantic/bitepals.json`; the product has always been 500 / 600 and the brand was
   translated from it. bitepals overrides both. Ask: set them to 500 / 600.
5. **Per-brand component tokens**, or at least the button radius. bitepals' buttons are pills; that is
   brand, and today component tokens are declared once for every brand, so bitepals sets
   `--button-radius: var(--radius-full)` itself. Ask: let a brand file override a component token
   (the build already knows brands), and give bitepals a pill `button.radius`. This is a change to the
   theming model: a decision record.
6. **Unprefixed primitives collide with Tailwind's default theme.** `--radius-sm`, `--radius-lg`,
   `--font-weight-medium`, `--font-weight-semibold`, `--color-{red,green,blue,orange,neutral}-N` exist
   in both. With Tailwind's `theme` layer after `tokens`, `--radius-surface: var(--radius-lg)` resolved
   to Tailwind's 0.5rem and every surface lost its corners; with it before, Tailwind's `font-semibold`
   reads pulp's weight. Decision record 005 covers the bridge's own variables (`reference`), not these.
   Options: prefix the primitive tier (nobody who follows the rules reads a primitive, so it breaks
   nobody who does), or document `@layer reset, theme, tokens, …` next to `theme.css`. bitepals does
   the second today.
7. **Subtle status badges vanish on bitepals' surfaces.** `status-*-subtle` is the 100 step; on
   `surface-raised` (`#f8eed9`) gold-100 and green-100 are a few points of lightness away, so
   "Pending" reads as coloured text with no pill. pulp's surfaces are near-white, bitepals' are tinted:
   the same step does not carry. Ask: darker subtle steps for the bitepals brand, or a hairline border
   on `variant="subtle"`. Add the fill-on-surface pair to the contrast tests (non-text, 3:1).
8. **A third surface step?** bitepals had one (cream-500 / ink-500) for hover and selected fills on a
   sunken surface. It mapped them to `action-secondary-hover` (same values, a reasonable meaning).
   Probably nothing to do; recorded so the mapping is known.

## Components

9. **`tone="action"` on Badge.** A navigation's unread dot and count are the brand colour, a marker,
   not a status. bitepals re-points `--badge-neutral-solid-bg/fg` on a class.
10. **`hideLabel` on Textarea**, as TextField has. bitepals hides the label with its own CSS.
11. **A static Table.** `Table` is React Aria's grid (client, `role="grid"`, ~52 kB with the vendor).
    bitepals' eight tables are read-only and rendered by Server Components with `render` callbacks per
    column, so it kept its own. Ask: a plain `<table>` with pulp's density and tokens, server-safe,
    next to the interactive one, the way `Select` sits next to `Picker`.
12. **SegmentedControl: labels overlap when the segments do not fit.** Four options with icons in a
    ~230px container draw on top of each other. `min-inline-size: 0` and an ellipsis on the label, or
    let the track scroll. Add the narrow case to the matrix story.
13. **`@pearpages/modals/styles.css` starts with `@charset`.** Imported into `layer(vendor)` as the
    README says, the at-rule lands inside the layer and Next's CSS optimiser warns on every build. Fix
    in the vendor.

## Built in `~/Projects/modals`, branch `pulp-feedback` (items 13 and 2)

Found from pulp on 2026-09-20 and built the same day, three commits, nothing pushed and no version
bump. Pere released it as **0.4.0** on 2026-09-21 and pulp now depends on `^0.4.0`, with the
`data-modal-keep-active` attribute on its toast container, a story with a dialog and a toast open
together, and an `@charset` guard in the vendor test. What remains is the iPhone check below.

What was done there, and what it was:

- **`@charset`** (item 13): **done.** `dist/index.css` started with `@charset "UTF-8";` because Sass
  writes one as soon as any non-ASCII character reaches the output, and one loud comment in
  `components.scss` has a multiplication sign. Imported into `layer(vendor)` the at-rule lands inside
  the layer, which is invalid, and Next's optimiser warns on every build. Fixed with
  `sassPlugin({ charset: false })`; the comment stayed where it was, and esbuild strips it from dist
  anyway. Guarded in the playground suite, which runs against built `dist/`.
- **Toasts under an open dialog** (item 2): **done in the vendor, waiting on the release.** Confirmed
  in the built Storybook first: `useInertOutside` walks up from the modal root and sets `inert` and
  `aria-hidden="true"` on every sibling, so pulp's `[data-pulp-toasts]` container (a child of `<body>`,
  like `[data-pulp-dialogs]`) is unreachable and silent while a dialog is open — "Place removed · Undo"
  cannot be pressed and is not announced. The vendor now skips any sibling carrying
  **`data-modal-keep-active`** (the name follows its existing `data-modal-*` family), tested there.
  pulp's side is the attribute on the toast container plus a story with both open. Not solved from
  pulp by portalling toasts into the dialog root: a toast must outlive the dialog that fired it.
- **The visual viewport** (item 2): **written, and it needs a phone.** `useVisualViewport` sets
  `--modal-vvh` and `--modal-vv-offset-top` on the portal root while a modal is open, from
  `visualViewport.height` and `.offsetTop`, listening to `resize` *and* `scroll` — Safari moves the
  visible box to reveal a focused field without firing a resize. The backdrop reads them with
  fallbacks of `100dvh` and `0px`, so with the hook inactive, without `visualViewport`, or on the
  server, the layout is exactly what it was. Scoped to the portal root rather than `<html>`, unlike
  bitepals' `apps/web/design-system/hooks/use-visual-viewport-height.ts` it was modelled on.
  Unit-tested against a faked viewport. **The acceptance test is a real iPhone**, and bitepals should
  not swap its Modal and BottomSheet before that passes.

## Order

4 and 13 are one-liners: do them first and release, bitepals drops an override the same day. Then 1
(unblocks two swaps), 3, 10, 9, 12, 7. Then the decision records: 5 and 6. 2 needs a phone. 11 and 8
last.

## Kickoff prompt

> Read `docs/bitepals-feedback.md` and group 11 of `tasks.md`. You are on branch `bitepals-feedback`.
> Build the items in the order given, one per commit, `pnpm verify` green before each. Stop and ask
> before changing a semantic token, a primitive name or a stable API.
