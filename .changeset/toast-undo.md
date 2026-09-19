---
'@pearpages/pulp-react': minor
---

Toast: `toast.undo(message, onUndo, options?)`, the shorthand for a reversible action. It shows the message with an Undo button (`label` for other languages), runs `onUndo` and dismisses when pressed, and lasts 8 s by default, longer than an ordinary toast. `toast(options)` is unchanged, and its existing `action: { label, onClick }` is what `undo` builds on.
