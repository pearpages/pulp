---
'@pearpages/pulp-tokens': minor
---

Two new outputs, both views of the semantic tier (decision record 005). `@pearpages/pulp-tokens/theme.css` is a Tailwind v4 `@theme inline reference` block, so utilities such as `bg-surface-base` and `rounded-control` read pulp's variables and follow brand and scheme at run time. `@pearpages/pulp-tokens/native` exports, per brand, `{ colors, radius, space, themeVars: { light, dark } }` with resolved hex and px values, as ESM and CommonJS, for React Native / NativeWind and a Tailwind v3 config.
