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
| `apps/storybook` | docs + stories-as-tests; deploys to pulp.pearpages.com |
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
  the app's `dev`/`build` scripts generate first (a TypeScript parse, no tsup).
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

Ordered within each group. Groups 1 and 2 are the gate to everything else being real.

**1. Ship it (needs Pere's accounts)**
- [ ] Create `github.com/pearpages/pulp`, push `main`, enable Pages (source: GitHub Actions).
- [ ] DNS: CNAME `pulp` → `pearpages.github.io`; set the custom domain in the repo's Pages settings
      (`apps/storybook/public/CNAME` already carries it).
- [ ] Watch the first `deploy.yml` run; confirm https://pulp.pearpages.com serves the Storybook.
- [ ] npmjs.com: register `@pearpages/pulp-tokens`, `@pearpages/pulp-css`, `@pearpages/pulp-react`
      as Trusted Publishers for `pearpages/pulp` + `publish.yml` (the names cannot be registered
      before a first publish: do a one-off manual `npm publish` from a `pnpm pack` tarball, or
      publish 0.0.0 placeholders, then register).
- [ ] `pnpm version-packages` (consumes `.changeset/initial-release.md` → 0.1.0), commit, push,
      wait for the deploy run, then `git tag v0.1.0 && git push --tags`; watch `publish.yml`.
- [ ] Verify `npm view @pearpages/pulp-react` and that `pnpm add` of it in a scratch Vite app works.

**2. Consumer: the CV site (`~/Projects/cv`)**
- [ ] Add `@pearpages/pulp-css` and `@pearpages/pulp-react`; import the CSS once in `src/styles/index.scss`.
- [ ] Set `data-brand="pulp"` on `<html>`; map the site's existing `data-theme` toggle to `data-scheme`
      (or rename the attribute) so the CV's dark mode drives the tokens.
- [ ] Replace the theme toggle `<button>` in `Nav.tsx` and the link-buttons in `Contact.tsx` with
      `Button` (`asChild` for the links). Delete the CSS they no longer need.
- [ ] Decide what the CV keeps as its own tokens (hero ultramarine act, print stylesheet) and what
      it now takes from pulp; remove duplicates from `_tokens.scss`.
- [ ] Build, run the PDF script, check both schemes and the print page; commit and deploy.
- [ ] Link the CV repo from pulp's README as the reference consumer.

**3. Components: the library, by tier**

Done, one per kind: Button, TextField, Card, Tabs, Dialog. Every new component follows the same
recipe (`pnpm --filter @pearpages/pulp-react scaffold Name`, tokens → component → tests with axe →
stories with `play` + four brand × scheme matrices → changeset → README table → tick here). Tiers
are dependency order: a tier reuses what the previous one proved. "Reuses" names the pattern to
copy, not to re-derive.

*Tier 1, foundations other components need first*
- [x] Text (2026-09-14): `as`, size, weight, tone, family, align, truncate.
- [x] Heading (2026-09-14): `level` sets the element, `size` defaults from it and can be overridden.
- [x] Icon (2026-09-14): sizes any SVG; decorative unless `label`.
- [x] Icons package `@pearpages/pulp-icons` (2026-09-14): `svg/*.svg` → `scripts/generate.mjs` →
      committed `src/icons/*.tsx`; `pnpm check:generated` fails on drift (same pattern as tokens).
      One barrel entry; `sideEffects: false` lets bundlers tree-shake per icon.
      Storybook, react's tsconfig and vitest alias it to source so nothing depends on build order.
- [x] VisuallyHidden (2026-09-14).
- [x] Stack and Inline (2026-09-14): `gap` 1–8 from the spacing scale, `align`, `justify`, `as`.
- [x] Field (2026-09-14): `Field`, `Field.Label`, `Field.Control` (asChild), `Field.Description`,
      `Field.Error`, `useField`. Parts register on mount so `aria-describedby` never dangles.
      TextField composes it with its API and tests unchanged.
- Tier 1 review (same day), fixed before commit: `font.size.3xl` so h1 and h2 differ (a token test
  now rejects size scales with duplicate values); Button renders `Icon size="inherit"` instead of
  its own icon spans; Stack/Inline keep `role="list"` as `ul`/`ol` (Safari); Field counts parts
  and warns on duplicates, and its SSR gap (no `aria-describedby` until hydration) is documented
  and pinned by a test; `Text` no longer offers `as="label"`; icons ship one barrel (tree-shaken);
  manifest `requires` lists icons and the vendor dialog stylesheet.

*Tier 2, form controls (all reuse Field and the TextField tokens)*
- [x] IconButton (2026-09-14): `label` required; squares Button through `--icon-button-size-*` on a
      `data-icon-only` attribute. Button keeps its dev warning for the un-sanctioned path.
- [x] Checkbox (2026-09-14): native input, `appearance: none`, tick drawn in CSS, `indeterminate` as
      property + `aria-checked="mixed"` + `data-indeterminate`. State is the native `:checked`.
- [x] Switch (2026-09-14): native checkbox with `role="switch"`; track/thumb from `--switch-*`.
- [x] RadioGroup + Radio (2026-09-14): native radios (the browser's arrow keys, no hook needed);
      group labelled by reference via `Field.Label as="span"` + `useField().labelId`.
- [x] Textarea (2026-09-14): `rows`, `resize`, `autoGrow` (`field-sizing: content`, progressive).
- [x] Select (2026-09-14): native `<select>`, chevron as the wrapper's `::after` in the same grid cell.
- [x] Form pattern story (2026-09-14): `src/stories/Form.stories.tsx`, submits and asserts FormData.
      Checkbox and Switch share `src/internal/ToggleField.tsx`.

*Tier 3, feedback*
- [x] Spinner (2026-09-14): `size` incl. `inherit`, `tone` incl. `inherit`, `label`/`decorative`.
      Button renders it decoratively (its own spinner CSS is gone).
- [x] Badge (2026-09-14): tone × variant on the status layer. Tokens added for every tone:
      `<tone>-text`, `<tone>-subtle`, `on-<tone>`, plus a `neutral` tone; the contrast test covers
      text-on-subtle and on-fill pairs. bitepals `status.error`/`status.info` fills darkened one step
      so white text on them meets AA.
- [x] Alert (2026-09-14): tone, title, action, dismiss; `role="alert"` for error else `status`,
      `live="off"` to opt out. Default glyphs from `@pearpages/pulp-icons`, which is now a
      **runtime dependency** of the React package (kept external; tree-shaken per glyph).
- [x] Toast (2026-09-14): `ToastProvider` owns a portal element with a polite region;
      `useToast()`; timers pause on hover/focus; Escape dismisses; cap; errors sticky by default.
- [x] Progress (2026-09-14): `role="progressbar"`, required label, `valueText`; the fill width is
      the library's one per-instance inline value (a `--_value` custom property, disable comment
      with the reason). Indeterminate stops under reduced motion.
- [x] Skeleton (2026-09-14): decorative; container carries `aria-busy`; shimmer off under reduced motion.

*Tier 4, overlays and disclosure (reuse Dialog's portal pattern and Tabs' roving focus)*
- [x] Tooltip (2026-09-14): hover with delay, focus immediately, `aria-describedby` while open,
      Escape hides. Positioning: `@floating-ui/react-dom` (runtime dependency, external) through
      `src/internal/floating.ts`. CSS anchor positioning is above the browser floor today; the hook
      is the one place to swap it in later. The gap is read from a `--_gap` token, and the position
      is delivered as `--_x`/`--_y` custom properties (the per-instance inline value, disable comment).
- [x] Popover (2026-09-14): non-modal `role="dialog"`, focus in on open and back to the trigger on
      close, Escape/outside/`Popover.Close` dismiss via `src/internal/useDismiss.ts`.
- [x] Accordion (2026-09-14): buttons inside real headings (`headingLevel`), `region` panels,
      roving focus, `single|multiple`, `collapsible`.
- [x] Menu (2026-09-14): WAI-ARIA menu button: arrows open to first/last, wraparound, typeahead,
      Enter/Space/click select and close, Escape/Tab close and return focus, `tone="danger"` items.
- [ ] Sheet: **blocked on `@pearpages/modals` ≥ 0.3.0 `placement`**. Docking the vendor dialog to
      an edge cannot be done from pulp's layered stylesheet (the vendor's layout rules are
      unlayered). Decision (2026-09-14): the vendor learns to dock, pulp maps colours. Then `Sheet`
      = `Dialog` with `placement` forwarded and `--sheet-*` tokens mapped onto
      `--modal-width-sheet` / `--modal-height-sheet`.
