# pulp tasks

The pending work and the tiered roadmap. `CLAUDE.md` holds the rules and the toolchain facts;
this file holds what is left to do, ticked with a date when done. Ordered within each group.

## Recommended order (2026-09-18)

0. Group 9 (confidence): the consumer fixture (now with an RSC import and a Tailwind compile of
   `theme.css`), then the component review by eye. bitepals' migration runs in its own repo.
1. ~~Decision record 005~~ done in group 10 and confirmed (2026-09-19).
2. Docs (group 5): README badges now that npm is live, brand walkthrough, tokens diagram.
3. The testing gaps and housekeeping (the guardrails are done except record 005).
4. Group 10 (bitepals as the second consumer): `'use client'` and the token outputs first, then
   Divider as the pattern for the new components.

## Session log

- 2026-09-19 (later): PR #1 merged by Pere after a green CI on the re-rendered baselines (24 new,
  42 changed, each change measured and accounted for); 0.3.0 versioned, a Combobox story flaw
  found and fixed on the way (the click went to a replaced node), published and verified from
  the registry.
- 2026-09-19: group 10 finished on `bitepals-consumer`: 40 icons drawn for the set (none copied:
  bitepals' file records no source), `'use client'` decided from source and proven under
  `--conditions=react-server`, decision record 005 with `theme.css` (`@theme inline reference`:
  plain `inline` makes Tailwind 4.3 emit a cyclic `:root` variable that outranks `@layer tokens`)
  and `native`, and `color.surface.overlay`; the quieter border is a consumer snap. Every box in
  group 10 is ticked. Not pushed: pushing, `visual-update.yml --ref bitepals-consumer` (new matrix
  stories and changed dark overlays have no baselines), the PR and versioning are Pere's to call.
- 2026-09-18 (night): group 10 on branch `bitepals-consumer`, one item per commit, `pnpm verify`
  green and the built site looked at before each: Avatar, Chip, SegmentedControl (+ `.Nav`),
  EmptyState, Button/IconButton `tone="danger"` (two new semantic tokens, agreed), `toast.undo`,
  TextField search, Badge dot and count, Sheet drag to dismiss. Looking caught what no check did:
  Avatar's fallback invisible on the light surface, SegmentedControl's thumb lost in bitepals dark,
  TextField's search glyph painted under its own input, and `:has()` below the Firefox floor (Chip
  fixed; Select recorded in group 9). Left: the icons and the infrastructure. Nothing pushed.
- 2026-09-18 (evening): Pere: "even buttons don't seem correct". They were not: the deployed site
  linked a split `Icon-*.css` before the entry CSS, `components` became the weakest cascade layer
  and the reset beat every component; all tests were green because all of them render through the
  dev transform. Fixed by restating the layer order in every stylesheet; new test level
  `pnpm test:site` opens the built site in Chromium (263 stories) and blocks the deploy; the 140
  matrix screenshots moved from the dev server to the built site (Playwright), which also showed
  the old ones were shot at 0.8 scale. Released as react 0.2.2 / tokens 0.2.1 / css 0.1.3. The
  coverage plan was dropped for a confidence plan: group 9.
- 2026-09-18 (later): the three code guardrails of group 4: token `$type` schema check, link check
  inside `storybook:build`, `pnpm check:floor` with lightningcss; the floor check's first run found
  Safari's missing `user-select` and iOS's `text-size-adjust`, both fixed and released as react 0.2.1 /
  css 0.1.2.
