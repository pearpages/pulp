---
'@pearpages/pulp-react': minor
---

Textarea takes `hideLabel`, as TextField does: the label stays for assistive technology and leaves the page. Both now go through `Field.Label`'s new `visuallyHidden` prop, so a control you build on Field gets it too.
