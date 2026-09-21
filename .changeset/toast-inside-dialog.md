---
'@pearpages/pulp-react': patch
---

A toast fired while a dialog is open is now pressable and announced. A dialog makes every sibling of its portal `inert` and `aria-hidden`, and the toast region is one, so "Removed · Undo" from inside a dialog could not be pressed or heard until the dialog closed. The region now carries `data-modal-keep-active`, which `@pearpages/modals` 0.4.0 leaves alone; the dependency is `^0.4.0`, which also drops the `@charset` rule that landed inside the `vendor` layer, and follows the software keyboard on iOS while a dialog is open.
