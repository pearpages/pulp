# 014. The token build runs on Style Dictionary, with pulp's own formats

Date: 2026-09-30. Status: accepted. It records a choice made with the first build on 2026-09-14,
written down afterwards; nothing here changes the build. First of three sibling records on build
versus buy: 014 (token output), 015 (`"use client"`), 016 (the component manifest). The rule they
share is stated here once.

## The rule 014–016 share

pulp adopts the standard *concept*, and the standard format where one exists: DTCG and Style
Dictionary for tokens, the React Server Components directive, a component manifest that agents read.
It keeps a bespoke *implementation* only for the part that encodes pulp's own model, where no
off-the-shelf option expresses it: brands, layers and schemes in the token output; one entry per
component, server-safe unless proven otherwise; a component contract validated at build time and
shipped with the package. Three conditions hold the bespoke part in check, in all three records:

- **It stays small**, and the standard tool keeps everything that is not pulp-specific.
- **It is proven by a test**, not trusted: a drift check, `test:dist`, a build that fails on a
  missing tag.
- **It names the upstream change that would retire it**, in "Revisit when". When that change ships,
  the bespoke part shrinks or goes.

The cost is the same in each: code pulp maintains, with no upstream to take fixes from. Each record
says how much.

## Context

`packages/tokens/scripts/build.mjs` turns the DTCG JSON into `tokens.css` and `tokens.json`, and
`scripts/outputs.mjs` turns `tokens.json` into `theme.css` and `native` (record 005). A reader of
that code cannot tell which part is a standard tool and which is pulp's own, or why the line sits
where it does. There are three places it could sit:

1. **All standard.** Style Dictionary's built-in formats: `css/variables` for the stylesheet (with
   `outputReferences`, which keeps a reference as `var(--…)` instead of resolving it) and one of the
   `json/*` formats for the manifest.
2. **All bespoke.** A script that reads the JSON, merges the sources, resolves references and
   writes the files, with no Style Dictionary.
3. **Split.** Style Dictionary reads, merges and resolves; pulp writes the output.

What pulp needs from the output, and a built-in format does not give:

- A colour with a dark counterpart in `$extensions["com.pearpages.pulp"].dark` becomes
  `light-dark(light, dark)`. A shadow with one becomes two declarations, `--x-color` (the
  `light-dark()` pair) and `--x` (fixed geometry reading it), because `light-dark()` takes only
  colours.
- A token with `$extensions["com.pearpages.pulp"].multiply` becomes `calc(<reference> * n)`, which
  is how the spacing scale follows a brand's `space.unit`.
- Each brand is one block under its own selector (`:root, [data-brand="pulp"]` and
  `[data-brand="bitepals"]`), inside `@layer tokens`, after the restated layer order.
- `tokens.json` is a flat list per brand with pulp's fields: `tier` (from the source folder),
  `css`, the resolved `value`, `light` and `dark`, and, for semantic tokens, the `role` from
  record 013.

Both extensions are pulp's, so no off-the-shelf format knows them (principle 1 names them as the
two pulp-specific things in the files).

## Decision

**Option 3. Style Dictionary 5 owns input: reading DTCG (`usesDtcg`), globbing and merging the
sources, and resolving references (`resolveReferences` from `style-dictionary/utils`). pulp owns
output: two registered formats in `scripts/format.mjs` (`pulp/css`, `pulp/json`), and the
assembly of the final files in `build.mjs`.** Each platform is declared with `transforms: []`: the
formats emit from the token's source (`token.original`, its raw `$value` and `$extensions`), so Style
Dictionary's name and value transforms are deliberately off, and a CSS name is `--` plus the token's
path in one function (`cssName`).

- **Why not all standard.** `css/variables` with `outputReferences` gets as far as `var(--…)`. It
  cannot emit `light-dark()` or `calc()` from pulp's extensions, and the per-brand selectors, the
  layer and the manifest fields would still need a custom format or a post-processing pass. A
  custom format is the documented extension point, so that is where the pulp-specific part lives.
- **Why not all bespoke.** Input is the part with the edge cases: reference chains, composite
  values (a shadow's colour is itself a reference), group `$type` inheritance, several source
  files per brand. Those are what Style Dictionary exists to get right, and none of them is
  specific to pulp. Writing them again would buy nothing a consumer can see.
- **`theme.css` and `native` are bespoke, and outside Style Dictionary on purpose.** They are
  views of the semantic tier across the finished manifest (record 005): a filter and a rename over
  `tokens.json`, a few dozen lines in `outputs.mjs`. Style Dictionary builds one brand per
  instance, and these outputs need the whole manifest, so as formats they would fight the tool
  for no gain.
- **Drift is caught by the build, not a tool.** `build.mjs --check` renders in memory and compares
  with the committed `dist/`, so the check and the build can never disagree.

## Consequences

- `style-dictionary` is a devDependency of `@pearpages/pulp-tokens`, never shipped to a
  consumer. Its format API is what `format.mjs` is written against, so a major upgrade of Style
  Dictionary means re-checking two formats and the `resolveReferences` import. `pnpm check:tokens`
  (byte-for-byte drift) catches any change in output.
- Style Dictionary's merged tokens hide where a `$type` came from (a token's own or its group's),
  so the rule "every token has a known `$type`" cannot be checked on its output.
  `scripts/schema.mjs` walks the raw JSON instead, a second reader of the same source, kept small
  on purpose.
- The two extensions are defined in one place: `format.mjs` is the only code that interprets
  them. A new extension is a change there and a line in principle 1.
- Colours stay hex strings (principle 1). Moving to DTCG colour objects is a change to `toCss` in
  `format.mjs`, not to the tool.

## Revisit when

- Style Dictionary ships built-in support for per-scheme values (a `light-dark()` output from a
  DTCG mode or extension): then `pulp/css` can shrink to what is still pulp-specific.
- A third output needs something only Style Dictionary's transforms give (a platform like iOS or
  Android with unit conversion): write it as a Style Dictionary platform, not beside it.
- The formats grow past the point where the tool is doing the lesser share of the work: then
  option 2 becomes the honest description, and this record is superseded.

Siblings: record 015 (`"use client"` from source) and record 016 (the component manifest).