- Decisions after tier 4 (2026-09-14): positioning stays on `@floating-ui/react-dom` behind
  `src/internal/floating.ts`; revisit when Safari 26 is an acceptable floor (CSS anchor positioning)
  or when modals moves to the top layer (native Popover API; until then, top-layer overlays would
  stack above dialogs opened from them). Menu's hand-rolled interaction model is reviewed against
  React Aria in tier 5. Longer term, modals shipping its CSS in a named layer would make every pulp
  override win by design (a major for modals).

*Tier 5, complex widgets: build on React Aria, never hand-roll the keyboard model*
- [x] Decision records (2026-09-14): `docs/decisions/001` React Aria Components as the headless
      layer (and how the boundary is kept), `002` floating positioning and `003` Sheet backfilled from
      tier 4, `004` the Menu review: kept, with the gaps listed and the migration triggers (selectable
      items, sections, submenus, multi-character typeahead).
- [x] Listbox (2026-09-14): single or multiple, ids in and out as an array, `'all'` resolved to ids.
      Its option renderer (`ListboxOptions.tsx`, `--listbox-item-*`) is shared by Combobox and Picker.
- [x] Combobox (2026-09-14): `contains`/`startsWith` filtering or `filter="none"` for async lists,
      `loading` keeps the list open with a message, `allowsCustomValue`, `aria-activedescendant` by the vendor.
