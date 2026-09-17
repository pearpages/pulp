# pulp tasks

The pending work and the tiered roadmap. `CLAUDE.md` holds the rules and the toolchain facts;
this file holds what is left to do, ticked with a date when done. Ordered within each group.

## Recommended order (2026-09-17)

1. Decision record 005 on the shape of the token output (group 4).
2. Docs (group 5): README badges now that npm is live, brand walkthrough, tokens diagram.
3. The remaining guardrails, testing gaps and housekeeping.

## Session log

- 2026-09-17: visual regression live in CI (136 shots, CI-owned baselines) and `pnpm ci:local`
  (Colima, linux/amd64) built to reproduce and fix its first failures; `@pearpages/modals` 0.3.0
  released with `placement`; Sheet added on it; READMEs name the modals dependency.
- 2026-09-16: 0.1.0 published by hand (trusted publishing blocked by npm/cli#9969); Combobox story
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
      hand from `pnpm pack` tarballs, all four registered; deprecate the 0.0.0s once 0.1.0 is live)
- [x] One first-release changeset per package (`.changeset/first-release-*.md`), replacing the 15
      tier-by-tier ones: there is no earlier release to describe changes against. (2026-09-15)
- [x] A `README.md` in each of the four packages: npm takes the package page from the package
      directory, as it does LICENSE. (2026-09-15)
- [x] `pnpm version-packages` → 0.1.0, committed (`a9458ba`), pushed, tagged `v0.1.0`. (2026-09-16)
- [x] **0.1.0 is on npm**, all four packages, published by hand with 2FA codes. (2026-09-16)
      `publish.yml` ran on the tag and failed at npm's OIDC exchange with
      `404 … package not found` → `ENEEDAUTH`. Not our configuration: GitHub gives repos created
      after 2026-07-15 immutable OIDC subject claims (ours:
      `use_immutable_subject: true`, `sub_claim_prefix: repo:pearpages@3802915/pulp@1371223116`,
      not switchable), and npm's registry rejects the exchange for them —
      https://github.com/npm/cli/issues/9969, open, no fix. The Trusted Publisher config is correct
      and stays; on the next release just run the workflow again
      (`gh workflow run publish.yml --ref vX.Y.Z`), it skips versions that already exist.
      Cost: 0.1.0 has no provenance attestation.
- [x] Verified from npm in a scratch Vite app (2026-09-16): all four packages resolve at 0.1.0,
      per-component entries (`/button`, `/icon`) and the two stylesheets import as the README says,
      an icon from `@pearpages/pulp-icons` renders inside `Icon`, and `vite build` emits a 98.8 kB
      stylesheet carrying the tokens, the `--button-*` variables and `@layer components`.
- [ ] README: say that pnpm 11 defaults `minimumReleaseAge` to 1440 minutes, so a fresh pulp
      release cannot be installed with pnpm for 24 hours; consumers who want it sooner add
      `minimumReleaseAgeExclude: ['@pearpages/*']` to their `pnpm-workspace.yaml`. It bit the
      scratch install test; npm users (the CV) are unaffected.

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
- [ ] Token schema validation: every token has `$type` (the dark-counterpart and component→semantic
      checks exist in `build.test.mjs`).
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
- [ ] Fail `storybook:build` on a broken MDX import: a link check over `storybook-static`. (The a11y
      addon's `test: 'error'` in CI is already on.)
- [ ] A tool that honours `browserslist` (lightningcss in the build) so the support floor is enforced,
      not only declared.
- [ ] Decision record 005, the shape of the token output. Measured 2026-09-16 on `tokens.css`
      (46.4 kB raw): **component tokens are 66% of it** (30.8 kB), the bitepals block only 7.8 kB.
      Splitting per brand is the wrong cut: it saves at most 1.4 kB brotli for a one-brand consumer,
      costs ~760 B for anyone loading both, and breaks brand nesting and the Storybook brand toolbar
      (an attribute flip over a stylesheet that holds both). The cut that would pay is shipping each
      component's tokens in its own stylesheet, so a consumer carries only what it renders. Record
      the decision first; the refactor touches `build.mjs`, the component→semantic test, the dist
      smoke test and the docs.
- Dropped (2026-09-16): a pre-commit hook. `pnpm verify` runs the same chain before pushing, and a
  hook would slow every commit to duplicate it.

**5. Docs**
- [ ] Introduction: add a "how a brand is added" walkthrough (copy `semantic/pulp.json`, change
      references, done) with a screenshot of both brands.
- [ ] Tokens page: explain the tiers with a diagram; show the `space.unit` density knob live.
- [x] Per-component docs page pattern (2026-09-15, see cross-cutting).
- [ ] README: badges (CI, npm), a short "why native CSS, why no Tailwind in a library" section.
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

## Later (not scheduled)
Deprecation codemods, Tailwind preset emitted from tokens, Figma sync (Tokens Studio reads the
DTCG files; dark values live in pulp's extension), a second consumer (bitepals web) to prove the
bitepals brand in production, a third brand to prove "one JSON file, zero component changes".
