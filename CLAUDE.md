# pulp

Design system: tokens → CSS → React components, with guardrails that CI enforces.
Read this before touching anything. `PRINCIPLES.md` is the source of truth for *why* the
system is shaped this way; the rules below are the subset that lint and CI check. They apply
to humans and coding agents alike.

## Layout

| Path | What |
| --- | --- |
| `packages/tokens` | W3C DTCG JSON in `tokens/{primitives,semantic,component}`; `scripts/build.mjs` → `dist/tokens.css` + `dist/tokens.json` (**committed**, CI checks drift) |
| `packages/css` | `layers.css`, `reset.css`, `base.css`, `index.css`. No build. Framework-agnostic |
| `packages/react` | components in `src/<name>/` (five files each), tsup build, one entry per component |
| `packages/icons` | `svg/` sources → generated `src/icons/*.tsx` (committed; `check` on drift); one barrel, tree-shakeable |
| `apps/storybook` | docs + stories-as-tests (package `pulp-docs`); deploys to pulp.pearpages.com. `.storybook/theme.ts` derives the site theme from `tokens.json`; `scripts/fonts.mjs` copies the brand typefaces for the manager; `public/` holds the mark and wordmarks |
| `.claude/skills/add-component` | the scaffold procedure for a new component |
| `PRINCIPLES.md` | the ten design principles; rendered as the Storybook introduction |
| `docs/decisions` | decision records (headless layer, positioning, Sheet, Menu); rendered as the Storybook "Decisions" page |

## Commands (run from the repo root)

```
pnpm build:tokens      # regenerate tokens; commit the result
pnpm check:generated   # what CI runs: tokens dist and generated icons must match their sources
pnpm lint              # eslint + stylelint
pnpm typecheck
pnpm test              # unit tests, one shot (never bare `vitest`: watch mode)
pnpm build             # tokens, react (tsup) + component manifest
pnpm test:dist         # smoke test against packages/react/dist (build first)
pnpm check:package     # publint + are-the-types-wrong
pnpm check:size        # bundle-size budget per entry (size-limit, brotli; build first)
pnpm test:storybook    # every story in Chromium with a11y checks (needs `playwright install chromium`)
pnpm storybook         # dev server on :6006
pnpm storybook:build
pnpm --filter @pearpages/pulp-react scaffold Name Category   # new component skeleton (category from scripts/categories.mjs)
```

## Rules that CI enforces

- **No inline styles.** `style=` fails ESLint (`react/forbid-dom-props`). The only exception is
  the token preview component `apps/storybook/docs/TokenTable.tsx` (four disable comments, one
  per preview kind, each saying why).
- **No literal colours, radii, fonts, shadows or spacing in CSS.** Stylelint requires `var(--…)`
  for those properties (including `padding`, `margin`, `gap`, `inset`) everywhere except
  `packages/tokens`. No hex, no `rgb()`, no `color-mix()`. A bare percentage (`inset-block-start:
  50%` to centre a thumb) is allowed: it is a ratio of the container, never a brand value.
- **Components read semantic and component tokens only.** A primitive (`--color-ultramarine-500`,
  `--typeface-*`, `--radius-sm|lg|pill`, `--space-unit`, `--duration-*`, `--easing-*`) in a
  component fails Stylelint. Component *tokens* must reference the semantic layer too; the token
  tests check it. That is what makes a brand a token swap.
- **`pnpm check:guardrails`** (part of `pnpm lint`) drops deliberately wrong files in and fails
  unless every rule above fires. Relaxing a rule by accident fails CI.
- **Component CSS is wrapped in `@layer components { … }`.** The dist smoke test asserts it.
- **`loading` never uses the `disabled` attribute** (focus would be lost); it uses
  `aria-disabled` + `aria-busy` and blocks activation. Only `disabled` uses the attribute.
  With `asChild`, an inert control does not run the child's handler either.
- **State on the DOM as `data-*`** (`data-variant`, `data-size`, `data-loading`), styled with
  attribute selectors. Variants are union types, never conflicting booleans.
- **CSS modules, native CSS** (nesting, logical properties, cascade layers). No Sass, no
  CSS-in-JS, no utility classes.
