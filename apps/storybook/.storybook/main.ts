import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));
const reactSrc = resolve(here, '../../../packages/react/src');

const config: StorybookConfig = {
  stories: ['../docs/**/*.mdx', '../../../packages/react/src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/react-vite', options: {} },
  staticDirs: ['../public'],
  typescript: {
    // Prop tables and the description text come from the TypeScript source,
    // the same source the component manifest is generated from.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      tsconfigPath: resolve(here, '../../../packages/react/tsconfig.json'),
      // The plugin's default include is relative to this app; the components live two packages up.
      include: ['**/**.tsx', resolve(here, '../../../packages/react/src/**/*.tsx')],
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => !prop.parent?.fileName.includes('node_modules'),
    },
  },
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      resolve: {
        // Stories and docs import the package by name and get the source, so
        // docgen sees TypeScript. Packaging is proven separately by the dist
        // smoke test and the package checks, not by this site.
        alias: {
          '@pearpages/pulp-react': resolve(reactSrc, 'index.ts'),
          '@pearpages/pulp-icons': resolve(here, '../../../packages/icons/src/index.ts'),
        },
        dedupe: ['react', 'react-dom'],
      },
    }),
};

export default config;
