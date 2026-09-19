---
'@pearpages/pulp-tokens': minor
'@pearpages/pulp-react': minor
---

New semantic token `--color-surface-overlay` in both brands: the surface of what floats above the page. In dark schemes it is one step lighter than `--color-surface-raised`, so a menu or a dialog reads as above a card without relying on a shadow; in light it may equal it. Dialog, Sheet, Menu, Popover and the DatePicker, Combobox and Picker popovers now paint with it (`--combobox-popover-bg` and `--picker-popover-bg` are new). Light schemes look the same as before in pulp.
