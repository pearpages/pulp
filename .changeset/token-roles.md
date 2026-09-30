---
'@pearpages/pulp-tokens': minor
---

Every semantic token in `tokens.json` now carries a `role`: one sentence on what it exists for, the same in every brand. Before, 86 of the 114 semantic tokens had no description.

The shape changed. On pulp's semantic entries, the old `description` is now `role`. A bitepals entry keeps `description` only where it explains bitepals' own value ("Ink, not white: white on the brand orange is 2.8:1"). If you read `description` for a semantic token's meaning, read `role`. CSS, `theme.css` and `native` are unchanged.
