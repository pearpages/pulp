# bitepals as the second consumer: how to run group 10

Working notes for the session that builds group 10 of [`tasks.md`](../tasks.md). The specs are there;
this file says how to work through them and where in bitepals to look. Delete it when group 10 is done.

## Why

bitepals (`~/Projects/bitepals`: Next.js 16 App Router + Tailwind v4 on web, Expo + NativeWind on mobile)
is dropping its own `packages/tokens` and the hand-rolled design system in `apps/web/design-system/` for
pulp, and then taking Tailwind out of the web app. Its side of the plan, with the token and component
reconciliation tables and the measured size of the job, is `~/Projects/bitepals/tasks.md`. The decision
there: whatever is generic gets built **here**; bitepals keeps only app-specific UI (navigation, place
components, its Hub glyphs, illustrations, a full-screen push sheet).

pulp gains its second real consumer, which is what the bitepals brand was waiting for.

## State (2026-09-18)

Branch `bitepals-consumer`, off `main`. Nothing pushed.

| Commit | What |
| --- | --- |
| `f7813da` | Group 10 opened in `tasks.md` |
| `9cb4d70` | **Divider**: the worked example for a leaf, hook-free component |
| `7faf287` | **Link**: the worked example for `asChild` and a generic `ref` |

Both went through every check listed below except the full `pnpm verify` chain (`test:site` and the
full `test:storybook` were not run; their own stories were). Run `pnpm verify` once before building on them.

## How to work

- One item per commit on this branch. New components through the `add-component` skill, never by hand.
- `pnpm verify` green before each commit. One changeset per item (`minor` for a new component or a new
  prop; react and, when tokens change, tokens).
- Tick the item in group 10 with the date. Add one session-log line to `tasks.md` when the session ends.
- New components are `@status experimental`.
- Read the bitepals source named below before designing the API, then design it the pulp way. Do not
  port the API: bitepals passes colours as props, uses booleans for variants and `className` for size.
  What carries over is the *need*; the table says what each call site actually uses.

Things already met, so they cost nothing the second time:

- A new entry changes the public API: `test:dist` fails on `api.snapshot.txt`. Re-run it with `-u`
  (`pnpm --filter @pearpages/pulp-react exec vitest run --config vitest.dist.config.ts -u`) and commit the file.
- `pnpm build:tokens` after editing a component token file; `dist/tokens.{css,json}` go in the commit.
- The focus ring tokens are `{focus.ring.width}` / `{focus.ring.offset}`, not `{focus.ring-width}`.
- `check:size` needs the repo's Node (`.nvmrc`, 22.23.1): on 22.13 it cannot load `tsup.config.ts`.
  Its `ignored-bare-import` warnings are there for every entry; they are not yours.
- The matrix screenshots are CI-owned. A new component has no baseline until the branch is pushed and
  `gh workflow run visual-update.yml --ref bitepals-consumer` has run; expect `test:site`'s visual half
  to have nothing to compare a new `Matrix…` story with until then.

## The items, and where to look in bitepals

Paths are under `~/Projects/bitepals/apps/web/`. "Uses" is JSX occurrences outside stories and tests.

### New components

| Item | Read | Uses | What the call sites need |
| --- | --- | --- | --- |
| Avatar | `design-system/ui/components/avatar/` | 14 | image with initials fallback, `sm`–`xl`, an injectable image component (`next/image`). Its `color` prop is a literal colour: replace with a token, do not port |
| Chip | `design-system/ui/components/chip/` | 24 | toggle (`selected`), removable (`onRemove`), three sizes, a brand flavour. Its `color` prop: same as Avatar |
| SegmentedControl | `design-system/ui/primitives/option-group/`, `components/paired-view-toggle/`, and mobile's `~/Projects/bitepals/apps/mobile/src/components/segmented-control.tsx` | 3 + the link flavour | generic over a string union, `segmented` and `chips` looks, two sizes; `PairedViewToggle` is the same look made of links (`role="tablist"` today, which is wrong for navigation) |
| EmptyState | `design-system/patterns/empty-state/`, `design-system/patterns/error-state/` | 6 | icon, title, body, one action; an error flavour with retry |

### Extensions

| Item | Read | Uses | Note |
| --- | --- | --- | --- |
| Button / IconButton `tone="danger"` | `design-system/ui/primitives/button/` | 98 | bitepals' `destructive` variant. Its `field` size is `md` here |
| Toast `action` and `toast.undo` | `design-system/ui/components/toast/` | `useToast` in 20 files | per-variant durations 4 / 6 / 5 s; `toast.undo(message, onUndo)` |
| TextField search | `design-system/ui/primitives/input/` | 30 | `variant="search" \| "filter"`, `onClear` |
| Badge dot and count | `design-system/ui/primitives/nav-badge/` | 6 | discriminated union `dot` \| `count`, 99+ clamp, `ariaLabel` |
| Sheet drag to dismiss | `design-system/ui/components/bottom-sheet/animated-bottom-sheet.tsx` and its test | 19 | the exported `shouldDismiss()` is already unit-tested: port the thresholds, not the `motion` dependency |

### Icons

`design-system/ui/primitives/icons/icons.tsx`: 64 components in one file, 231 uses in 96 files. About 58
are generic. Several are filled or two-tone there and read `var(--color-brand-*)`: those need redrawing on
this set's grid (24 viewBox, stroke 2, `currentColor`), not copying. `HubWantToGoIcon`, `HubLikedIcon`,
`HubRecommendedIcon`, `HubMehIcon`, `HubIgnoredIcon` and the following / followers / requests glyphs are
bitepals' domain and stay there. The barrel's size budget moves: say why in `.size-limit.js`.

### Infrastructure

Specs in group 10. These, not the components, are what bitepals cannot start without:

- `'use client'` in dist. bitepals is App Router: today every interactive entry fails in a Server Component.
- `@pearpages/pulp-tokens/theme.css` and `/native`, after decision record 005. bitepals' one `@theme`
  block is `apps/web/styles/tailwind-theme.css`; its mobile consumers are `apps/mobile/tailwind.config.js`
  and `apps/mobile/src/lib/theme/provider.tsx`, which today read
  `~/Projects/bitepals/packages/tokens/dist/tailwind-tokens.cjs`: that file's `{ colors, radius, themeVars }`
  shape is the contract `native` has to meet.
- The two semantic gaps (an overlay surface, a quieter border). bitepals' values:
  `~/Projects/bitepals/packages/tokens/src/tokens.ts`.

## Order

Components (Avatar → Chip → SegmentedControl → EmptyState), then the extensions (Button → Toast →
TextField → Badge → Sheet), then the icons, then the infrastructure with record 005. Turn it around and
start with the infrastructure if bitepals' token swap should begin sooner: nothing else blocks it.

## Stop and ask Pere before

- adding or changing a **semantic** token (both brand files, the contrast tests, and every consumer sees it);
- an API that departs from the sketch in group 10;
- pushing the branch, opening the PR, or versioning.

## Kickoff prompt

> Read `docs/bitepals-consumer.md` and group 10 of `tasks.md`. You are on branch `bitepals-consumer`.
> Run `pnpm verify` first to confirm Divider and Link are green, then build the remaining items in the
> order given, one per commit, with the add-component skill, `pnpm verify` green before each commit.
