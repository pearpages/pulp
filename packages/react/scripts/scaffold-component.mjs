/**
 * Scaffolds a component the way the system expects it, so a human or an agent
 * starts from the pattern instead of from a blank file.
 *
 *   pnpm --filter @pearpages/pulp-react scaffold TextField
 *
 * Creates src/<dir>/{Name.tsx, Name.module.css, Name.test.tsx, Name.stories.tsx, index.ts},
 * a component token file, and registers the entry in src/index.ts, tsup.config.ts
 * and package.json exports. It refuses to overwrite anything.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS = resolve(ROOT, '../tokens/tokens/component');

const name = process.argv[2];
if (!name || !/^[A-Z][A-Za-z0-9]+$/.test(name)) {
  console.error('Usage: scaffold-component <PascalCaseName>');
  process.exit(1);
}
const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
// Directory, entry point and CSS file share the kebab-case name; the export is PascalCase.
const dir = kebab;
const target = resolve(ROOT, 'src', dir);
if (existsSync(target)) {
  console.error(`${target} already exists.`);
  process.exit(1);
}

const files = {
  [`${name}.tsx`]: `import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { classes } from '../internal/classes';
import styles from './${name}.module.css';

export interface ${name}Props extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export function ${name}({ className, ref, children, ...rest }: ${name}Props) {
  return (
    <div {...rest} ref={ref} className={classes(styles.root, className)}>
      {children}
    </div>
  );
}

${name}.displayName = '${name}';
`,
  [`${name}.module.css`]: `/* Every value is a token: --${kebab}-* in packages/tokens/tokens/component/${kebab}.json */

@layer components {
  .root {
    color: var(--color-text-default);
  }
}
`,
  [`${name}.test.tsx`]: `import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders its children', () => {
    render(<${name}>Hello</${name}>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<${name}>Hello</${name}>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
`,
  [`${name}.stories.tsx`]: `import type { Meta, StoryObj } from '@storybook/react-vite';
import { ${name} } from './${name}';

const meta = {
  title: 'Components/${name}',
  component: ${name},
  args: { children: '${name}' },
} satisfies Meta<typeof ${name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
`,
  'index.ts': `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';
`,
};

mkdirSync(target);
for (const [file, content] of Object.entries(files)) writeFileSync(resolve(target, file), content);

const tokenFile = resolve(TOKENS, `${kebab}.json`);
if (!existsSync(tokenFile)) {
  writeFileSync(
    tokenFile,
    `${JSON.stringify({ $description: `${name} component tokens. Reference the semantic layer only.`, [kebab]: {} }, null, 2)}\n`,
  );
}

function edit(file, transform) {
  const path = resolve(ROOT, file);
  writeFileSync(path, transform(readFileSync(path, 'utf8')));
}

edit('src/index.ts', (src) => `${src.trimEnd()}\nexport * from './${dir}';\n`);
edit('tsup.config.ts', (src) => src.replace(/(\n\s+)(index: 'src\/index\.ts',)/, `$1$2$1${dir}: 'src/${dir}/index.ts',`));
edit('package.json', (src) => {
  const pkg = JSON.parse(src);
  const exports = {};
  for (const [key, value] of Object.entries(pkg.exports)) {
    exports[key] = value;
    if (key === '.') exports[`./${dir}`] = { types: `./dist/${dir}.d.ts`, import: `./dist/${dir}.js` };
    if (key === './styles.css') exports[`./${dir}.css`] = `./dist/${dir}.css`;
  }
  pkg.exports = exports;
  pkg.scripts['check:package'] = pkg.scripts['check:package'].replace(/(--exclude-entrypoints .*?)( component-manifest\.json)/, `$1 ${dir}.css$2`);
  return `${JSON.stringify(pkg, null, 2)}\n`;
});

console.log(`Scaffolded ${name} in src/${dir}/ and tokens/component/${kebab}.json.`);
console.log('Next: fill the tokens, run `pnpm build:tokens`, then make the tests and story real.');
