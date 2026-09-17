import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import '@fontsource-variable/archivo';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/inter';
import '@fontsource-variable/nunito';
import '@pearpages/pulp-css';
import './preview.css';
import { ComponentDocs } from '../docs/ComponentDocs';
import { makeTheme } from './theme';

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
  // Visual regression. `__pulpVisual` exists only in the CI Vitest run (vitest.visual.setup.ts);
  // in Storybook itself and in local runs both hooks do nothing. Only the matrix stories are
  // shot: they are the brand × scheme surface of every component. This runs after `play`, with
  // Storybook's animations already paused, which is what makes spinners and shimmers stable.
  beforeEach: () => globalThis.__pulpVisual?.freezeDate(),
  afterEach: async (context) => {
    const visual = globalThis.__pulpVisual;
    if (!visual || !context.name.startsWith('Matrix')) return;
    // Overlays portal out of the canvas. Those components already say so for axe.
    const portals = (context.parameters.a11y as { context?: string } | undefined)?.context === 'body';
    await visual.match(portals ? document.body : context.canvasElement, `${context.globals.brand}-${context.globals.scheme}`);
  },
  // Every stories file gets a Docs page, rendered from the component manifest (one source: the JSDoc).
  tags: ['autodocs'],
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
    // Docs pages take the same token-derived theme as the manager (typography, link colour).
    docs: { page: ComponentDocs, theme: makeTheme('light') },
    controls: { expanded: true },
    options: {
      // Storybook evaluates storySort statically, so the categories are a literal here; the dist
      // smoke test asserts it matches the manifest's list (packages/react/scripts/categories.mjs).
      // Forms is the one category not sorted alphabetically: the wiring first, then the inputs.
      storySort: {
        method: 'alphabetical',
        order: [
          'Introduction',
          'Tokens',
          'Status',
          'Decisions',
          'Contributing',
          'Components',
          [
            'Typography',
            'Layout',
            'Actions',
            'Forms',
            ['Field', 'TextField', 'Textarea', 'Select', 'Picker', 'Combobox', 'Listbox', 'Checkbox', 'Switch', 'RadioGroup', 'Slider', 'DatePicker', 'Calendar'],
            'Navigation',
            'Overlays',
            'Feedback',
            'Data',
            'Utilities',
          ],
          'Patterns',
        ],
      },
    },
  },
};

export default preview;
