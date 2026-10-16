---
'@pearpages/pulp-react': minor
---

An open Dialog or Sheet no longer moves the page behind it. `@pearpages/modals` moves to `^0.5.0`: `Dialog` (and so `Sheet`) used to leave an empty `<div data-modal-id>` where you wrote it while open, which took a slot in a grid, a flex row with a gap or a list and reflowed the layout. It now renders no element of its own, so it can sit anywhere, between grid items included.

Breaking: `DialogProps` and `SheetProps` no longer accept `className`, `style`, `data-*`, `aria-*` or other HTML attributes, since there is no element to put them on. Move them to `Dialog.Content` / `Sheet.Content`, which render the dialog. `data-modal-id` moves to the dialog too, so a `[data-modal-id]` selector or test now matches the `role="dialog"` element.
