/**
 * Release notes for a tag, from the packages' own CHANGELOGs:
 *   node scripts/release-notes.mjs v0.5.0 > notes.md
 * A package is in the notes when its version at the tag differs from the previous tag's, and its
 * section is the CHANGELOG's "## <version>" block, as changesets wrote it. publish.yml turns the
 * output into the GitHub Release.
 */
import { execFileSync } from 'node:child_process';

const PACKAGES = ['packages/tokens', 'packages/css', 'packages/icons', 'packages/react'];
const tag = process.argv[2];
if (!tag) {
  console.error('usage: node scripts/release-notes.mjs vX.Y.Z');
  process.exit(1);
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const show = (ref, path) => {
  try {
    return git('show', `${ref}:${path}`);
  } catch {
    return null;
  }
};
let previous = null;
try {
  previous = git('describe', '--tags', '--abbrev=0', `${tag}^`);
} catch {
  // The first tag: every package is new.
}

const sections = [];
for (const dir of PACKAGES) {
  const { name, version } = JSON.parse(show(tag, `${dir}/package.json`));
  const before = previous && show(previous, `${dir}/package.json`);
  if (before && JSON.parse(before).version === version) continue;
  const changelog = show(tag, `${dir}/CHANGELOG.md`) ?? '';
  const start = changelog.indexOf(`\n## ${version}\n`);
  if (start === -1) throw new Error(`${dir}/CHANGELOG.md has no "## ${version}" section at ${tag}`);
  const rest = changelog.slice(start + 1);
  const end = rest.indexOf('\n## ', 1);
  const body = (end === -1 ? rest : rest.slice(0, end)).replace(/^## .*\n/, '').replace(/^### /gm, '#### ').trim();
  sections.push(`## ${name} ${version}\n\n${body}`);
}

if (!sections.length) throw new Error(`No package version changed between ${previous} and ${tag}`);
console.log(
  `${sections.join('\n\n')}\n\nDocs: https://pulp.pearpages.com${previous ? ` · Compare: https://github.com/pearpages/pulp/compare/${previous}...${tag}` : ''}`,
);
