/**
 * What each semantic token is for, and which component slots may read it. Decision record 013.
 *
 * The lint and the tier tests prove a component reads *a* semantic token. They cannot tell a
 * button background that reads a text colour from one that reads an action fill: both are valid
 * references with no literal and no drift. This file turns the part of that judgement that is
 * mechanical into a rule, the way the contrast test turns "readable" into a ratio.
 *
 * - A semantic colour belongs to one **family** by its name: surface, tint, fill, scrim, ink,
 *   on-ink, line. A new semantic colour that fits none fails the tests until it is placed here.
 * - A component colour token has a **slot** named in its own name (`-bg`, `-fg`, `-border`,
 *   `-focus-ring`…): the last slot word wins, so `item-bg-hover` is a bg. A name that carries no
 *   slot word, or one that misleads, is listed in SLOT_OF.
 * - Each slot accepts some families. A mismatch is a failure unless EXCEPTIONS lists the token
 *   with the reason the off-family reference is deliberate.
 *
 * Roles are prose, not rules: every semantic token in the base brand's file states what it exists
 * for in `$description` (a step of a scale may leave it to its group). `render()` copies the role
 * to every brand in tokens.json, so a reviewer, the Tokens page and an agent read one sentence of
 * intent next to each name.
 */

/** A semantic colour's family, from its CSS name. `undefined` means unplaced. */
export function familyOf(name) {
  const n = name.replace(/^--color-/, '');
  if (n.startsWith('border-')) return 'line';
  if (n.startsWith('surface-')) return 'surface';
  if (n === 'overlay-backdrop') return 'scrim';
  if (/^(text-on-|status-on-|accent-on-)/.test(n)) return 'on-ink';
  if (n.startsWith('text-') || n === 'action-text' || /^status-[a-z]+-text$/.test(n)) return 'ink';
  if (n.endsWith('-subtle') || n === 'action-primary-quiet') return 'tint';
  if (/^(action-(primary|secondary)|status-[a-z]+|accent-\d+|data-sequential-\d+)(-hover|-active)?$/.test(n)) return 'fill';
  return undefined;
}

/**
 * The families each slot accepts, and why.
 * - bg: anything painted as an area. Never ink or a line: a background in a text colour is the
 *   classic valid-but-wrong choice, and it moves when the text colour is retuned for contrast.
 * - fg: text and icons. Ink sits on a surface, on-ink on a fill; never a fill, a surface or a line.
 * - border: a line, or a tone's ink or solid fill (an invalid field, a selected chip). Never a
 *   surface or a tint: those are built to sit at the surface's level, so a stroke in them vanishes.
 * - mark: a shape drawn on a fill or a surface (a thumb, a dot, a check, an indicator). Surface,
 *   fill, ink or on-ink; never a line, a tint or a scrim.
 * - focus-ring: exactly one colour, --color-border-focus, so focus looks the same everywhere.
 */
export const SLOTS = {
  bg: ['surface', 'tint', 'fill', 'scrim'],
  fg: ['ink', 'on-ink'],
  border: ['line', 'ink', 'fill'],
  mark: ['surface', 'fill', 'ink', 'on-ink'],
  'focus-ring': ['--color-border-focus'],
};

/** Slot words in component token names. The last one in the name decides. */
const SLOT_WORDS = {
  bg: 'bg', surface: 'bg', base: 'bg', highlight: 'bg', backdrop: 'bg', level: 'bg', accent: 'bg', track: 'bg', fill: 'bg',
  indicator: 'mark', thumb: 'mark', dot: 'mark', check: 'mark',
  fg: 'fg', text: 'fg', title: 'fg', icon: 'fg', chevron: 'fg', tone: 'fg', placeholder: 'fg', muted: 'fg', faint: 'fg',
  border: 'border', divider: 'border', separator: 'border',
  ring: 'focus-ring',
};

/** Names whose words do not say their slot, or say the wrong one. A classification, not an exception. */
export const SLOT_OF = {
  '--dialog-focus': 'focus-ring',
  '--divider-color': 'border',
  '--link-hover': 'fg',
  // The spinner's ring is a border with one coloured side: its "track" is a stroke, not an area.
  '--spinner-track': 'border',
};

