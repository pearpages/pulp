---
'@pearpages/pulp-react': minor
'@pearpages/pulp-tokens': minor
---

Sheet: a bottom sheet can be dragged down to close it. `Sheet.Content` renders a grab handle when `placement="bottom"` (`dragToDismiss`, on by default); past a quarter of the sheet's height, or with a flick, it closes through the dialog's own path, so `onOpenChange` fires and focus returns to the trigger. Pointer and touch only, hidden from assistive technology, and off under `prefers-reduced-motion`. Tokens: `--sheet-handle-*`.
