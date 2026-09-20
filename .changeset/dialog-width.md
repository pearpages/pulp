---
'@pearpages/pulp-react': minor
'@pearpages/pulp-tokens': minor
---

Dialog's width is a pulp token now, `--dialog-width`, from the new semantic `--size-dialog-width` (32.5rem, the same 520px the vendor was already using, so nothing moves). Set it in a class on `Dialog.Content` to size one dialog without touching the rest, the way `--sheet-width` already works for Sheet; `@pearpages/modals`' own `--modal-width-md` is set from it and stays pulp's business. Both are now said in the components' docs, with a story.
