# 003. Sheet waits for a `placement` feature in `@pearpages/modals`

Date: 2026-09-14 (tier 4). Status: done. `@pearpages/modals` 0.3.0 shipped `placement` on
2026-09-17 and `Sheet` followed the same day: Dialog with `placement` (`start | end | top | bottom`,
no `center`) and `--sheet-width`, `--sheet-height` and `--sheet-motion-translate` mapped onto the
vendor's sheet variables on the dialog element itself.

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
- Drag to dismiss (2026-09-18) is pulp's, not the vendor's, and costs no dependency: a bottom
  sheet gets a grab handle (pointer events, pointer capture) and moves with the independent
  `translate` property, because the vendor animates with `transform` and the two must not
  fight. Release closes it through the vendor's own `useModalStack().close(id)`, so
  `onOpenChange`, the exit transition and the focus return are the ones every other dismissal
  gets. The thresholds (a quarter of the height, or 500 px/s) and their test cases are
  bitepals', which tuned them on devices with a `motion` dependency that was not carried over.
  The handle is a shortcut, hidden from assistive technology and gone under
  `prefers-reduced-motion`; if the vendor ever learns to drag, this moves there.
