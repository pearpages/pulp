# 003. Sheet waits for a `placement` feature in `@pearpages/modals`

Date: 2026-09-14 (tier 4). Status: accepted; unblocked by modals 0.3.0 once published.

## Context

A sheet is a dialog docked to an edge. pulp's `Dialog` composes `@pearpages/modals` and
maps colours through `--modal-*` variables on an owned portal element. The vendor's
layout rules are unlayered, so docking from pulp's `components` layer cannot win against
them without specificity fights, which principle 4 forbids.

## Decision

The vendor learns to dock: `Modal.Content` gains `placement` (`center | start | end |
top | bottom`) with `--modal-width-sheet` and `--modal-height-sheet` variables. pulp then
ships `Sheet` as `Dialog` with `placement` forwarded and `--sheet-*` tokens mapped onto
those variables. The dependency direction stays clean: the vendor owns layout, pulp owns
colour and size.

## Consequences

- `Sheet` is blocked on modals ≥ 0.3.0 being on npm.
- Longer term, modals shipping its stylesheet in a named layer would make every pulp
  override win by design; that is a major for modals and a separate decision.