/** Deliberate off-family references, each with its reason. A stale entry fails the tests too. */
export const EXCEPTIONS = {
  '--chip-action-border':
    'The border matches --chip-action-bg on purpose: the edge disappears while the box keeps the size of the neutral chip, whose border is visible.',
  '--sheet-handle-bg':
    'The grab handle is a small bar that has to be seen on the sheet surface; the strongest line colour is the one made to be seen against a surface.',
  '--switch-track-bg':
    'The unchecked track is the control\'s only visible shape, so it takes the strong line colour rather than a surface that would vanish into the page. The semantic tier has no name for an unchecked control fill yet (tasks.md).',
  '--switch-track-bg-hover':
    'One step past --color-border-strong, and the tier has no line colour darker than that, so it borrows the faint text colour. The same missing name as --switch-track-bg (tasks.md).',
};

/** The slot of a component colour token, or `undefined` when its name does not say. */
export function slotOf(name, path) {
  if (Object.hasOwn(SLOT_OF, name)) return SLOT_OF[name];
  const words = path.slice(1).flatMap((segment) => segment.split('-'));
  for (let i = words.length - 1; i >= 0; i -= 1) if (Object.hasOwn(SLOT_WORDS, words[i])) return SLOT_WORDS[words[i]];
  return undefined;
}

/**
 * Checks every component colour token in a manifest (`{ [brand]: entries[] }`, tokens.json's shape).
 * Returns one line per problem; an empty array means every reference fits its slot.
 */
export function checkFamilies(manifest, exceptions = EXCEPTIONS) {
  const problems = [];
  const used = new Set();
  for (const [brand, tokens] of Object.entries(manifest)) {
    const roles = new Map(tokens.filter((t) => t.tier === 'semantic').map((t) => [t.name, t.role]));
    for (const token of tokens.filter((t) => t.tier === 'semantic' && t.type === 'color')) {
      if (familyOf(token.name) === undefined) problems.push(`${brand}: ${token.name} belongs to no family; place it in familyOf (scripts/roles.mjs, record 013)`);
    }
    for (const token of tokens.filter((t) => t.tier === 'component' && t.type === 'color')) {
      const slot = slotOf(token.name, token.path);
      if (slot === undefined) {
        problems.push(`${brand}: ${token.name} names no slot (bg, fg, border, focus-ring…); name it, or add it to SLOT_OF (scripts/roles.mjs, record 013)`);
        continue;
      }
      for (const ref of [...token.css.matchAll(/var\((--color-[a-z0-9-]+)\)/g)].map((m) => m[1])) {
        const family = familyOf(ref);
        if (SLOTS[slot].includes(family) || SLOTS[slot].includes(ref)) continue;
        if (Object.hasOwn(exceptions, token.name)) {
          used.add(token.name);
          continue;
        }
        const role = roles.get(ref);
        problems.push(
          `${brand}: ${token.name} is a ${slot} slot and reads ${ref} (${family ?? 'no family'}${role ? `: "${role}"` : ''}); a ${slot} expects ${SLOTS[slot].join(', ')}. Pick the semantic token whose role fits, or list the exception with its reason (scripts/roles.mjs, record 013).`,
        );
      }
    }
  }
  for (const name of Object.keys(exceptions)) {
    if (!used.has(name)) problems.push(`${name} is listed in EXCEPTIONS but fits its slot or no longer exists; remove the entry`);
  }
  return problems;
}

/** A step of a scale (`space.3`, `font.size.lg`, `accent.on-4`) may leave its role to its group. */
const SCALE_STEP = /^((on-)?\d+|xs|sm|md|lg|xl|\dxl)$/;

/**
 * The role of every semantic token, from the base brand's semantic file: its own `$description`,
 * or, for a step of a scale, the nearest group's. Returns `{ roles: Map<cssName, role>, missing }`.
 */
export function semanticRoles(tree, cssName) {
  const roles = new Map();
  const missing = [];
  const walk = (node, path, groupRole) => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$') || child === null || typeof child !== 'object') continue;
      const at = [...path, key];
      if (Object.hasOwn(child, '$value')) {
        const own = child.$description?.trim();
        const role = own || (SCALE_STEP.test(key) ? groupRole : undefined);
        if (role) roles.set(cssName(at), role);
        else missing.push(at.join('.'));
      } else {
        walk(child, at, child.$description?.trim() || groupRole);
      }
    }
  };
  // The file's own $description describes the file, not a role, so it is not inherited.
  walk(tree, [], undefined);
  return { roles, missing };
}
