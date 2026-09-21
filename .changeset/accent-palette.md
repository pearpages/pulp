---
'@pearpages/pulp-tokens': minor
'@pearpages/pulp-react': minor
---

Eight categorical accents at the semantic tier, in both brands: `--color-accent-1` … `--color-accent-8`, each with its text colour `--color-accent-on-1` … `on-8`. They follow the scheme (`light-dark()`), every pair is in the contrast tests at 4.5:1, and the hues come in the same order in every brand (blue, orange, green, violet, red, teal, amber, pink). They are for telling things of one kind apart, people mostly; a number carries no meaning. They are in `theme.css` and the native output too.

Avatar and Chip take `accent?: 1 | … | 8`. On an Avatar it is the colour behind the initials (a picture ignores it). A Chip with an accent is filled with it; a toggle chip shows it as the border until it is selected. The consumer hashes an id to the index, so a colour is never passed as a style.
