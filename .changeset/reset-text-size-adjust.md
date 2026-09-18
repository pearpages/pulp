---
'@pearpages/pulp-css': patch
---

The reset now declares `-webkit-text-size-adjust` and `-moz-text-size-adjust` next to `text-size-adjust: none`. iOS Safari and Firefox for Android only know the prefixed property, so text was still inflated in landscape there. Found by the new support-floor check.