- **Every component ships** `Name.tsx`, `Name.module.css`, `Name.test.tsx` (with an `axe`
  check), `Name.stories.tsx` (with a `play` for anything interactive and the four brand × scheme
  matrix stories), `index.ts`, and a `tokens/component/<kebab-name>.json`. Directory, entry point
  and CSS file are kebab-case (`text-field`); the export is PascalCase. The scaffold script
  creates all of them, and the dist smoke test covers every component listed in the manifest.
- **Adding a semantic token means adding it to every brand file.** The token tests diff the
  brands and fail otherwise.
- **`ref` is a normal prop** (React 19). The compiler lint rule (`react-hooks/refs`) rejects
  passing a ref, or an object holding one, into any function. An `asChild` helper has to,
  so that one call carries a `eslint-disable-next-line react-hooks/refs -- forwarded, not read`.
- **Every component's JSDoc carries `@status`, `@category` and `@accessibility`** (plus optional
  `@do`/`@dont`, one bullet per line). The manifest build fails without them. That block is the single
  source: the Docs page (`apps/storybook/docs/ComponentDocs.tsx`), the Status page, the sidebar label
  and agents read it from `component-manifest.json`. Stories carry no `parameters.docs.description`.
- **Categories are kinds, never tiers**: Typography, Layout, Actions, Forms, Navigation, Overlays,
  Feedback, Data, Utilities (`packages/react/scripts/categories.mjs`, in sidebar order). A story's
  title must be `Components/<Category>/<Name>` with the component's own `@category`; the dist smoke
  test fails otherwise. Compositions live under `Patterns/`.
