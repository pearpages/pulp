---
name: add-component
description: Add a new component to the pulp design system the way the system expects it - scaffold the five files and the token file, wire the entry point, then fill tokens, tests, and stories. Use when asked to add, create, or scaffold a component in this repo.
---

# Add a component to pulp

Every component is five files plus a token file, registered as its own entry
point. Do not hand-create them: the scaffold script produces the pattern, and
CI checks what the pattern promises.

## Steps

1. **Scaffold.** From the repo root:
   ```
   pnpm --filter @pearpages/pulp-react scaffold <PascalName> <Category>
   ```
   The category is one of Typography, Layout, Actions, Forms, Navigation, Overlays, Feedback,
   Data, Utilities (`packages/react/scripts/categories.mjs`): the kind a consumer reaches for.
   Creates `packages/react/src/<camelName>/{Name.tsx, Name.module.css, Name.test.tsx,
   Name.stories.tsx, index.ts}`, `packages/tokens/tokens/component/<kebab-name>.json`,
   and registers the entry in `src/index.ts`, `tsup.config.ts`, and `package.json` exports.

2. **Tokens first.** Fill `tokens/component/<kebab-name>.json` with references into the
   **semantic** layer only (`{color.action.primary}`, `{space.3}`, `{radius.control}`,
   `{font.size.sm}`). Never reference a primitive. Then:
   ```
   pnpm build:tokens
   ```
   and keep the regenerated `packages/tokens/dist/*` in the commit.

3. **Component.** In `Name.tsx`: props as a union-typed interface, `ref` as a prop,
   state as `data-*` attributes, `asChild` only if composition makes sense. In
   `Name.module.css`: every colour/radius/font/shadow is `var(--<kebab-name>-…)` or a
   semantic token. No `style` prop, no literal values (lint fails either).
   Fill the JSDoc the scaffold left: prose, then `@status experimental`, the `@category`,
   an `@accessibility` paragraph (roles, keyboard, what is announced) and `@do` / `@dont`
   bullets, one per line. The story title the scaffold wrote (`Components/<Category>/<Name>`)
   must match the tag; the dist smoke test checks. `pnpm build` fails without status and accessibility; that
   block is the Docs page and the Status page, and agents read it from the manifest.

4. **Tests.** Behaviour with Testing Library and an `axe` check for every state. Run:
   ```
   pnpm test
   ```

5. **Stories.** One per variant, a `play` function for anything interactive, the four
   brand × scheme matrix stories. No `parameters.docs.description` (the JSDoc is the
   description). Stories run as browser tests with a11y checks:
   ```
   pnpm test:storybook
   ```

6. **Finish.** `pnpm lint && pnpm typecheck && pnpm build && pnpm test:dist && pnpm check:package && pnpm check:size`
   (the bundle budget: a leaf entry is allowed 2.1 kB brotli; add an override in
   `packages/react/.size-limit.js` only with a reason), then `pnpm changeset` (minor for a
   new component). Update the Status section of `CLAUDE.md`.

## Reference

`packages/react/src/button/` is the canonical example of all five files, and
`packages/react/dist/component-manifest.json` (after a build) lists what already exists
so you compose from it instead of duplicating.
