# 007. A brand may override a single component token

Date: 2026-09-20 (group 11). Status: accepted.

## Context

The component tier is declared once, on `:root`, and every value in it is a `var()` reference into
the semantic layer. That is what makes a brand a token swap: `--button-primary-bg` points at
`--color-action-primary`, a brand remaps that name, and Button never learns a brand exists. The
build enforced it by giving only pulp the `tokens/component/*.json` glob; a brand block restated
nothing, and a test asserted the bitepals block contained no `--button-`.

bitepals hit the case the model has no room for. **Its buttons are pills.** That is not a value the
semantic layer can carry, because the semantic layer has no opinion about a button: `--radius-control`
is "the radius of a control" and bitepals wants it for inputs and selects but not for buttons.
Nothing in the semantic tier distinguishes them, so bitepals set `--button-radius: var(--radius-full)`
itself, unlayered, in its own stylesheet — reaching into pulp's component tier from outside, which
works only because unlayered rules beat every layer, and which no test on either side protects.

A pill is brand. bitepals' shape is as much bitepals as its orange is, and a second consumer of the
same brand — the Expo app — would have to repeat the override by hand.

## Decision

**A brand may restate a component token, in `tokens/component/<brand>/<component>.json`.** The base
tier stays exactly as it was: declared once, on `:root`, from `tokens/component/*.json` (a single
`*`, so the brand directories stay out of it). A brand's file is sourced after its own primitives and
semantics, so it resolves against that brand's semantic layer, and it is emitted inside that brand's
block.

The cascade does the rest, and it already worked: `render()` emits brands in `BRANDS` order with pulp
first, and on `<html data-brand="bitepals">` pulp's matching `:root` and bitepals' `[data-brand=…]`
are both specificity (0,1,0), so the later block wins. Nesting still resolves correctly, because
`[data-brand="pulp"]` restates the whole component tier and so re-establishes it inside a bitepals
page.

bitepals gets `button.radius` → `{radius.full}`.

Two rules hold the door shut, both tested:

1. **An override must reference the semantic layer**, like any component token. The
   component→semantic test now runs over every brand, not only pulp; otherwise a brand file would be
   the one place a literal colour could reach a component.
2. **An override must name a token that already exists.** A brand may change a component's value, not
   give a component a knob the component does not read.

## Consequences

- The escape hatch is real and it is small. A brand that overrides a lot of component tokens is
  telling you the semantic tier is missing a name; that, not this file, is the fix.
- `--button-radius` is read by Button and IconButton, so bitepals' pill reaches both, which is what
  its own override already did.
- A consumer no longer has to keep an unlayered stylesheet to be itself. bitepals drops that override
  when it takes this release, and the Expo app gets the pill for free through `native`.
- **Revisit when** a brand wants to override a component token that does not exist in the base,
  which means the component should have had the token all along.
