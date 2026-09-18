/**
 * Three rules do the work:
 *   - colour is never written literally outside the tokens package;
 *   - the properties a brand owns (colour, radius, font, shadow, spacing) must be var();
 *   - components read the semantic and component tiers only, never a primitive.
 * Everything else is the standard config.
 */

// Primitive-tier variables. Semantic names never end in a numeric step and
// never use these prefixes, so the patterns are exact.
const PRIMITIVES = [
  '/var\\(--color-[a-z]+-\\d+\\)/',
  '/var\\(--typeface-/',
  '/var\\(--radius-(sm|lg|pill)\\)/',
  '/var\\(--space-unit\\)/',
  '/var\\(--duration-/',
  '/var\\(--easing-/',
];

export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-declaration-strict-value'],
  ignoreFiles: ['**/dist/**', '**/node_modules/**', '**/storybook-static/**'],
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'oklch', 'oklab', 'color-mix'],
    'declaration-property-value-disallowed-list': [{ '/.*/': PRIMITIVES }, { message: 'Components read semantic or component tokens only, never a primitive.' }],
    'scale-unlimited/declaration-strict-value': [
      [
        '/color$/',
        'fill',
        'stroke',
        'background',
        'border-radius',
        'font-family',
        'font-size',
        'box-shadow',
        'outline-color',
        '/^(padding|margin|gap|row-gap|column-gap|inset)/',
      ],
      {
        // A percentage is a ratio of the container (centring a thumb at 50%), never a brand value; lengths must be tokens.
        ignoreValues: ['currentcolor', 'transparent', 'inherit', 'none', 'initial', 'unset', '0', 'auto', '/^\\d+(\\.\\d+)?%$/'],
        disableFix: true,
        message: 'Use a token: ${property} must be var(--…), got "${value}".',
      },
    ],
    // CSS modules use camelCase class names on purpose (they become JS keys).
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'import-notation': 'string',
    // Prefixes stay banned except where the support floor still needs one: Safari has no unprefixed
    // user-select, iOS and Firefox for Android no unprefixed text-size-adjust. `pnpm check:floor` is what
    // says so; when it stops asking for a prefix, drop it here too.
    'property-no-vendor-prefix': [true, { ignoreProperties: ['/user-select$/', '/text-size-adjust$/'] }],
  },
  overrides: [
    {
      files: ['packages/tokens/**/*.css'],
      rules: {
        'color-no-hex': null,
        'scale-unlimited/declaration-strict-value': null,
        'declaration-property-value-disallowed-list': null,
      },
    },
    {
      // The reset sets font/colour to inherit and backgrounds to none: allowed above.
      files: ['packages/css/src/reset.css'],
      rules: { 'declaration-no-important': null },
    },
  ],
};
