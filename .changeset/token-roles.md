---
'@pearpages/pulp-tokens': minor
---

Every semantic token in `tokens.json` now carries a `role`: one sentence on what it exists for, the same in every brand. Before, 86 of the 114 semantic tokens had no description of their own. Where a brand's value needs explaining ("Ink, not white: white on the brand orange is 2.8:1"), the entry carries a `note` as well.

Additive: `description` is still there, as the role and the note together. CSS, `theme.css` and `native` are unchanged.
