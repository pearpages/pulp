/**
 * Validates the raw token JSON against the part of W3C DTCG this package relies on.
 *
 * Style Dictionary walks the tree for the build and inherits a group's `$type`
 * on the way, so the rendered output cannot tell a token without a type from
 * one that inherits it. This walks the source instead: the rule is the
 * *effective* type, the token's own or the nearest ancestor group's.
 */

/** The DTCG types in use. A new one is a deliberate edit here, next to a `toCss` case in format.mjs. */
export const TOKEN_TYPES = ['color', 'dimension', 'duration', 'fontFamily', 'fontWeight', 'number', 'shadow', 'cubicBezier'];

const GROUP_KEYS = ['$type', '$description', '$extensions'];
const TOKEN_KEYS = ['$value', ...GROUP_KEYS];

/** Returns one line per problem; an empty array means the tree is valid. */
export function validateTokens(tree, file = 'tokens') {
  const problems = [];

  const walk = (node, path, inherited) => {
    const at = `${file}: ${path.join('.') || '(root)'}`;
    const isToken = Object.hasOwn(node, '$value');
    const type = node.$type ?? inherited;

    // A misspelt `$typ` would otherwise read as "no type here, inherit".
    const allowed = isToken ? TOKEN_KEYS : GROUP_KEYS;
    for (const key of Object.keys(node)) {
      if (key.startsWith('$') && !allowed.includes(key)) problems.push(`${at} has an unknown key ${key}`);
    }
    if (node.$type !== undefined && !TOKEN_TYPES.includes(node.$type)) problems.push(`${at} has an unknown $type "${node.$type}"`);

    if (isToken) {
      if (type === undefined) problems.push(`${at} has no $type, its own or a group's`);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      if (child === null || typeof child !== 'object' || Array.isArray(child)) problems.push(`${at}.${key} is neither a group nor a token`);
      else walk(child, [...path, key], type);
    }
  };

  walk(tree, [], undefined);
  return problems;
}