- [x] Picker (2026-09-14): the rich single select on the vendor's Select with a hidden native select for
      forms. The native `Select` stays the default for plain word lists; Listbox covers multiple choice.
- [x] Calendar (2026-09-14): ISO strings, `min`/`max`, `isDateUnavailable`, `locale` (wraps the
      vendor's `I18nProvider`), the visible month follows an outside `value` change (the vendor alone
      would not). No `headingLevel`: the vendor's hidden `h2` names the grid.
- [x] DatePicker (2026-09-14): segmented input in locale order, calendar popover reusing
      `CalendarGrid`, ISO value in forms.
- [x] Slider (2026-09-14): number or `[start, end]`, `formatOptions` for the output and
      `aria-valuetext`, `thumbLabels`, vertical, `hideLabel`. Disabled dims the track, not the label.
- [x] Table (2026-09-14): compound parts, sort as caller state (`sort`/`onSortChange`, uncontrolled
      default held locally because the vendor has none), selection as id arrays with the selection column
      inserted by the parts, `density` from the spacing scale, `stickyHeader`. `onRowAction` documents the
      vendor's rule: with a selection in place, Enter and click toggle selection instead.
- [x] Pagination (2026-09-14): `nav` landmark, `aria-current="page"`, ellipses from `paginationRange`,
      Buttons by default and links with `getHref`. No headless layer needed.
- Tier 5 notes: `react-aria-components` and `@internationalized/date` are runtime dependencies, external
  and asserted unbundled by the dist smoke test (`data-rac` must not appear in dist). New semantic token
  `size.listbox-height`; new icons `Calendar`, `ChevronLeft`. The vendor sets its popovers' `z-index`
  inline, so no `--*-popover-layer` token exists for them; the gap to the trigger is padding on the popover.
  axe in Chromium caught two contrast regressions from `opacity` on disabled roots (Calendar heading,
  Slider label) and an empty selection header (`empty-table-header`); all three fixed at the source.

*Cross-cutting, alongside the tiers*
- [x] Per-component docs page (2026-09-15): `ComponentDocs.tsx` is the autodocs page for every stories
      file; status, prose, use-it, accessibility, do/don't, parts and the non-matrix stories come from the
      manifest, which comes from JSDoc tags. The 37 duplicated `parameters.docs.description` are gone.
- [x] Status page (2026-09-15): `@status` tag → manifest → `Status.mdx`; tier 5 is `experimental`, the
      rest `stable`; the manifest build fails without a status.
