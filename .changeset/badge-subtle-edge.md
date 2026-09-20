---
'@pearpages/pulp-react': minor
'@pearpages/pulp-tokens': minor
---

A subtle Badge now draws a hairline edge in the tone's own colour, the same one as its label. On a tinted surface the subtle fill alone was not a pill: measured across both brands, every `*-subtle` fill sits between 1.00 and 1.40:1 against the surfaces it lands on, so "Pending" read as coloured text with no shape. The edge is the label's colour, which the contrast tests already hold to 4.5:1 on every surface, and a token test keeps the two from drifting apart.

Every badge now carries a border, transparent unless the variant is `subtle`, so solid, subtle and dot stay the same size as each other; `box-sizing: border-box` keeps the dot at exactly `--badge-dot-size`. A badge with text is 2px wider and taller than before. New tokens: `--badge-border-width` and `--badge-<tone>-subtle-border`.
