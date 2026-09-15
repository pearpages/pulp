# pulp tasks

The pending work and the tiered roadmap. `CLAUDE.md` holds the rules and the toolchain facts;
this file holds what is left to do, ticked with a date when done. Ordered within each group.

## Recommended order (2026-09-15)

1. LICENSE file and the sample-email decision, then publish 0.1.0 (group 1).
2. The CV site as the reference consumer (group 2): turns the packaging story into a real one.
3. `@pearpages/modals` 0.3.0 (placement is built, uncommitted in that repo), then Sheet.
4. The manifest snapshot guardrail (group 4): a prop change without a changeset fails CI.
5. Docs (group 5): brand walkthrough, tokens diagram, README badges once npm exists.
6. The remaining guardrails, testing gaps and housekeeping.

## Session log

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
- [ ] npmjs.com: register `@pearpages/pulp-tokens`, `@pearpages/pulp-css`, `@pearpages/pulp-icons`, `@pearpages/pulp-react`
      as Trusted Publishers for `pearpages/pulp` + `publish.yml` (the names cannot be registered
      before a first publish: do a one-off manual `npm publish` from a `pnpm pack` tarball, or
      publish 0.0.0 placeholders, then register).
- [x] One first-release changeset per package (`.changeset/first-release-*.md`), replacing the 15
      tier-by-tier ones: there is no earlier release to describe changes against. (2026-09-15)
- [x] A `README.md` in each of the four packages: npm takes the package page from the package
      directory, as it does LICENSE. (2026-09-15)
- [ ] `pnpm version-packages` (consumes `.changeset/first-release-*.md` → 0.1.0), commit, push,
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
- [x] Storybook branding (2026-09-15): favicon and wordmark (hand-drawn SVG mark: geometric p on
      ultramarine, saffron signal), manager theme derived from the tokens, brand typefaces in the
      manager, Introduction masthead, a credit line on every docs page, `author` in every package.
      The tab title stays the vendor's ("<page> ⋅ Storybook"); it is not configurable.

**6. Testing gaps**
- [x] Storybook Vitest in CI needs Chromium: confirm the `playwright install --with-deps` step works (2026-09-15: works)
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
- [ ] CODEOWNERS and a PR template that repeats the contributing checklist.

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