- 2026-09-18: Sheet landed on `main` through a branch and is on the site; a second Claude session
  had built a parallel Sheet in a worktree (identical API), its two extra doc edits ported and the
  worktree removed; the pnpm release-age note added to both READMEs. 0.2.0 released through
  `publish.yml` once the Trusted Publisher entries on npmjs.com pointed at `publish.yml` (they
  named `deploy.yml`; that, not npm/cli#9969, was why 0.1.0 had to be published by hand).
- 2026-09-17: visual regression live in CI (136 shots, CI-owned baselines) and `pnpm ci:local`
  (Colima, linux/amd64) built to reproduce and fix its first failures; `@pearpages/modals` 0.3.0
  released with `placement`; Sheet added on it; READMEs name the modals dependency.
- 2026-09-16: 0.1.0 published by hand (trusted publishing failed; cause found 2026-09-18: wrong
  workflow file in the npmjs.com entries); Combobox story
  flake fixed and `pnpm verify` added; the CV adopted pulp's tokens and `IconButton`, verified
  against the deployed site by screenshot diff; semantic token names pinned by a test; task list
  triaged.
- 2026-09-15: tier 5 (React Aria), cross-cutting docs/status/guardrails, Storybook categories,
  branding and credit; repo pushed, CI and Pages green, site live at https://pulp.pearpages.com.
- 2026-09-14: workspace, tokens, Button, tiers 1–4, decisions.

## Pending

Ordered within each group. Groups 1 and 2 are the gate to everything else being real.

**1. Ship it (needs Pere's accounts)**
- [x] Create `github.com/pearpages/pulp`, push `main`, enable Pages (source: GitHub Actions). (2026-09-15)
- [x] DNS: CNAME `pulp` → `pearpages.github.io`; set the custom domain in the repo's Pages settings (2026-09-15)
      (`apps/storybook/public/CNAME` already carries it).
- [x] Watch the first `deploy.yml` run; confirm https://pulp.pearpages.com serves the Storybook. (2026-09-15, green from `c38f35d`; the two runs before it caught a typecheck that only passed locally and an axe finding only visible in CI)
- [x] `LICENSE` (MIT) at the root and a copy in each of the four packages: npm packs the file from the
      package directory, not the repo root. All four `pnpm pack` tarballs carry it. (2026-09-15)
- [x] Sample email in `TextField.stories.tsx` and `Form.stories.tsx` is now `hello@pearpages.com`,
      the public address (the personal one stays only in git history). (2026-09-15)
- [x] npmjs.com: register `@pearpages/pulp-tokens`, `@pearpages/pulp-css`, `@pearpages/pulp-icons`, `@pearpages/pulp-react`
      as Trusted Publishers for `pearpages/pulp` + `publish.yml` (the names cannot be registered
      before a first publish: do a one-off manual `npm publish` from a `pnpm pack` tarball, or
      publish 0.0.0 placeholders, then register). (2026-09-15: 0.0.0 placeholders published by
      hand from `pnpm pack` tarballs, all four registered; deprecating the 0.0.0s is the last item of group 7)
- [x] One first-release changeset per package (`.changeset/first-release-*.md`), replacing the 15
      tier-by-tier ones: there is no earlier release to describe changes against. (2026-09-15)
- [x] A `README.md` in each of the four packages: npm takes the package page from the package
      directory, as it does LICENSE. (2026-09-15)
- [x] `pnpm version-packages` → 0.1.0, committed (`a9458ba`), pushed, tagged `v0.1.0`. (2026-09-16)
- [x] **0.1.0 is on npm**, all four packages, published by hand with 2FA codes. (2026-09-16)
      `publish.yml` ran on the tag and failed at npm's OIDC exchange with
      `404 … package not found` → `ENEEDAUTH`. Diagnosed that day as npm/cli#9969 (immutable OIDC
      subject claims); wrong. Found on 2026-09-18: the Trusted Publisher entries on npmjs.com named
      `deploy.yml` as the workflow file, not `publish.yml`, and npm reports an entry that does not
      match the token as "package not found". Fixed in the four entries; the workflow has published
      on its own since. Cost: 0.1.0 has no provenance attestation.
- [x] Verified from npm in a scratch Vite app (2026-09-16): all four packages resolve at 0.1.0,
      per-component entries (`/button`, `/icon`) and the two stylesheets import as the README says,
      an icon from `@pearpages/pulp-icons` renders inside `Icon`, and `vite build` emits a 98.8 kB
      stylesheet carrying the tokens, the `--button-*` variables and `@layer components`.
- [x] README (root and `packages/react`): pnpm 11 defaults `minimumReleaseAge` to 1440 minutes, so a
      fresh release cannot be installed with pnpm for 24 hours; consumers who want it sooner add
      `minimumReleaseAgeExclude: ['@pearpages/*']`. npm and yarn have no delay. (2026-09-18)
- [x] **Release 0.2.0** (2026-09-18): Sheet, its two semantic tokens and the modals `^0.3.0` bump.
      `pnpm version-packages` → react and tokens 0.2.0, css 0.1.1; `pnpm verify` green; commit
      `9d658a3` "Version packages: 0.2.0", `deploy.yml` green, tag `v0.2.0`. `publish.yml` failed
      at the OIDC exchange for tokens with the same "package not found" as 0.1.0; the cause was the
      Trusted Publisher entries naming `deploy.yml`. Once they said `publish.yml`,
      `gh run rerun 35322825711 --failed` published tokens, and a second re-run css and react, all
      with provenance and no 2FA codes; already-published versions are skipped. `npm view`: tokens
      0.2.0, css 0.1.1, react 0.2.0 (peer tokens `^0.2.0`, modals `^0.3.0`), icons 0.1.0.
- [x] **Release 0.2.1** (2026-09-18): the two fixes the support-floor check found (Button
      `-webkit-user-select`, the reset's prefixed `text-size-adjust`). react 0.2.1, css 0.1.2; tokens
      0.2.0 and icons 0.1.0 unchanged. `63b6449` (deploy run 35352192635, the new checks' first
      Linux run) → `f2b8c48` "Version packages: 0.2.1" (35355470363) → tag `v0.2.1` → `publish.yml`
      35356661150, the first publish that needed no re-run, with provenance. The registry served
      the old `latest` for about a minute afterwards: check `registry.npmjs.org` or wait before
      concluding a publish failed. Verified in the published tarballs (`dist/button.css`,
      `src/reset.css`). `v0.2.1` is a lightweight tag where `v0.2.0` is annotated; no effect.
- [x] **Release 0.3.0** (2026-09-19): group 10, merged as PR #1 (`690ae19`). react 0.3.0, tokens
      0.3.0, icons 0.2.0, css 0.1.4 (its tokens dependency); 15 changesets. `5cda6f3` "Version
      packages: 0.3.0": its deploy run (35431216843) went red on the Combobox `Default` story, a
      flaw in the story fixed in `adaa7d1` (group 6), and green on the re-run; annotated tag
      `v0.3.0` on the version commit → `publish.yml` 35432436765, first try, with provenance.
      Verified in the published tarballs: `"use client";` opens `dist/tabs.js` and not
      `dist/text.js`; the 18 files of the six new entries are there; tokens carries `theme.css`
      (`@theme inline reference`), `native.{js,cjs,d.ts}` and `--color-surface-overlay`; icons has
      the new glyphs; react's peer is tokens `^0.3.0` and its icons dependency `^0.2.0`.
      `docs/bitepals-consumer.md` deleted with this release, as it asked. **bitepals can start.**

**2. Consumer: the CV site (`~/Projects/cv`)**
Done 2026-09-16, committed in that repo (`7b2ac44`). The CV is pulp's reference consumer; its own
follow-ups (deploying, a `Button asChild` pass over its anchors) live in that repo, not here.

- [x] `@pearpages/pulp-tokens` + `@pearpages/pulp-react` installed. **Not `pulp-css`**: it carries
      pulp's reset and base, and the CV keeps its own. `main.tsx` imports `tokens.css` plus the
      `button`/`icon-button`/`icon` stylesheets.
- [x] `data-brand="pulp"` on `<html>`; `data-theme` renamed to `data-scheme` in the pre-paint script
      and `useTheme.ts`. The CV's "absent until an explicit choice" invariant is pulp's contract
      already, so the model transferred unchanged.
- [x] **No alias layer**: the CV's colour tokens are deleted and its 17 stylesheets read pulp's
      semantic names directly (96 uses). Pere's call, and the right one — an alias shim would have
      let the site drift back to its own vocabulary silently.
- [x] `_tokens.scss` 164 → 91 lines. Gone: the raw palette, the semantic colours, the `dark-scheme`
      mixin, both emissions and the "[data-theme] blocks must stay last" specificity trap. Kept:
      `--ultramarine` (Act I paints it as a ground; `--color-action-primary` lifts in dark and must
      not), `--signal`/`--on-signal`, `--logo-chip`, and the site's own type, space and motion scales.
- [x] Theme toggle → `IconButton variant="ghost"`, keeping the static `label` + `aria-pressed` +
      `title` design. `.nav__theme` deleted. It renders 40×40 where the hand-rolled box was 36×36.
- [x] New `src/styles/layers.css`, imported **first** (layers rank by first appearance), and
      `_reset.scss` wrapped in `@layer reset` — otherwise its unlayered `button { font: inherit }`
      beats pulp's layered button styles. The CV's component CSS stays unlayered and still wins.
- [x] Verified: typecheck, `npm run build` incl. the five PDF gates (`1 page, 59 KB`), and a
      Playwright pass over the built site — all six scheme combinations correct (OS-follow, forced
      light and forced dark under both OS preferences) and the toggle round-trips `aria-pressed`,
      `data-scheme`, `localStorage` and the `theme-color` meta. Vite 8's Lightning CSS rewrites
      `light-dark()` into its own polyfill but emits all three axes, so forcing still works.
- [x] Linked from pulp's README as the reference consumer. (2026-09-16)

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
- [x] Sheet (2026-09-17): Dialog docked to an edge. `@pearpages/modals` 0.3.0 shipped `placement`
      the same day (decision 003: the vendor learns to dock, pulp maps sizes). `Sheet.Content` is a
      real wrapper, unlike `Dialog.Content`, which *is* the vendor's: it adds `placement`
      (`start | end | top | bottom`, default `end`; no `center`) and the class that sets
      `--modal-width-sheet`, `--modal-height-sheet` and `--modal-animation-translate-sheet` from
      `--sheet-*` on the dialog element itself, where an own declaration beats the vendor's `:root`
      default whatever the layer. New semantic `size.sheet-width`/`size.sheet-height` in both
      brands and in the pinned name list. The vendor-variable test now discovers stylesheets.
      Landed through a branch so the four new visual baselines existed before `main` saw it.
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
- [x] Token schema validation (2026-09-18): `scripts/schema.mjs` walks the raw JSON; every one of
      the 1,081 tokens has a known *effective* `$type` (about 600 inherit a group's, so "own" would
      have been the wrong rule), unknown `$` keys fail, and a fixture test proves each message fires.
- [x] Published semantic token names pinned in `packages/tokens/scripts/public-tokens.mjs` and
      asserted by `build.test.mjs` (2026-09-16). The CV writes those names in 17 stylesheets, and a
      rename fails *silently* there: `var()` of a missing token drops the declaration and the page
      repaints. The test turns that into a deliberate edit plus a changeset.
- [x] The React package's public API pinned in `packages/react/api.snapshot.txt` (412 lines) and
      asserted by `src/test/dist.smoke.test.tsx` via `toMatchFileSnapshot` (2026-09-16). Pinned:
      components, parts, status, prop names, required, types and defaults. Not pinned: prose, so
      docs edits do not churn it. The manifest now keeps literal-union members (`values`), which
      it used to flatten to `"enum"` — before that, removing `variant="ghost"` changed nothing.
      Checked: dropping a prop line fails, and with `CI=true` a missing snapshot fails rather than
      being rewritten. Limit, stated honestly: commits go straight to `main`, so "without a
      changeset" cannot be checked against a PR base; the snapshot makes the change a deliberate
      `test:dist -u` plus a changeset instead.
- [x] Bundle-size budget for `packages/react/dist` (2026-09-15, see cross-cutting).
- [x] Link check at the end of `storybook:build` (2026-09-18): `apps/storybook/scripts/check-links.mjs`
      over `storybook-static/index.json`. A broken *import* already failed the build; this covers
      what did not: an MDX page missing from the index, a component whose `docsPath()` is no page
      (checked with the Status page's own function), a dead literal `?path=`, and a decision record
      missing from `Decisions.mdx` or the folder README. Proven by breaking `STORY_OF` and by a
      stray record file.
- [x] Support floor enforced (2026-09-18): `pnpm check:floor` (`scripts/check-support-floor.mjs`, in
      `verify`, `ci.yml`, `deploy.yml`) transforms the 43 shipped stylesheets with lightningcss, floor
      as targets against no targets, and fails on any difference; a built-in probe fails the script
      if lightningcss ever lowers nothing. As a check, not a build step: the stylesheets stay
      unlowered (PRINCIPLES §4). First run found two real gaps, fixed at the source with patch
      changesets: Button's `user-select: none` did nothing in Safari (no unprefixed support), and the
      reset's `text-size-adjust` nothing on iOS. Limit: unknown properties pass (`field-sizing`,
      `@property`).
- [x] Decision record 005 (2026-09-19, see group 10): written; the per-component split it
      describes stays deferred. Original note: the shape of the token output. Measured 2026-09-16 on `tokens.css`
      (46.4 kB raw): **component tokens are 66% of it** (30.8 kB), the bitepals block only 7.8 kB.
      Splitting per brand is the wrong cut: it saves at most 1.4 kB brotli for a one-brand consumer,
      costs ~760 B for anyone loading both, and breaks brand nesting and the Storybook brand toolbar
      (an attribute flip over a stylesheet that holds both). The cut that would pay is shipping each
      component's tokens in its own stylesheet, so a consumer carries only what it renders. Record
      the decision first; the refactor touches `build.mjs`, the component→semantic test, the dist
      smoke test and the docs.
- [x] `pnpm ci:local` (2026-09-17): the pipeline in CI's Playwright image as linux/amd64, in a
      throwaway Colima profile (`scripts/ci-local.sh`, `docs/ci-local.md`). Built to reproduce the
      visual check's first failures; it turned "Toast hangs" into a bounded matcher and an
      animation fix in two-minute loops, and it reports flakes the retry hides. Limits: system
      fonts differ from the runner's, Rosetta is emulation.
- Dropped (2026-09-16): a pre-commit hook. `pnpm verify` runs the same chain before pushing, and a
  hook would slow every commit to duplicate it.

**5. Docs**
- [ ] Introduction: add a "how a brand is added" walkthrough (copy `semantic/pulp.json`, change
      references, done) with a screenshot of both brands.
- [ ] Tokens page: explain the tiers with a diagram; show the `space.unit` density knob live.
- [x] Per-component docs page pattern (2026-09-15, see cross-cutting).
- [ ] README: badges (CI, npm), a short "why native CSS, why no Tailwind in a library" section.
- [ ] `Dialog.stories.tsx` still carries a `parameters.docs.description` although the rule is that
      stories carry none (the docs page reads the JSDoc). Either a one-line "known exception" note in
      the file saying why, or remove it and put the vendor-stylesheet sentence in Dialog's JSDoc.
- [x] Storybook branding (2026-09-15): favicon and wordmark (hand-drawn SVG mark: geometric p on
      ultramarine, saffron signal), manager theme derived from the tokens, brand typefaces in the
      manager, Introduction masthead, a credit line on every docs page, `author` in every package.
      The tab title stays the vendor's ("<page> ⋅ Storybook"); it is not configurable.

**6. Testing gaps**
- [x] Storybook Vitest in CI needs Chromium: confirm the `playwright install --with-deps` step works (2026-09-15: works)
      on `ubuntu-latest` (first push will tell).
- [x] Combobox `Default` story flake, twice red in `deploy.yml` (2026-09-16): `{ArrowDown}` left
      `aria-activedescendant` null. React Aria clears the focused key when the filtered collection
      re-renders, so a key pressed mid-filter highlights nothing. The story now waits for the
      collection to settle and presses until the highlight sticks (the exact id stays pinned by the
      jsdom unit test), and the storybook Vitest project retries once: a real browser can drop an
      event, anything failing twice is real.
- [x] Visual regression of the 136 matrix stories (2026-09-17, live in CI; one hidden flake still
      open, below). Vitest's
      `toMatchScreenshot` from one `afterEach` in `preview.tsx`, bridged by
      `.storybook/vitest.visual.setup.ts` and live only under `VITE_VISUAL=1`; baselines in
      `apps/storybook/visual-baselines/`, rendered only by `visual-update.yml` because macOS and
      Linux rasterise text differently. Proven locally before deleting the macOS PNGs: 136 shots,
      2.8 MB; two clean runs identical; a border nudged `#d5d7de → #c0c3cc` fails 20 stories with a
      readable diff — but only at threshold 0.02, the default 0.1 passed it; Calendar's "today" is
      frozen. Bootstrapped without a red deploy: pushed with the flag off, `visual-update.yml`
      committed the 136 Linux baselines (`44564ef`) and redeployed, then `VITE_VISUAL: '1'` went
      onto the `test:storybook` step of `deploy.yml` and `ci.yml`. The first live run went red:
      134 of 136 matched, Toast in bitepals timed out. Reproduced with `pnpm ci:local`
      (`docs/ci-local.md`): not a hang but `expect.element` retrying a real mismatch until the test
      timeout (now bounded to 4 s, so it fails with its message and diff). Against baselines
      rendered in the same container, 5 compares: Toast bitepals 3/5 (one description line,
      "dist/tokens.css matches its source."), DatePicker pulp light 1/5 (focus ring present or
      not); everything else deterministic. Disproved by running them: frozen `Date`, font-load order.
      **Fixed:** Toast — animations and transitions are off from before the first render, for
      shot stories only (Chromium keeps text rasterised while its layer animated; blanket-off broke
      Combobox's interaction story): 0 mismatches in 25 compares. Final container run 10/10 green.
      **Still open:** DatePicker pulp light mismatched on a first attempt in 4 of those 10 (its
      `data-focus-within` ring; Combobox bitepals light once), absorbed by `retry: 1`. Waiting for
      focus to settle did not cure it; it is always the first matrix story of the file, so suspect
      window focus under file parallelism (try `--no-file-parallelism`). `pnpm ci:local visual N`
      lists such hidden flakes per run. Landed: baselines re-rendered on GitHub (`312a8d7`, 5 shots
      changed) and `VITE_VISUAL` back on in `deploy.yml` and `ci.yml`.
- [x] Combobox `Default` (interaction) failed **twice in a row** in the deploy run of the 0.3.0 version
      commit (35431216843, 2026-09-19), on code that had just passed in the PR and in the merge
      deploy. Cause, read from the failure dump: `onChange` was never called. The story captured
      the Sweden option *before* its ArrowDown retry loop; React Aria re-renders the options as the
      highlight moves, so `userEvent.click` was handed a node no longer in the document. A flaw in
      the story, not the component (a real pointer hits what is under it). Fixed: the option is
      looked up at click time inside the `waitFor`, as the arrow step already did. Five clean local
      runs; the retry stays, but this was not what it is for.
- [ ] DatePicker's first matrix shot (and Combobox's, rarely) mismatches on a first attempt and
      passes on the retry: find the cause with `pnpm ci:local visual 10`, starting with
      `--no-file-parallelism`. Same family: Combobox `Default` (interaction, not visual) failed
      once in ten Linux runs.
      More evidence (2026-09-17): `visual-update.yml` re-renders all shots, and while adding
      Sheet it also rewrote four baselines Sheet cannot touch. Measured old vs new: DatePicker pulp
      light 1,405 px along the field border (the `data-focus-within` ring, present or not);
      Combobox, two shots, 7 and 11 px in the last three pixel columns at field height (the ring's
      edge, clipped by the viewport); Form pulp dark 37 px with a channel delta of 2/255, below the
      comparator's threshold, i.e. rendering noise. All focus rings: fix the ring's state at shot
      time, and consider padding the body so a ring is never clipped at the viewport edge. Until
      then every re-render may flip those shots between their two states.
      Also known: bitepals' mono family is system fonts, so those shots depend on the runner
      image's fonts and need re-rendering when GitHub changes them.
- [ ] Keyboard-only interaction tests for Button `asChild` links (Enter/Space semantics).
- [ ] Forced-colors (Windows high contrast) story and a `@media (forced-colors: active)` rule set.
- [ ] Reduced-motion: the global reset freezes the spinner to a static ring; decide whether that is
      the intended indicator or a slow spin is better.

**7. Housekeeping**
- [ ] Upgrade path notes: Vitest 5 once `@storybook/addon-vitest` accepts it; ESLint 10 once
      `eslint-plugin-react` accepts it; TypeScript 7 once tsup's dts build accepts it.
- [ ] Dependabot or Renovate config with grouped updates.
- Dropped (2026-09-16): CODEOWNERS and a PR template. One maintainer committing to `main`; revisit if
  the repo takes outside contributions.
- [ ] Least important, optional hygiene: `npm deprecate @pearpages/<name>@0.0.0 "placeholder, use
      0.1.0"` for all four (four authenticator codes). It barely matters: `latest` is 0.1.0, a
      `^0.0.0` range matches only 0.0.0, and nothing depends on the placeholders, which existed only
      so the names could be registered as Trusted Publishers.

**8. Known vendor limits (react-aria-components 1.21, react-aria 3.52)**
- A pointer press on a calendar day registers window focus listeners that throw on a focus event whose
  target is the Window (seen in the Storybook iframe; a first click into an unfocused page may hit it
  too). Console error only, no state corruption. Track upstream; the calendar stories use the keyboard.
- `Select`/`ComboBox` support `selectionMode="multiple"` in this version; pulp exposes single only for
  Picker and Combobox and points multiple choice at Listbox. Revisit if a multi-select field is needed.

**9. Confidence: what is actually painted (2026-09-18)**
- [x] Layer order restated in every shipped stylesheet (38 component modules, `reset.css`,
      `base.css`, `tokens.css`, the scaffold template), with drift tests against `layers.css` in
      the dist smoke test, the tokens test and the css package's first test file.
- [x] `pnpm test:site` (`apps/storybook/scripts/check-built-site.mjs`): on the broken build it
      reported the layer order `components, reset, …` and Button losing padding, border, weight,
      background and colour; on the fixed build 263 stories pass. Proven again after tuning by
      stripping the statement from the built CSS. Checker limits met and handled: em and
      currentcolor dependence (font-size and color pinned), logical/physical twins, inline styles.
- [x] **Release 0.2.2** (2026-09-18): react 0.2.2, tokens 0.2.1, css 0.1.3; icons stay 0.1.0. npm
      consumers were exposed to the same ordering bug whenever their bundler loaded a component
      stylesheet before `@pearpages/pulp-css`. `50ef5db` "Version packages: 0.2.2" (deploy run
      35377802296) → annotated tag `v0.2.2` → `publish.yml` 35381380788, first try, with provenance.
      Verified in the published tarballs: the `@layer reset, …` statement opens `dist/button.css`
      and `dist/index.css` (react), `dist/tokens.css` and `src/reset.css`; react's peer is tokens
      `^0.2.1`. The statement repeats once per bundled module (4× in `button.css`): harmless, a
      few bytes after compression, could be deduplicated in tsup's `onSuccess` if it ever matters.
- [x] Looked at the deployed site after the fix landed (2026-09-18, run 35372565351): the Button
      docs page paints a filled button, 16 px padding, 1 px border.
- [x] The matrix screenshots are now of the *built* site (2026-09-18): `@playwright/test` over
      `storybook-static`, same baseline paths, threshold 0.02; the Vitest `toMatchScreenshot` path
      and `VITE_VISUAL` are gone (`PULP_VISUAL` replaces it). Locally: 140 shots in 26 s, two
      compares identical; with the layer statement stripped from the built CSS every Button,
      IconButton and TextField shot fails. The new shots are the page as served (story centred by
      Storybook's layout), so a trigger no longer sits at the viewport edge with its ring clipped.
      Landed through branch `visual-built-site` so the re-rendered baselines exist before `main`
      runs the check. Baselines re-rendered from the built site by `visual-update.yml` run
      35373533548 (`c110667`, 140 PNGs). Old against new: every new shot is exactly 1.25× the old
      one (Spinner row 276×32 → 344×40): the Vitest shots were taken inside its scaled-down test
      iframe, so a 40 px Button measured 32 px in its own baseline, and some carried a band of the
      iframe's unthemed background. The new ones are true size, cropped to `#storybook-root`. A
      pixel diff across the two sets is therefore meaningless; sampled by eye (Button, Alert,
      Table, Menu): same design, nothing lost. Noted for the component review: in bitepals the
      Table's selection checkboxes render as circles (pill radius) and read as radios.
- [ ] `:has()` below the floor: `select/Select.module.css` colours the placeholder with
      `&:has(option[value=""]:checked)`, and Firefox 120 (the declared floor) has no `:has()` (121
      does). `check:floor` cannot see it: lightningcss does not lower `:has()`. Found 2026-09-18
      while building Chip, whose own `:has()` hover was replaced before it shipped. Either set a
      `data-placeholder` from React, or raise the Firefox floor to 121; and teach `check:floor` a
      small deny-list of selectors and properties lightningcss passes through (`:has(`,
      `field-sizing`, `@property`) with the documented exceptions named.
- [ ] Consumer fixture: a Vite app built from `pnpm pack` tarballs, imports in the README order and
      in the wrong order, same painted-value checks (replaces the by-hand check of 2026-09-16).
- [ ] Component review by eye on the deployed site, tier order, four brand × scheme pairs each;
      findings get a failing test at the level that would have caught them, then the fix. Start:
      Button, IconButton, TextField, Checkbox, Dialog, Menu, Combobox. Pere: Safari + VoiceOver.

**10. bitepals as the second consumer (2026-09-18, branch `bitepals-consumer`)**

Promoted from "Later". bitepals (`~/Projects/bitepals`, Next.js 16 App Router + Tailwind v4 web, Expo +
NativeWind mobile) drops its own `packages/tokens` and hand-rolled design system for pulp, then takes
Tailwind out of the web app. Its side of the plan, with the token and component reconciliation
tables, is `~/Projects/bitepals/tasks.md`. What it needs from pulp, in the order it unblocks it:

Infrastructure (unblocks the token swap; nothing in bitepals can start before the first two)
- [x] `'use client'` (2026-09-18). `scripts/client-entries.mjs` decides per entry from source
      (client-only React APIs or a client package anywhere in its relative imports), `pnpm build`
      stamps `"use client";` on those built entries (26 of 44, the barrel included), the manifest
      gains `client`, the Status page a "Renders in" column, the react README a section. Chunks
      need no directive: esbuild's splitting puts a shared module in the chunk of exactly the
      entries that reach it, so a server-safe entry never imports client code; proven rather than
      assumed, by importing all 18 server-safe entries under `node --conditions=react-server` in
      `test:dist` (where Tabs fails with "Named export 'createContext' not found": the error an
      App Router consumer got). Server-safe: Text, Heading, Stack, Inline, Card, Divider, Badge,
      Skeleton, Spinner, Progress, Icon, VisuallyHidden, Link, Button, IconButton, Alert,
      Pagination, EmptyState. Still to do with group 9's consumer fixture: an RSC import there.
- [x] Decision record 005 and its two outputs (2026-09-19): `docs/decisions/005-token-outputs.md`
      (one `tokens.css`; per-brand split rejected, per-component split deferred with its trigger;
      confirmed by Pere 2026-09-19). `./theme.css` is `@theme inline reference` over semantic colour,
      radius, shadow and font family. `reference` is load-bearing: compiled with tailwindcss 4.3.0,
      plain `@theme inline` still writes `:root { --x: var(--x) }` into Tailwind's `theme` layer,
      which outranks `@layer tokens`, and the cycle invalidates the token (bitepals got away with
      it because its own variables were unlayered). `./native` is per brand
      `{ colors, radius, space, themeVars: { light, dark } }`, names as `var()` references and
      `themeVars` as hex and px resolved through the brand's `space.unit`, ESM + `require`.
      `tokens.json` already had both schemes' values, so no `valueDark`. Generated by
      `scripts/outputs.mjs`, committed, inside the same drift check; 4 new tests.
- [x] The two semantic gaps (2026-09-19, decided by Pere). **Added:** `color.surface.overlay`, what
      floats above the page. pulp `neutral.0` / new `neutral.875` (#1a1e29); bitepals `cream.100`
      / `ink.600` (#fcf3df / #202938, bitepals' own `bg-elevated`). In light it may equal
      `raised`; in dark it is one step lighter, because a shadow alone does not separate a menu
      from a card there. Dialog (and Sheet through it), Menu, Popover and the DatePicker popover
      read it; Combobox and Picker gained `--<name>-popover-bg`, since their list shares the inline
      Listbox's styles. Pinned in `public-tokens.mjs`; the contrast test covers default, muted,
      action and error text on it (lowest 5.27:1). Dark overlay baselines move. **Not added:** a
      quieter border. pulp's `border.default` is already quiet and nothing here needs a fainter
      line, so **consumers snap**: bitepals maps its `border-subtle` to `border.default`.

Extensions to existing components
- [x] Button and IconButton `tone: 'default' | 'danger'` (2026-09-18), orthogonal to `variant`:
      filled for `primary` (`status.error` / `error-hover` / `error-active`, `on-error` text), and
      the error text colour with an `error-subtle` hover for `secondary` and `ghost`. `data-tone`
      only when it is `danger`. **Two new semantic tokens, agreed with Pere:**
      `color.status.error-hover` and `color.status.error-active` in both brands (pulp and bitepals
      `red.700` / `red.800` in light, `red.200` / `red.400` in dark: away from the on-error text,
      so bitepals darkens here although its action colours brighten), with three new red
      primitives per brand, pinned in `public-tokens.mjs`, and in the contrast test (lowest pair:
      bitepals dark active, above 4.5 only after moving `red.400` from #eb5858 to #ee6060).
- [x] Toast `toast.undo(message, onUndo, options?)` (2026-09-18). The `action` half was already
      there and tested (`action: { label, onClick }`, runs then dismisses; shipped in 0.1.0), so
      the sketch's `onAction` name was **not** adopted: renaming a published prop is a breaking
      change for nothing. `toast` is now a function with an `undo` property: message as the title,
      an "Undo" button (`label` for other languages), 8 s by default because there is something
      to read, decide and reach; `description`, `tone`, `duration` can be set. Tested: the toast
      does not take focus, outlives the provider's default, and timing out never calls `onUndo`.
      bitepals' per-variant durations (4 / 6 / 5 s, errors included) do not carry over: pulp keeps
      error toasts until dismissed.
- [x] TextField search affordance (2026-09-18): `iconStart` (decorative; `type="search"` defaults
      to the Search glyph, `null` opts out), `onClear` + `clearLabel` (a real button after the
      input, present only with a value and never while disabled or read-only; it empties an
      uncontrolled input itself and returns focus to the input), Escape clears and stops there, so
      a dialog around the field does not also close, and `hideLabel` (Slider's precedent), because
      bitepals' search boxes have a placeholder and no label. The wrapper exists only when there is
      an icon or `onClear`: a plain TextField renders the same DOM as before. bitepals'
      `variant="filter"` is `iconStart` with a Filter glyph (comes with the icons). The browser's own
      search cancel button is hidden. Seen while here: `TextField.stories.tsx` also carries a
      `parameters.docs.description`, like Dialog's (group 5).
- [x] Badge `variant="dot"`, `count`, `max`, `label` (2026-09-18): the dot is the tone's solid fill
      with no text, and its `label` is rendered visually hidden (a dev warning without one; flat
      props rather than bitepals' discriminated union, so the manifest stays readable). `count`
      clamps to `max` (default 99 → "99+") and renders nothing at zero or below; with a `label` it
      reads "3 unread". No `role="status"`: bitepals' NavBadge made every badge a live region,
      which announces a count that was there when the page loaded. Covers NavBadge (6 uses).
- [x] Sheet drag to dismiss (2026-09-18): `Sheet.Content` renders a grab handle when
      `placement="bottom"` (`dragToDismiss`, default true). Pointer events with pointer capture,
      the offset delivered as `--_drag` and applied with `translate` (the vendor animates
      `transform`), closing through the vendor's `useModalStack().close(id)` so `onOpenChange`
      and the focus return are the usual ones. `sheet/drag.ts` holds bitepals' `shouldDismiss()`
      with its thresholds and test cases, and `releaseVelocity()` over the last 100 ms. The handle
      is `aria-hidden` and not focusable (Escape and `Sheet.Close` remain the keyboard's way out)
      and is not rendered under `prefers-reduced-motion`. No animation library. Decision record
      003 has the paragraph.

New components (scaffold + the add-component skill; `@status experimental`; one changeset each)
- [x] Divider (Layout, 2026-09-18): `orientation: 'horizontal' | 'vertical'`, `spacing: 'none' | 'sm' | 'md' | 'lg'`
      (space 2 / 4 / 6), `decorative` (default true → `role="none"`; false → `role="separator"` with
      `aria-orientation`). Tokens: `divider.color` → `color.border.default`, `divider.thickness` →
      `size.hairline`.
- [x] Link (Typography, 2026-09-18): `tone: 'action' | 'default' | 'muted'`, `underline: 'always' | 'hover'`, `asChild` so a router's link slots
      in (next-intl's `Link` in bitepals), underline rules, the focus ring from the semantic tier.
      Replaces bitepals' TextLink and, with Button `asChild`, its ButtonLink.
- [x] Avatar (Utilities, 2026-09-18): `name` → initials (first and last word, by code point) when
      there is no image or it fails (keyed on the failed source, so a new `src` retries without an
      effect), `src`, `alt` (defaults to `name`; `""` → decorative), `size: 'sm' | 'md' | 'lg' | 'xl'`
      (control sm / md, then md × 1.4 and lg × 2, so density follows the brand), an image element as
      the child so `next/image` takes the styles and the error handling. With initials the root is
      `role="img"` and the letters are `aria-hidden`. Background: `color.status.neutral-subtle`,
      one token for everyone; bitepals' `color` prop and `stringToColor` do not carry over.
- [x] Chip (Actions, 2026-09-18): a toggle when it has `selected` / `defaultSelected` /
      `onSelectedChange` (native button, `aria-pressed`; an `onClick` that prevents default cancels
      the toggle), `onRemove` → a second button *beside* the label named "Remove <label>" through
      `aria-labelledby` (`removeLabel` for other languages), the pair in a `role="group"` only when
      there are two controls; label-only when it neither toggles nor has `onClick`. `size`
      (24 / 32 / 40 px: `sm` is the WCAG 2.2 minimum target), `tone: 'neutral' | 'action'`,
      `disabled`. The pill is painted once on the root; both buttons are transparent. bitepals
      nested the remove button inside the chip's button, and passed a literal `color`: neither
      carries over. A static chip is a Badge: said in `@dont`.
- [x] SegmentedControl (Forms, 2026-09-18): generic `<T extends string>`, `options`
      (`value`, `label`, decorative `icon`, `disabled`), `value` / `defaultValue` / `onValueChange`,
      `name`, `look: 'segmented' | 'chips'`, `size: 'sm' | 'md'`, `fullWidth`, `disabled`. Built on
      **native radio inputs**, visually hidden over each segment: RadioGroup has no keyboard hook
      to share, its model is the browser's, so sharing it means using the same element; arrows,
      the single tab stop and form submission come with it (bitepals' `role="radio"` buttons had
      no arrow keys at all). Selection is a `data-selected` from state and the focus ring is drawn
      by `input:focus-visible + .segment`, so nothing needs `:has()` (Firefox 120 has none).
      The link flavour is **`SegmentedControl.Nav` + `SegmentedControl.NavItem`** (`current`,
      `asChild`): a labelled `nav` with a list of links and `aria-current="page"`, same tokens and
      stylesheet. Decided: navigation is neither a radiogroup nor Tabs; bitepals' `PairedViewToggle`
      marked links as `role="tab"`.
- [x] EmptyState (Feedback, 2026-09-18): `title` (a real heading at `headingLevel`, default 3),
      `description`, decorative `icon` in a tinted disc, one `action`, `tone: 'neutral' | 'error'`.
      Composes Heading, Text and Stack; its only tokens are the padding and the icon disc. Covers
      bitepals' EmptyState and ErrorState (39 uses): the retry is just the `action`. bitepals'
      ErrorState was always `role="alert"`, which shouts an empty region that renders with the
      page; here nothing is announced unless the caller passes `role="status"` / `"alert"`, and the
      JSDoc says when. Its glow and dot decorations are bitepals' own and stay there.
- [x] Icons (2026-09-18): 40 new glyphs, 52 in the set. **All drawn for pulp**, none copied:
      bitepals' file records no source and several glyphs look like a published set's, which is
      not something to paste into a package pulp publishes under its own licence. Of bitepals' 64:
      8 are its domain and stay (five Hub glyphs, Following, Followers, Requests); 9 already
      existed here (Search, X→Close, two chevrons, Plus, Check, AlertTriangle→Warning,
      InfoCircle→Info, Calendar); duplicates collapsed (Person→User, Circles/Follow/ShareNodes→
      Share, Share/PaperAirplane→Send, People/Friends→Users); the two filled variants are
      `fill: currentColor` on the outline glyph, said in the README. Mapping for bitepals:
      Feed→Page, Document→Note, Map→MapFolded, Favorites→Heart, Edit→Pencil, Delete→Trash,
      Pin→MapPin, Shield→ShieldCheck, Photo→Picture, Discover→ZoomIn, Grip→GripVertical,
      QuestionMark→HelpCircle, Comment→Message, ShareOut→Export, Link→Chain, Settings (sliders,
      not a gear); the rest keep their names. `MapFolded`, `Picture` and `Chain` are named so
      because `Map` and `Image` shadow globals and `Link` is pulp's own component. No size budget
      moved: there is none for the icons barrel, and the react entries only bundle the glyphs
      they import.
- Not in this pass: ChipInput (wants React Aria's TagGroup), ImageGrid, a full-screen push sheet.

**11. What bitepals found using 0.3.0 (2026-09-20, branch `bitepals-feedback`)**

bitepals moved its tokens and ten primitives onto 0.3.0 and kept five things local because of gaps
here. The full write-up, with the bitepals source to read and the order, is
[`docs/bitepals-feedback.md`](docs/bitepals-feedback.md).

- [x] Accent palette (`color.accent.1…8`) and `accent` on Avatar and Chip (2026-09-20). Semantic
      `color.accent.N` + `color.accent.on-N` in both brands, hues in one order (blue, orange, green,
      violet, red, teal, amber, pink), `on-N` on `N` in the contrast tests. New primitive ramps (300 /
      700): orange, teal, violet, pink in pulp; teal, violet, pink in bitepals. Avatar: the colour
      behind the initials. Chip: filled when static or selected, the border of an unselected toggle
      (`data-toggle`). No hover step for a filled accent chip: that would be eight more semantic
      names. The stylesheet budget went from 9 to 10 kB (it measured 9.01).
- [ ] Overlays on a phone: visual-viewport handling in `@pearpages/modals`; a toast fired while a dialog
      is open stays pressable; document per-dialog widths
- [x] Toast: `bottom-center`, a separate block offset, `env(safe-area-inset-bottom)` (2026-09-20).
      `--toast-offset-block` is a new component token (same default as `--toast-offset`); both safe-area
      insets are added to it, so the top placements clear a notch too. A consumer that moved the stack
      vertically through `--toast-offset` now sets both: said in the changeset.
- [x] bitepals brand weights: medium 500 / semibold 600 (2026-09-20). The bitepals matrix baselines
      move with it: `visual-update.yml` after the push.
- [ ] Per-brand component tokens (decision record); bitepals gets a pill `button.radius`
- [ ] Primitive names collide with Tailwind's default theme: prefix the tier, or document the layer
      order next to `theme.css` (decision record)
- [ ] Subtle status badges vanish on bitepals' tinted surfaces; add the fill-on-surface pair to the
      contrast tests
- [x] Badge `tone="action"` (2026-09-20): solid on `color.action.primary` / `text.on-action`, subtle on
      `action.primary-quiet` / `action.text`, both pairs already in the contrast tests. In pulp it is
      the same hue as `info` (the brand is ultramarine); the meaning differs, the colour need not.
- [x] Textarea `hideLabel` (2026-09-20). The hidden-label rule moved from TextField's stylesheet into
      Field, behind `Field.Label visuallyHidden` (not `hidden`: that is the HTML attribute). Slider and
      Progress keep their own: they do not render a `Field.Label`.
- [ ] A static, server-safe Table next to the interactive one
- [x] SegmentedControl: labels overlap when the segments do not fit (2026-09-20). The segment had no
      `min-inline-size: 0`, so it stayed as wide as its words inside a 62 px slot; the label is now a
      span that ellipses and the icon is `flex: none` (it had been squeezed to zero width). `Narrow`
      story (four icon options in 24rem) with a play that compares each segment with its slot, and
      the same case in the matrix. Full-width segments stay equal, so "Liked" shortens next to
      "Recommended": four long labels belong in a Picker.
- [ ] `@pearpages/modals/styles.css`: drop `@charset`

## Later (not scheduled)
Deprecation codemods, Tailwind preset emitted from tokens, Figma sync (Tokens Studio reads the
DTCG files; dark values live in pulp's extension), a third brand to prove "one JSON file, zero component changes".
