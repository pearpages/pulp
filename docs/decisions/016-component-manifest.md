# 016. The component manifest is pulp's own, not Storybook's

Date: 2026-09-30. Status: accepted. It records a choice made with the first build on 2026-09-14,
revisited now that Storybook ships a manifest of its own; nothing here changes the build. Third of
three build-versus-buy records; the rule they share is in record 014.

## Context

`packages/react/scripts/manifest.mjs` writes `dist/component-manifest.json`, and the package ships
it (`@pearpages/pulp-react/component-manifest.json`). Per component it carries:

- the props, from `react-docgen-typescript`: type, the members of a literal union (`values`),
  required, default, description;
- the JSDoc tags that are pulp's contract: `@status`, `@category`, `@accessibility`, and `@do` /
  `@dont` split into one bullet per line. The build fails when `@status` or `@category` is missing
  or not one of the allowed values, or `@accessibility` is empty;
- what a consumer needs to use it: the `import` line, the `css` entry, `client` (from the same
  analysis that stamps `"use client"`, record 015), the `tokens` glob (`--button-*`), and the
  `parts` with their `flat` names;
- and, once for the package, `categories` and a `requires` block (tokens, the optional packages,
  vendor stylesheets, fonts).

Its readers are the Storybook Docs page, the Status page, the sidebar label and category order,
`test:dist` (flat names, story titles), and coding agents, which read it from `node_modules` at the
installed version (principle 11: the manifest says what exists).

**The standard option.** Storybook 10 generates a components manifest itself, behind
`features.componentsManifest` (off by default; it was `experimentalComponentsManifest`, and 10.6
still reads the old name "for older Storybook versions"). It uses the docgen the project configures,
which for pulp is the same `react-docgen-typescript`. `storybook build` writes it to
`manifests/components.json` in the site, and `@storybook/addon-mcp` serves it to agents.

What it covers, checked against 10.6.0 as installed:

- the props, from the same parser, and the component's description;
- the JSDoc tags, **raw**: `jsDocTags` carries `@status`, `@category` and the rest as written;
- an import statement, and the stories as code snippets. That is something pulp's manifest does not
  have: examples.

What it does not cover:

- **Validation.** Storybook carries whatever tags are written, or none. A component without
  `@accessibility` would ship silently; in pulp it fails the build.
- **Structure.** `@do` is one string, not a list of bullets; nothing knows `@status` has three
  allowed values or `@category` nine.
- **The fields pulp computes:** `client`, `flat`, `tokens`, `css`, `requires`, `categories`. They
  come from pulp's build (record 015) and pulp's conventions, which a generic tool cannot know.
- **Where it lives.** It is a file of the docs site, not of the package: an agent in a consumer's
  repository reads pulp's manifest from `node_modules`, at the version it installed, with no
  Storybook running. Storybook's is keyed by the component a story file names, so it also depends
  on the stories being there.
- **A settled format.** The flag was renamed within the 10.x line, and the file is a schema
  discriminated on a version field (`v`: 0 inline, 1 split into references).

## Decision

**pulp keeps `manifest.mjs`, and does not enable `componentsManifest`.** The value of pulp's manifest
is the part Storybook's does not have: the contract validated at build time, the computed fields,
and the file in the package. The mechanical part, props from docgen, is the one they share, and
pulp already gets it from the same parser Storybook uses, so Storybook's copy would add examples and
little else.

## Consequences

- About 120 lines to maintain, owned by pulp.
- The component source is parsed by `react-docgen-typescript` twice: once by `manifest.mjs`, once by
  Storybook's docgen for the props tables. Both read `packages/react/tsconfig.json`, but each has its
  own options, and they already differ in one place: the manifest keeps props that a composed
  `@pearpages/*` package declares, and the Storybook tables drop every prop from `node_modules`
  (`propFilter` in `manifest.mjs` and in `.storybook/main.ts`). A migration would have to pick one.
- pulp's manifest has no examples. An agent learns a component's use from its props, `@do` and
  `@dont`, not from a story.
- An agent connected through `@storybook/addon-mcp` would see Storybook's manifest and none of pulp's
  computed fields. pulp does not install the addon, so that agent does not exist yet; if it is added,
  this record decides what it sees.

## Revisit when

- **Storybook's format settles**: no rename for a minor or two, and one schema version. Then the
  migration path is to split the work along the line this record draws:
  1. Enable `componentsManifest` (and `@storybook/addon-mcp`) so Storybook owns the mechanical layer,
     props, descriptions, imports and examples, on the site.
  2. Shrink `manifest.mjs` to the value fields: the validated tags, `client`, `flat`, `tokens`, `css`,
     `requires`, `categories`. Keep the build failure on a missing tag; that check is pulp's, and it
     has to run where the package is built.
  3. Decide what the shipped file becomes. It can merge Storybook's props in, which makes the package
     build depend on a site build (today no step depends on a prior build, a rule the first deploy
     learnt the hard way). Or it can drop the props and point agents at the site. That choice is the
     cost of migrating, and it is why this is a record, not a task.
- Storybook can produce the manifest without a full site build, or validate custom tags: the cost in
  step 3 goes away.
- Agents are expected to work from the docs site rather than from `node_modules`: then the site is
  the entry point, and Storybook's manifest is the natural carrier.

Siblings: record 014 (token output, and the rule the three share) and record 015 (`"use client"`,
the source of `client`).