- **Every entry has a bundle budget** (`packages/react/.size-limit.js`, driven by tsup's entry list):
  2.1 kB brotli for a leaf entry, named overrides with a reason, the barrel, the stylesheet, and three
  "with React Aria" entries that show the vendor's true cost. `pnpm check:size` runs in CI.
- **Vendor variables are checked against the installed vendor.** `Dialog.vendor.test.ts` fails when
  Dialog maps a `--modal-*` name `@pearpages/modals` no longer declares.
- **Complex widgets build on `react-aria-components`** (decision record 001), never on a
  hand-rolled keyboard model. The vendor's props never reach the public API (`disabled`, not
  `isDisabled`; `value`/`onChange`, not `selectedKey`/`onSelectionChange`); class names are plain
  CSS-module strings, styled through the vendor's `data-*` state; dates cross the API as
  `YYYY-MM-DD` strings (`src/internal/dates.ts`); label, description and error come from
  `src/internal/AriaField.tsx` (the vendor's parts on `--field-*` tokens). A file next to a
  component that is not named after the directory (`listbox/ListboxOptions.tsx`,
  `calendar/CalendarGrid.tsx`, `pagination/range.ts`) is internal to it and stays out of the manifest.

## Theming model

Two axes on `<html>` (or any element; brands nest):

- `data-brand="pulp" | "bitepals"`: palette, radius, type families, `--space-unit` (density).
- `data-scheme="light" | "dark"`, or none to follow the OS. Colours are `light-dark()` pairs.

Tiers: primitive → semantic → component. A brand file maps primitives onto the semantic
names. `$extensions["com.pearpages.pulp"].dark` holds a dark counterpart;
`.multiply` builds the spacing scale from `space.unit`. Shadows split into
`--shadow-x-color` (light-dark) + geometry, because `light-dark()` only takes colours.

## Toolchain facts worth knowing

- pnpm 11 via `mise.toml`; Node from `.nvmrc`. `allowBuilds.esbuild` is required or tsup/Vite break.
- tsup's own CSS handling uses the plain `css` loader, which turns a CSS-module import into `{}`.
  `tsup.config.ts` sets `loader: { '.css': 'local-css' }` (every stylesheet in the package is a
  module). The dist smoke test catches a regression.
- Vitest is pinned to 4.x: `@storybook/addon-vitest` does not accept 5 yet. ESLint 9: the React
  plugin does not accept 10. TypeScript 5.9 for tooling compatibility.
- Storybook resolves `@pearpages/pulp-react` to `src/` (alias in `.storybook/main.ts`) so docgen
  sees TypeScript. Packaging is proven by `test:dist` + `check:package`, not by the site.
- Stories carry per-story `globals` for the brand × scheme matrix, so axe runs on all four
  combinations in `pnpm test:storybook`, not only the toolbar default.
- Local shells here run Node 26 even though `.nvmrc` says 22 (mise is not on the tool's PATH);
  CI is the Node 22 verification.
- `vitest-axe` augments the legacy `Vi` namespace; `src/test/setup.ts` declares the `vitest` one.
- Stories live next to components, so `storybook` and `@storybook/react-vite` are devDependencies
  of `packages/react` (pnpm's strict isolation), and the Storybook app only typechecks its own files.
- The Storybook docgen plugin's default `include` is relative to the app, so components two packages
  up got no prop descriptions until `main.ts` widened it; the docs page also needs the manifest, which
  the app's `dev`/`build`/`typecheck`/`test:run` scripts generate first (a TypeScript parse, no tsup),
  and the app's tsconfig maps `@pearpages/pulp-icons` to source like the react package does. No CI
  step depends on a prior build: the first deploy run failed on exactly that.
- The Storybook manager is its own iframe: it loads none of the preview's CSS, so
  `manager-head.html` declares the brand `@font-face`s (files copied from fontsource by
  `scripts/fonts.mjs` into the gitignored `public/fonts`) and the favicon; the theme is built from
  `tokens.json` (`theme.ts`) and follows the OS scheme, while docs pages take the light one. The
  page title is the vendor's at both stages ("storybook - Storybook" before hydration, then
  "<page> ⋅ Storybook"); neither is configurable without patching the manager.
- Storybook 10 has no native tag badges: `.storybook/manager.ts` appends "· experimental" to a
  component's sidebar label through `renderLabel`, reading the manifest. `storySort.order` nests
  (`['Components', [...categories], 'Patterns']`) and the category list comes from the manifest too.
- An unregistered custom property computes to its specified text: `getComputedStyle().getPropertyValue('--_gap')`
  returned `calc(0.25rem * 2)`, which parsed to 0, so anchored overlays had no gap until tier 5.
  `src/internal/floating.css` registers `--_gap` with `@property`; the Menu story asserts the gap in Chromium.
- React Aria opens option lists with the list itself focused after a pointer press and with the first
  option focused after a keyboard open; it hides everything outside an open popover with `aria-hidden`
  (query the trigger before opening); its calendar names the grid through a visually hidden `h2` and
  keeps the visible month name `aria-hidden`; and a pointer press on a calendar day makes it listen
  for window focus events, which crash on the Storybook iframe's own focus event, so calendar
  stories drive the grid with the keyboard.

## Releasing

`pnpm changeset` per notable change → `pnpm version-packages` on main → push, wait for the deploy
run, then tag `vX.Y.Z` and push the tag. `publish.yml` packs with `pnpm pack` and publishes via npm
trusted publishing: each package name must be registered on npmjs.com as a Trusted Publisher for
`pearpages/pulp` + `publish.yml` before the first release.

## Status

### Done (2026-09-14)
- Workspace, tokens (two brands, light/dark, tests, drift check), CSS package, Button end to end,
  Storybook with brand × scheme toolbar, tokens page, contributing docs, guardrails, CI/deploy/publish
  workflows, component manifest, scaffold script + skill, `PRINCIPLES.md`.
- Review pass (same day) against the principles, all fixed and verified:
  Button `asChild` no longer runs the child handler when inert; `loading` uses `aria-disabled`
  and keeps focus; icon-only buttons warn in dev without an accessible name; `ref` is generic
  (`Button<HTMLAnchorElement>` with `asChild`); component CSS is in `@layer components` (asserted
  in the dist smoke test); brand × scheme matrix stories run axe on all four combinations;
  Stylelint rejects primitive tokens and spacing literals in components; `check:guardrails` probe in
  `pnpm lint`; token tests enforce component→semantic references, dark counterparts, and WCAG AA
  contrast for the pairs components produce; control sizes and focus ring moved to the semantic
  tier; `workspace:^` internally and tokens as a peer dependency of react; browserslist and a
  support policy; PRINCIPLES §1/§4 say what is portable and supported.
- Contrast findings the matrix surfaced (design decisions, not bugs): on-action text is ink in pulp
  dark and in bitepals both schemes (white on the brand orange is 2.8:1); `color.action.text` is a
  separate accent for text on surfaces (ghost buttons, links) because the bitepals fill orange is
  2.3:1 on cream; bitepals interaction states brighten instead of darken; faint text is promised
  on base and raised surfaces only.

### Pending

The pending work, the tiered roadmap and the recommended order live in [`tasks.md`](tasks.md).
Tick items there and add a one-line session summary above the list when a session ends.