- [x] Vendor-variable guardrail (2026-09-15): `Dialog.vendor.test.ts` (54 mapped names, all declared).
- [x] Storybook categories (2026-09-15): `@category` tag → manifest `category` + ordered `categories`;
      story titles `Components/<Category>/<Name>` checked by the dist smoke test; sidebar order, the
      Status page grouping, docs links (`docs/paths.ts`) and the "· experimental" sidebar label all
      derive from the manifest. Judgment calls: Menu is an overlay, Calendar a form control, Card layout,
      Badge feedback, Table its own kind.
- [x] Bundle-size budget (2026-09-15): `size-limit` with esbuild, entries from `tsup.config.ts`.
      Measured brotli: leaf entries 0.2–1.7 kB (toast 3.0, menu 2.3), barrel 13.6 kB, stylesheet 7.2 kB,
      Combobox/Table/DatePicker with React Aria 54/52/65 kB. Limits sit about 20% above.

**4. Guardrails still missing**
- [ ] Token schema validation: every token has `$type` (the dark-counterpart and component→semantic
      checks exist in `build.test.mjs`).
- [ ] `component-manifest.json` snapshot test so a prop change without a changeset fails CI.
- [x] Bundle-size budget for `packages/react/dist` (2026-09-15, see cross-cutting).
- [ ] Storybook: enable the a11y addon's `test: 'error'` verification in CI is already on; add a
      `storybook-static` link check so a broken MDX import fails the build.
- [ ] Pre-commit hook (lefthook or simple-git-hooks): `check:tokens`, lint-staged eslint/stylelint.
- [ ] A tool that honours `browserslist` (lightningcss in the build) so the support floor is enforced,
      not only declared.

**5. Docs**
- [ ] Introduction: add a "how a brand is added" walkthrough (copy `semantic/pulp.json`, change
      references, done) with a screenshot of both brands.
- [ ] Tokens page: explain the tiers with a diagram; show the `space.unit` density knob live.
- [x] Per-component docs page pattern (2026-09-15, see cross-cutting).
- [ ] README: badges (CI, npm), a short "why native CSS, why no Tailwind in a library" section.
- [ ] Storybook favicon and title (`pulp`), not the defaults.

**6. Testing gaps**
- [ ] Storybook Vitest in CI needs Chromium: confirm the `playwright install --with-deps` step works
      on `ubuntu-latest` (first push will tell).
- [ ] Visual regression: Playwright screenshots of every story in both brands and schemes, stored in
      the repo, diffed in CI.
- [ ] Keyboard-only interaction tests for Button `asChild` links (Enter/Space semantics).
- [ ] Forced-colors (Windows high contrast) story and a `@media (forced-colors: active)` rule set.
- [ ] Reduced-motion: the global reset freezes the spinner to a static ring; decide whether that is
      the intended indicator or a slow spin is better.

**7. Housekeeping**
- [ ] Upgrade path notes: Vitest 5 once `@storybook/addon-vitest` accepts it; ESLint 10 once
      `eslint-plugin-react` accepts it; TypeScript 7 once tsup's dts build accepts it.
- [ ] Dependabot or Renovate config with grouped updates.
- [ ] LICENSE file (MIT is declared in every package.json but no file exists yet).
- [ ] CODEOWNERS and a PR template that repeats the contributing checklist.

**8. Known vendor limits (react-aria-components 1.21, react-aria 3.52)**
- A pointer press on a calendar day registers window focus listeners that throw on a focus event whose
  target is the Window (seen in the Storybook iframe; a first click into an unfocused page may hit it
  too). Console error only, no state corruption. Track upstream; the calendar stories use the keyboard.
- `Select`/`ComboBox` support `selectionMode="multiple"` in this version; pulp exposes single only for
  Picker and Combobox and points multiple choice at Listbox. Revisit if a multi-select field is needed.

### Later (not scheduled)
Deprecation codemods, Tailwind preset emitted from tokens, Figma sync (Tokens Studio reads the
DTCG files; dark values live in pulp's extension), a second consumer (bitepals web) to prove the
bitepals brand in production, a third brand to prove "one JSON file, zero component changes".
