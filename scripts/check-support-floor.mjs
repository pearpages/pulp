/**
 * Enforces the support floor: the `browserslist` in the root package.json.
 *
 * The shipped stylesheets are not lowered (PRINCIPLES §4), and nothing in the
 * builds reads browserslist: esbuild's CSS loader has no target, the css
 * package ships its source, tokens.css is generated text. So each shipped file
 * is run through lightningcss twice, with the floor as targets and with none.
 * A difference means lightningcss had to lower or prefix something, i.e. the
 * file uses syntax the declared floor does not run.
 *
 * Limit: lightningcss flags what it knows how to lower (nesting, light-dark(),
 * colour functions, media ranges, prefixes). An unknown property passes through
 * untouched, so `field-sizing` (Textarea) and `@property` (floating.css) are not
 * seen; both are progressive enhancements, documented where they are used.
 *
 * Run after `pnpm build`: it reads packages/react/dist.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import browserslist from 'browserslist';
import { browserslistToTargets, transform } from 'lightningcss';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const queries = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')).browserslist;
const floor = browserslistToTargets(browserslist(queries));

const cssIn = (dir) => readdirSync(resolve(ROOT, dir)).filter((file) => file.endsWith('.css')).map((file) => resolve(ROOT, dir, file));

/** The lines lightningcss writes differently for `targets` than for no targets at all. */
function lowered(filename, source, targets) {
  const run = (options) => {
    const { code, warnings } = transform({ filename, code: Buffer.from(source), errorRecovery: false, ...options });
    if (warnings.length) throw new Error(warnings.map((w) => w.message).join('; '));
    return code.toString().split('\n');
  };
  const plain = new Set(run({}));
  return run({ targets }).filter((line) => !plain.has(line));
}

// The check must be able to fail: a lightningcss that stopped lowering would pass everything.
const probe = '.a { color: light-dark(#fff, #000); .b & { inset-inline: 0 } }';
if (lowered('probe.css', probe, browserslistToTargets(browserslist('Chrome 100'))).length === 0) {
  console.error('check-support-floor: lightningcss lowered nothing for Chrome 100, so this check proves nothing.');
  process.exit(1);
}

if (!existsSync(resolve(ROOT, 'packages/react/dist/index.css'))) {
  console.error('check-support-floor: packages/react/dist is missing. Run `pnpm build` first.');
  process.exit(1);
}

const files = [...cssIn('packages/react/dist'), ...cssIn('packages/css/src'), resolve(ROOT, 'packages/tokens/dist/tokens.css')];
const problems = [];
for (const file of files) {
  const name = relative(ROOT, file);
  try {
    const lines = lowered(name, readFileSync(file, 'utf8'), floor);
    if (lines.length) problems.push(`${name}: ${lines.length} line(s) need lowering, first:\n${lines.slice(0, 5).map((line) => `      ${line.trim()}`).join('\n')}`);
  } catch (error) {
    problems.push(`${name}: ${error.message}`);
  }
}

if (problems.length) {
  console.error(`check-support-floor: below the floor (${queries.join(', ')})\n${problems.map((line) => `  ${line}`).join('\n')}`);
  process.exit(1);
}
console.log(`check-support-floor: ${files.length} stylesheets run unlowered on ${queries.join(', ')}.`);
