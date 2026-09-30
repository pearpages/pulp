# pulp principles

The source of truth for how pulp is designed. `CLAUDE.md` lists the subset that lint and CI
enforce; the Storybook introduction renders this file. When these disagree, this file wins.

## 1. Tokens are the product

Colour, type, radius, spacing, motion and elevation live as W3C Design Tokens (DTCG) JSON.
CSS custom properties, the JSON manifest, and any future output (Tailwind preset, iOS,
Android, Figma) are generated from them. Components are one renderer of the tokens. When
the next framework arrives, the token and CSS packages do not change.

How far that holds depends on the layer, and each layer crosses to fewer renderers than the one
below it. **Tokens** are data: they reach every renderer, web or native, unchanged, and each
platform gets an output generated from them. **CSS and the simple components** (markup and a
stylesheet) reach every renderer that has a DOM; a native one rewrites them, cheaply, on the same
tokens. **Complex-widget behaviour and accessibility** reach other DOM renderers only through a
framework-agnostic behaviour layer (record 011), and do not reach native at all: there the
platform owns accessibility. The promise is strongest at the bottom and narrows on the way up.
Record 012 lists the renderers and what each one inherits.

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
and `light-dark()` and are not lowered. The floor is whatever the `browserslist` in the root
`package.json` declares, and `pnpm check:floor` holds every shipped stylesheet to it; the
versions are never restated in the docs. Component rules sit in the
`components` cascade layer (every stylesheet restates the layer order, so it holds whatever
loads first), so an app overrides them from any later layer or from unlayered
CSS, never by fighting specificity.

The behaviour layer has a floor of its own, and it is the DOM. Keyboard models, focus
management and ARIA wiring are written against the DOM and stop there. A native renderer builds
its accessibility fresh, on the platform's own controls and screen readers (VoiceOver,
TalkBack). That is a deliberate, separate cost, paid per native component, not a gap to paper
over with a shim.

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

## 8. Guardrails, so review is spent where no rule reaches

Inline styles fail lint. A literal colour outside the tokens package fails lint. Token
output that drifts from its source fails CI. Text pairs below AA fail the contrast test, and a
component colour token that reads the wrong family of semantic token (a background in a text
colour) fails the family test. The published package is smoke-tested as a consumer would
install it. The same rules keep humans and coding agents on-system; the generated component
manifest tells an agent exactly what exists so it composes instead of inventing.

What guardrails remove is review of the mechanical layer, not review. A green run proves no
rule was broken; it does not prove the design is right. A component can read a valid semantic
token, of an accepted family, with no literal and no drift, and still read the wrong one: a
hover in the pressed colour, a hint in the body text colour. Review spends its attention
there, on whether the chosen token is the one whose role fits. So that question has an
answer to check against, every semantic token states the role it exists for (record 013), and
whatever part of that judgement becomes mechanical is moved into a test.

## 9. Versioned like a dependency, because it is one

Semantic versioning per package. Removing or renaming a token, a prop or a `data-*`
attribute is a major. Before 1.0 the next minor stands in for the major, and its changeset
says it breaks. The React package declares the tokens package as a peer dependency:
installing components without their tokens is an error, not a silent unstyled page. Anything
removed stays one major with a deprecation note and, where mechanical, a codemod. Brands never
break: a new semantic token is added to every brand file, and the tests diff the brands.

## 10. Smallest complete slice first

The system is complete when one component runs through every layer: tokens, CSS,
component, tests, stories, packaging, consumer. Breadth comes after, one component kind at
a time, each proving a new design decision rather than repeating an old one.

## 11. One explicit source, read by humans and agents alike

Every fact about the system has one source, and it is stated, not implied. The manifest says
what exists, JSDoc says how to use it, `data-*` attributes say what state a component is in,
and flat names (`MenuTrigger` beside `Menu.Trigger`) say what each part is called. Where a copy
has to exist (the layer order in every stylesheet, the component lists in the READMEs), it is
generated from the source or tested against it. Anything a human could infer but an agent
would have to guess is a gap in the system, not in the reader.

This is the rule behind several of the others, named once instead of left as a side benefit.
State lives on the DOM (principle 5) so it can be read rather than deduced from class names.
Guardrails and the generated manifest (principle 8) turn conventions into checks and a list
anyone can query. Compound parts are exported flat so each part has one name that works
everywhere, including where `Menu.Trigger` cannot reach.
