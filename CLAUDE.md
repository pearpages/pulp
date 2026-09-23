# pulp

Design system: tokens → CSS → React components, with guardrails that CI enforces.
Read this before touching anything. `PRINCIPLES.md` is the source of truth for *why* the
system is shaped this way; the rules below are the subset that lint and CI check. They apply
to humans and coding agents alike.

## Layout

| Path | What |
| --- | --- |
| `packages/tokens` | W3C DTCG JSON in `tokens/{primitives,semantic,component}`; `scripts/build.mjs` → `dist/tokens.css` + `dist/tokens.json`, and two views of the semantic tier, `dist/theme.css` (Tailwind v4) + `dist/native.{js,cjs,d.ts}` (React Native), record 005 (all **committed**, CI checks drift) |
| `packages/css` | `layers.css`, `reset.css`, `base.css`, `index.css`. No build. Framework-agnostic |
| `packages/react` | components in `src/<name>/` (five files each), tsup build, one entry per component |
| `packages/icons` | `svg/` sources → generated `src/icons/*.tsx` (committed; `check` on drift); one barrel, tree-shakeable |
| `apps/storybook` | docs + stories-as-tests (package `pulp-docs`); deploys to pulp.pearpages.com. `.storybook/theme.ts` derives the site theme from `tokens.json`; `scripts/fonts.mjs` copies the brand typefaces for the manager; `public/` holds the mark and wordmarks |
| `.claude/skills/add-component` | the scaffold procedure for a new component |
| `PRINCIPLES.md` | the ten design principles; rendered as the Storybook introduction |
| `docs/decisions` | decision records (headless layer, positioning, Sheet, Menu, token outputs); rendered as the Storybook "Decisions" page |

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
pnpm check:floor       # every shipped stylesheet runs unlowered on the root browserslist (lightningcss; build first)
pnpm test:storybook    # every story in Chromium with a11y checks (needs `playwright install chromium`)
pnpm storybook         # dev server on :6006
pnpm storybook:build   # ends with scripts/check-links.mjs: a dead docs link fails the build
pnpm test:site         # the built site in Chromium: cascade check, then the matrix screenshots under PULP_VISUAL=1 (after storybook:build)
pnpm --filter @pearpages/pulp-react scaffold Name Category   # new component skeleton (category from scripts/categories.mjs)
pnpm verify            # everything deploy.yml runs, in the same order. Run it before pushing to main
pnpm ci:local up|sync|verify|visual|diffs|shell|down   # the pipeline in CI's image, linux/amd64, via Colima (docs/ci-local.md)
```

`ci.yml` ignores `main`, so a push to `main` is verified only by `deploy.yml`, after the fact, and
a failure there also blocks the site. `pnpm verify` is the same chain locally; after pushing, watch
the run (`gh run watch`) instead of assuming it passed.

When something fails on the runner and not on macOS, reproduce it with `pnpm ci:local`
(`docs/ci-local.md`): a throwaway Colima profile running CI's Playwright image as `linux/amd64`, a
copy of the working tree, two-minute loops. Colima only, never Docker Desktop; finish with `down`.

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
- **Every stylesheet pulp ships restates the layer order first**
  (`@layer reset, tokens, vendor, base, components, utilities;`: each `*.module.css`, `reset.css`,
  `base.css`, `tokens.css`; the scaffold writes it). Layers rank by first appearance and the bundler
  picks the load order: the production Storybook linked a split `Icon-*.css` before the entry CSS, so
  `components` became the weakest layer and the reset beat every component (a primary Button painted
  as bare text) on the deployed site, with every test green. The dist smoke test, the tokens test
  and `packages/css/scripts/css.test.mjs` compare each copy with `packages/css/src/layers.css`.
- **The production build is tested as built.** Story tests and axe render through Vite's dev
  transform (styles injected in import order); only `pnpm test:site`
  (`apps/storybook/scripts/check-built-site.mjs`) serves `storybook-static` to Chromium. Per story it
  checks the layer order the browser met, and that every property a `components` rule sets computes
  to a value some matching component rule asked for (each candidate rule is forced inline and
  compared, so no specificity is re-implemented; font-size and color are pinned because em and
  currentcolor values follow them; logical and physical twins are one slot; an inline style may
  win). It runs in `verify`, `ci.yml` and in `deploy.yml` before the Pages upload. When UI work is
  done, look at the built page too: a green run said nothing about this bug.
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
- **Every token has a known `$type`, its own or its nearest group's** (`packages/tokens/scripts/schema.mjs`,
  run over the raw JSON by the token tests, because Style Dictionary's output hides inheritance). A
  new DTCG type is an edit to `TOKEN_TYPES` there. A misspelt `$` key fails too.
- **The support floor is enforced, not only declared.** `pnpm check:floor` runs the 43 shipped
  stylesheets (react `dist`, `packages/css/src`, `tokens.css`) through lightningcss with the root
  `browserslist` as targets and with none; any difference means the floor needs lowering or a prefix,
  and fails. Its first run found two: Safari has no unprefixed `user-select`, iOS no unprefixed
  `text-size-adjust`. Those two are the only prefixes Stylelint lets through. Limit: lightningcss
  passes unknown properties, so `field-sizing` and `@property` (progressive enhancements) go unseen.
- **`storybook:build` ends with a link check** (`apps/storybook/scripts/check-links.mjs`, over
  `storybook-static/index.json`): every MDX page is indexed, every component's `docsPath()` lands on
  a page, every literal `?path=` resolves, and every `docs/decisions/NNN-*.md` is both imported and
  rendered by `Decisions.mdx` and listed in the folder's README. It imports `docs/paths.ts` directly
  (Node strips the types), so that file must stay type-only syntax.
- **`'use client'` is decided from source and proven on dist.** `packages/react/scripts/client-entries.mjs`
  walks each entry's relative imports for client-only React APIs (state, effects, refs, context,
  `createPortal`; not `useId`, which the server build has) or a client package (React Aria, modals,
  floating-ui), and `pnpm build` stamps `"use client";` onto those `dist/<entry>.js` (on the first
  line, no line break, so source maps hold). Chunks need none: esbuild puts a shared module in the
  chunk of exactly the entries that reach it. The manifest carries `client` per component (Status
  page column "Renders in"). `test:dist` asserts the directive per entry, that a named list of
  leaves stays server-safe, and imports every server-safe entry under `node --conditions=react-server`
  (a client entry fails there with "Named export 'createContext' not found", which is what an App
  Router consumer saw before). Adding a hook to a leaf moves it to the client: that test makes it
  a decision.
- **The first client render matches the server's.** Output that exists only in the browser (a portal
  into an element the component creates) is gated on `useHydrated()` (`src/internal/useHydrated.ts`,
  `useSyncExternalStore`), never on `typeof document`, which differs between the two renders, and
  never on `setState` in an effect (`react-hooks/set-state-in-effect`). ToastProvider broke hydration
  on every bitepals page that way (0.3.0–0.4.0). `src/test/hydration.test.tsx` server-renders with
  `document` hidden and hydrates; a new provider or always-mounted portal gets a case there.
- **Per-person colour is an index, never a literal.** `color.accent.1…8` with `color.accent.on-1…8`
  (semantic, both brands, same hue order, each pair in the contrast tests); Avatar and Chip take
  `accent?: 1…8` and the consumer hashes an id to it. A new categorical use reads these tokens.
- **A hidden label goes through `Field.Label visuallyHidden`** (TextField and Textarea `hideLabel`),
  not a copy of the clip rule per component.
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
- **The matrix stories are compared with committed screenshots of the *built* site**, in CI only
  (`apps/storybook/visual-baselines/<Component>/<brand>-<scheme>.png`, 140 of them).
  `apps/storybook/tests/visual.spec.ts` (`@playwright/test`, `playwright.config.ts`) serves
  `storybook-static` and shoots every story named `Matrix…` after its `play`: animations and
  transitions off from before the first render, `Date` frozen so Calendar's "today" never moves,
  focus settled, pointer parked; overlays (`parameters.a11y.context === 'body'`) are shot as the
  whole body. It is the second half of `pnpm test:site` and runs only under `PULP_VISUAL=1`, which
  the workflows set: text rasterises differently on macOS and Linux, so **CI owns the baselines**.
  After an intended visual change run `gh workflow run visual-update.yml` (add `--ref <branch>` off
  main); it builds the site, re-renders everything, commits the PNGs and redeploys, and the commit's
  image diff is the review. A failing run uploads `visual-diffs` (Playwright's `test-results`:
  expected, actual, diff); a shot that only passed on the retry is reported as flaky. Threshold
  0.02, not the default, which let a border go from `#d5d7de` to `#c0c3cc` unnoticed. Until
  2026-09-18 the shots were taken by the Vitest run, through the dev transform: all green while
  the deployed Button was bare text. Never move them back to a dev render.
