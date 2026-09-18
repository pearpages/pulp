# pulp principles

The source of truth for how pulp is designed. `CLAUDE.md` lists the subset that lint and CI
enforce; the Storybook introduction renders this file. When these disagree, this file wins.

## 1. Tokens are the product

Colour, type, radius, spacing, motion and elevation live as W3C Design Tokens (DTCG) JSON.
CSS custom properties, the JSON manifest, and any future output (Tailwind preset, iOS,
Android, Figma) are generated from them. Components are one renderer of the tokens. When
the next framework arrives, the token and CSS packages do not change.

What is portable and what is not, stated plainly: the files are valid DTCG and any
DTCG-aware tool reads the names, types and light values. Two things are pulp-specific and
live under `$extensions["com.pearpages.pulp"]`: the dark counterpart of a colour, and the
multiplier that builds the spacing scale. A tool that ignores extensions sees a light-only
system. Colours are hex strings, not the 2025 colour objects; the build script is the one
place to change when that matters.

## 2. Two axes, never mixed

A **brand** (`data-brand`) decides palette, radius scale, type families and density. A
**scheme** (`data-scheme`, or the OS) decides light or dark. Every semantic colour is a
`light-dark()` pair, so any brand works in any scheme without a second stylesheet, and
brands nest: a bitepals widget can sit inside a pulp page.

## 3. Three tiers, and components only read the top two

Primitives (`--color-ultramarine-500`) carry no meaning. Semantic tokens
(`--color-action-primary`) name a role and point at a primitive. Component tokens
(`--button-primary-bg`) point at semantic ones. A component never references a primitive.
That is what makes a brand one JSON file and zero component changes.

## 4. Native CSS, no runtime, no preprocessor

CSS modules, nesting, logical properties, cascade layers, `light-dark()`. No Sass, no
CSS-in-JS, no utility classes leaking into consumers. A library must not impose a build
tool on the app that uses it.

The price of native CSS is a support floor. The shipped stylesheets rely on native nesting
and `light-dark()` and are not lowered: Chrome and Edge 123, Firefox 120, Safari 17.5 and
later (the `browserslist` in the root `package.json`, which `pnpm check:floor` holds every shipped
stylesheet to). Component rules sit in the
`components` cascade layer, so an app overrides them from any later layer or from unlayered
CSS, never by fighting specificity.

## 5. State lives on the DOM

Variants and states are `data-*` attributes (`data-variant`, `data-size`, `data-loading`)
styled with attribute selectors. Styling hooks survive a change of styling tool, tests
read state without knowing class names, and agents can inspect the result.

## 6. Small, contract-first APIs

Variants are union types, never conflicting booleans. Controlled and uncontrolled pairs.
`ref` is a normal prop. Compound components with `asChild` where composition is the point.
Accessibility is part of the contract, not a follow-up: every component ships an `axe`
check for every state, and complex widgets build on a headless accessibility layer rather
than hand-rolled keyboard handling.

## 7. Stories are the tests

Every story renders in a real browser, runs its interactions, and fails on accessibility
violations. Documentation, demonstration and verification are one file per component.

## 8. Guardrails, not review

Inline styles fail lint. A literal colour outside the tokens package fails lint. Token
output that drifts from its source fails CI. The published package is smoke-tested as a
consumer would install it. The same rules keep humans and coding agents on-system; the
generated component manifest tells an agent exactly what exists so it composes instead of
inventing.

## 9. Versioned like a dependency, because it is one

Semantic versioning per package. Removing or renaming a token, a prop or a `data-*`
attribute is a major. The React package declares the tokens package as a peer dependency:
installing components without their tokens is an error, not a silent unstyled page. Anything removed stays one major with a deprecation note and, where
mechanical, a codemod. Brands never break: a new semantic token is added to every brand
file, and the tests diff the brands.

## 10. Smallest complete slice first

The system is complete when one component runs through every layer: tokens, CSS,
component, tests, stories, packaging, consumer. Breadth comes after, one component kind at
a time, each proving a new design decision rather than repeating an old one.
