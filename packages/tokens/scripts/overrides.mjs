/**
 * Keeps a brand's component-token overrides (tokens/component/<brand>/) rare, and each one
 * explained. Decision record 007: an override is an escape hatch for a shape that is
 * intrinsically per component (bitepals' pill buttons); a brand that needs many of them is
 * telling you the semantic tier is missing a name.
 *
 * The count is in tokens, not files: one `button.json` can hold ten overrides. The cap is 3:
 * room for a couple more exceptions like the pill, and the fourth is the point where overrides
 * have become a pattern and the fix belongs in the semantic tier. Raising it is a deliberate
 * edit here, with the reason in the commit.
 */

export const MAX_OVERRIDES_PER_BRAND = 3;

/**
 * `brands` maps a brand to its override files, `{ [file]: parsedJson }`. Returns one line per
 * problem; an empty array means every brand is within the cap and every override says why.
 */
export function checkOverrides(brands) {
  const problems = [];
  for (const [brand, files] of Object.entries(brands)) {
    let count = 0;
    for (const [file, tree] of Object.entries(files)) {
      const walk = (node, path) => {
        if (Object.hasOwn(node, '$value')) {
          count += 1;
          // Its own: a group's or the file's description explains the file, not this override.
          if (typeof node.$description !== 'string' || node.$description.trim() === '') {
            problems.push(`${brand}/${file}: ${path.join('.')} overrides a component token without its own $description saying why (record 007)`);
          }
          return;
        }
        for (const [key, child] of Object.entries(node)) {
          if (!key.startsWith('$') && child !== null && typeof child === 'object') walk(child, [...path, key]);
        }
      };
      walk(tree, []);
    }
    if (count > MAX_OVERRIDES_PER_BRAND) {
      problems.push(
        `${brand} overrides ${count} component tokens, over the cap of ${MAX_OVERRIDES_PER_BRAND}. A repeated override means the semantic tier is missing a name: add a semantic token every brand maps, and point the component token at it (record 007).`,
      );
    }
  }
  return problems;
}