- **Vendor variables are checked against the installed vendor.** `internal/vendors.test.ts` has
  one entry per vendor, keyed by the prefix it owns (`--modal-*` for `@pearpages/modals`,
  `--contribution-heatmap-*` for `@pearpages/heatmap`). It discovers every component stylesheet
  that sets one of those names (Dialog, Sheet, Heatmap) and fails when one maps a name the vendor
  no longer declares, or drops below its lower bound. A new stylesheet that maps vendor variables
  must be given a bound there; a new vendor gets an entry.
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
names. The component tier is declared once, on `:root`; a brand may restate a single component
token in `tokens/component/<brand>/<component>.json` when the value is itself brand (bitepals'
buttons are pills), and the tests hold it to the semantic layer and to names that already exist
(record 007). `$extensions["com.pearpages.pulp"].dark` holds a dark counterpart;
`.multiply` builds the spacing scale from `space.unit`. Shadows split into
`--shadow-x-color` (light-dark) + geometry, because `light-dark()` only takes colours.

## Toolchain facts worth knowing

- pnpm 11 via `mise.toml`; Node from `.nvmrc`. `allowBuilds.esbuild` is required or tsup/Vite break.
  pnpm 11 also refuses packages published less than 24 hours ago; `pnpm-workspace.yaml` exempts
  `@pearpages/*`, this repo's own scope, so a same-day `@pearpages/modals` release installs.
- **The declaration build needs a bigger heap than Node's default.** `packages/react` builds 45 entries' types in one tsup dts worker; the 45th (Table) tipped it over and the build died with `ERR_WORKER_OUT_OF_MEMORY` after a green esbuild pass. The `build` script sets `NODE_OPTIONS=--max-old-space-size=8192`. It is a count-of-entries ceiling, not a bad type: raise it again rather than hunting the component.
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
`pearpages/pulp` + `publish.yml` before the first release. The workflow filename in that entry must
be exactly `publish.yml` (not `deploy.yml`, which is the one with an environment): npm reports an
entry that does not match the token as `OIDC token exchange error - package not found` →
`ENEEDAUTH`, which is what blocked 0.1.0. After fixing the entry, `gh run rerun <id> --failed`
resumes the tag's run; versions already on the registry are skipped.

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
