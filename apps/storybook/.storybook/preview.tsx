import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import '@fontsource-variable/archivo';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/inter';
import '@fontsource-variable/nunito';
import '@pearpages/pulp-css';
import './preview.css';

const BRANDS = ['pulp', 'bitepals'] as const;
const SCHEMES = ['light', 'dark', 'system'] as const;

const preview: Preview = {
  globalTypes: {
    brand: {
      description: 'Brand axis: which palette, radius, type and density the tokens resolve to.',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: BRANDS.map((value) => ({ value, title: value })),
        dynamicTitle: true,
      },
    },
    scheme: {
      description: 'Scheme axis: light-dark() picks a side per token. "system" follows the OS.',
      toolbar: {
        title: 'Scheme',
        icon: 'contrast',
        items: SCHEMES.map((value) => ({ value, title: value })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { brand: 'pulp', scheme: 'light' },
  decorators: [
    (Story, context) => {
      const brand = String(context.globals.brand ?? 'pulp');
      const scheme = String(context.globals.scheme ?? 'light');
      // On <html>, so the docs pages and the canvas background follow too.
      useEffect(() => {
        const root = document.documentElement;
        root.dataset.brand = brand;
        if (scheme === 'system') delete root.dataset.scheme;
        else root.dataset.scheme = scheme;
      }, [brand, scheme]);
      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    a11y: {
      // Violations fail the story in the Vitest run, not just warn in the panel.
      test: 'error',
    },
    controls: { expanded: true },
    options: {
      storySort: { order: ['Introduction', 'Tokens', 'Contributing', 'Components'] },
    },
  },
};

export default preview;
