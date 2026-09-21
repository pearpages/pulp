# What bitepals takes from the next pulp release

Group 11 of [`tasks.md`](../tasks.md) built all thirteen things bitepals ran into on pulp 0.3.0
(2026-09-20/21, PR #2); the item-by-item record is there and in decision records 006, 007 and 008.
This file is the handoff for the **bitepals** session that follows the release. Delete it when that
session is done.

It needs, in this order: the three bitepals branches merged (`og-branch`, `pulp-tokens`,
`pulp-components`), PR #2 merged, and pulp released. `@pearpages/modals` 0.4.0 is already on npm.

## Drop: local overrides pulp now covers

Each one is an exit condition ADR 0007 already names.

| bitepals | Replaced by |
| --- | --- |
| `--font-weight-medium: 500; --font-weight-semibold: 600;` in `apps/web/styles/app-tokens.css` | the bitepals brand's own weights, now 500 / 600 |
| `--button-radius: var(--radius-full);` in the same file | a bitepals override inside pulp (record 007); it reaches IconButton and the buttons pulp renders itself, like the override did |
| `apps/web/design-system/ui/primitives/nav-badge/nav-badge.css` (re-points `--badge-neutral-solid-*`) | `<Badge tone="action" variant="solid">` |
| `.textarea-field--unlabelled > label` in `.../primitives/textarea/textarea.css` | `<Textarea hideLabel>` |
| `@charset` warnings from the modals stylesheet in `next build` | nothing: gone in `@pearpages/modals` 0.4.0 |

## Swap: the components that stayed local

- **Avatar and Chip** → pulp's, with `accent={index}`. Replace `stringToColor` (`apps/web/lib/string-to-color.ts`,
  15 call sites) with a hash to `1…8`: keep the FNV-1a loop, return `(hash % 8) + 1`. Pass the same
  id everywhere a person appears, so they keep one colour. The local `color` prop and its inline
  `style` (the known violation ADR 0007 records) go with it.
- **Table** → pulp's new plain `Table` (record 008), which renders on the server like the local one.
  Six files, eight tables, all in `app/admin/**` and `invite-tokens-section.tsx`. The local
  `columns`/`render` API maps onto `Table.Column` + `Table.Cell` row by row; the local `emptyMessage`
  is `Table.Body emptyMessage` with `columnCount`. `caption` is required: most admin pages already
  have a heading that says it, so `captionHidden`.
- **Modal and the bottom sheets** → Dialog and Sheet. What kept them local is fixed: `@pearpages/modals`
  0.4.0 follows the visual viewport, so a focused input stays above the iOS keyboard, which is what
  bitepals' `use-visual-viewport-height.ts` did (checked on an iPhone). That hook and its `--vvh` /
  `--vv-offset-top` go. A toast fired inside a dialog stays pressable now. For the `sm | md | lg`
  sizes: `--dialog-width` / `--sheet-width` in a class on `Dialog.Content` / `Sheet.Content`.
- **Toasts** may move back to the bottom: `placement="bottom-center"` with
  `--toast-offset-block` set to the bottom navigation's height; the safe-area inset is added for you.
  Worth a look on the phone; top-center stays valid.

## Keep

- EmptyState: ADR 0007's reason (its glow and dot decorations) did not change.
- `badge--love` and `badge--recommended` (`.../components/badge/badge.css`): two reactions with no
  status tone behind them. They re-point pulp's component tokens from outside, the one thing record
  007 exists to prevent; if they stay, the honest home is two `accent` indices or a pulp ask for tones.
- `--font-family-*` from next/font, the `--app-*` colours, and `@layer reset, theme, tokens, …` in
  `globals.css` (record 006 says that line is required).

## Kickoff prompt for the bitepals session

> Read `~/Projects/pulp/docs/bitepals-feedback.md` and ADR 0007. pulp is at the new release. Drop the
> overrides in "Drop" first, one commit each, then the swaps in the order listed. Tests and the build
> green before each commit; look at the pages each swap touches on a logged-in account, not only
> Storybook. Update ADR 0007 as each deviation closes.
