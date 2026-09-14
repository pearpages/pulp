/**
 * Custom Style Dictionary formats for pulp.
 *
 * Why custom: the built-in css/variables format resolves every reference to a
 * literal. pulp keeps references as `var(--…)` so a brand block only needs to
 * restate what it changes, and adds two DTCG $extensions:
 *
 *   com.pearpages.pulp.dark      a dark counterpart, emitted as light-dark(a, b)
 *   com.pearpages.pulp.multiply  a multiple of the referenced token, emitted as calc()
 *
 * Both are ordinary $extensions data, so any DTCG-aware tool still reads the files.
 */

import { resolveReferences } from 'style-dictionary/utils';

export const EXT = 'com.pearpages.pulp';

const REFERENCE = /^\{([^}]+)\}$/;

export function cssName(path) {
  return `--${path.join('-')}`;
}

/** Turn a raw DTCG value (reference, primitive, or composite) into a CSS value. */
export function toCss(raw) {
  if (typeof raw === 'string') {
    const ref = raw.match(REFERENCE);
    return ref ? `var(${cssName(ref[1].split('.'))})` : raw;
  }
  if (typeof raw === 'number') return String(raw);
  if (Array.isArray(raw)) {
    // fontFamily → comma list; cubicBezier → cubic-bezier()
    if (raw.every((entry) => typeof entry === 'number') && raw.length === 4) {
      return `cubic-bezier(${raw.join(', ')})`;
    }
    return raw.map((family) => (/\s/.test(family) ? `'${family}'` : family)).join(', ');
  }
  if (raw && typeof raw === 'object') {
    if ('unit' in raw && 'value' in raw) return `${raw.value}${raw.unit}`;
    if ('offsetX' in raw) {
      return [raw.offsetX, raw.offsetY, raw.blur, raw.spread, raw.color].map(toCss).join(' ');
    }
  }
  throw new Error(`pulp tokens: cannot render value ${JSON.stringify(raw)}`);
}

/** Resolve a raw value to its final literal (no var()), for the JSON manifest. */
function toLiteral(raw, tokens) {
  const resolved = typeof raw === 'string' ? resolveReferences(raw, tokens, { usesDtcg: true }) : raw;
  if (resolved && typeof resolved === 'object' && !Array.isArray(resolved) && 'offsetX' in resolved) {
    return [resolved.offsetX, resolved.offsetY, resolved.blur, resolved.spread, resolved.color]
      .map((part) => toLiteral(part, tokens))
      .join(' ');
  }
  return toCss(resolved);
}

function isShadow(raw) {
  return Boolean(raw) && typeof raw === 'object' && 'offsetX' in raw;
}

/**
 * The CSS declarations for one token. Usually one line; a shadow with a dark
 * counterpart becomes two, because light-dark() only takes colours: the
 * geometry stays fixed and only `<name>-color` switches.
 */
function declarations(token) {
  const name = cssName(token.path);
  const ext = token.original.$extensions?.[EXT] ?? {};
  const raw = token.original.$value;

  if (isShadow(raw) && ext.dark !== undefined) {
    const color = `light-dark(${toCss(raw.color)}, ${toCss(ext.dark.color)})`;
    const geometry = [raw.offsetX, raw.offsetY, raw.blur, raw.spread].map(toCss).join(' ');
    return [`  ${name}-color: ${color};`, `  ${name}: ${geometry} var(${name}-color);`];
  }

  let value = toCss(raw);
  if (ext.multiply !== undefined) value = `calc(${value} * ${ext.multiply})`;
  if (ext.dark !== undefined) value = `light-dark(${value}, ${toCss(ext.dark)})`;
  return [`  ${name}: ${value};`];
}

/** One CSS block per brand: `selector { --token: value; … }` */
export const cssBrand = {
  name: 'pulp/css',
  format: ({ dictionary, options }) => {
    const lines = dictionary.allTokens.flatMap(declarations);
    return `${options.selector} {\n${lines.join('\n')}\n}\n`;
  },
};

/** Flat, resolved manifest for docs and agents. */
export const jsonBrand = {
  name: 'pulp/json',
  format: ({ dictionary }) =>
    JSON.stringify(
      dictionary.allTokens.map((token) => {
        const ext = token.original.$extensions?.[EXT] ?? {};
        const entry = {
          name: cssName(token.path),
          path: token.path,
          type: token.$type,
          tier: token.filePath.includes('/primitives/') ? 'primitive' : token.filePath.includes('/semantic/') ? 'semantic' : 'component',
          css: declarations(token).at(-1).trim().replace(/^--[^:]+:\s*/, '').replace(/;$/, ''),
          value: toLiteral(token.original.$value, dictionary.tokens),
        };
        if (ext.multiply !== undefined) entry.value = `calc(${entry.value} * ${ext.multiply})`;
        if (ext.dark !== undefined) {
          entry.light = entry.value;
          entry.dark = toLiteral(ext.dark, dictionary.tokens);
          delete entry.value;
        }
        if (token.$description) entry.description = token.$description;
        return entry;
      }),
      null,
      2,
    ),
};
