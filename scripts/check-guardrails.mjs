/**
 * Proves the guardrails bite. Drops deliberately wrong files into the React
 * package, runs ESLint and Stylelint on them, and fails unless every expected
 * rule fires. Runs in CI after lint, so a config change that silently relaxes
 * a rule is caught the same day.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROBE = resolve(ROOT, 'packages/react/src/__guardrail_probe__');

const probes = {
  'Probe.tsx': `export function Probe() {\n  return <div style={{ color: 'red' }}>x</div>;\n}\n`,
  'Probe.module.css': [
    '.probe {',
    '  color: #ff0000;',
    '  border-radius: 4px;',
    '  padding: 12px;',
    '  background: var(--color-ultramarine-500);',
    '  font-family: var(--typeface-body);',
    '  gap: var(--space-unit);',
    '}',
    '',
  ].join('\n'),
};

const expected = {
  eslint: ['react/forbid-dom-props'],
  stylelint: [
    'color-no-hex',
    'scale-unlimited/declaration-strict-value', // border-radius, padding
    'declaration-property-value-disallowed-list', // primitives
  ],
};

function run(bin, args) {
  try {
    return execFileSync('pnpm', ['exec', bin, ...args], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    // Non-zero exit is the point; the report is on stdout.
    return `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
}

mkdirSync(PROBE, { recursive: true });
try {
  for (const [name, content] of Object.entries(probes)) writeFileSync(resolve(PROBE, name), content);

  const eslintOut = run('eslint', ['--no-color', resolve(PROBE, 'Probe.tsx')]);
  const stylelintOut = run('stylelint', ['--formatter', 'compact', resolve(PROBE, 'Probe.module.css')]);

  const missing = [
    ...expected.eslint.filter((rule) => !eslintOut.includes(rule)).map((rule) => `eslint:${rule}`),
    ...expected.stylelint.filter((rule) => !stylelintOut.includes(rule)).map((rule) => `stylelint:${rule}`),
  ];
  const primitiveHits = (stylelintOut.match(/declaration-property-value-disallowed-list/g) ?? []).length;
  if (primitiveHits < 3) missing.push(`stylelint: expected 3 primitive-token hits, got ${primitiveHits}`);

  if (missing.length) {
    console.error('Guardrails did NOT fire:\n  ' + missing.join('\n  '));
    console.error('\n--- eslint ---\n' + eslintOut + '\n--- stylelint ---\n' + stylelintOut);
    process.exit(1);
  }
  console.log('Guardrails fire as expected: inline style, hex colour, literal radius and padding, primitive tokens.');
} finally {
  rmSync(PROBE, { recursive: true, force: true });
}
