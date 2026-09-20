---
'@pearpages/pulp-react': patch
---

SegmentedControl: when the segments do not fit their container, the labels shorten with an ellipsis instead of drawing over the next segment, and an icon keeps its size (it used to be squeezed to nothing). The full label is still the radio's accessible name. Applies to `SegmentedControl.NavItem` too, except with `asChild`, where the child is yours.
