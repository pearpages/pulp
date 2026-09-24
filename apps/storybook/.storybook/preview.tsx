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
import { DocsContainer } from './DocsContainer';

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
  // "system" first, so the canvas and the docs pages open in the scheme the manager already follows.
  initialGlobals: { brand: 'pulp', scheme: 'system' },
  // Every stories file gets a Docs page, rendered from the component manifest (one source: the JSDoc).
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const brand = String(context.globals.brand ?? 'pulp');
      const scheme = String(context.globals.scheme ?? 'system');
      const inDocs = context.viewMode === 'docs';
      // A story on its own owns the page: brand and scheme go on <html>, so the canvas background
      // follows. On a docs page <html> belongs to DocsContainer, and a story with its own globals
      // (the matrix ones) is scoped to a wrapper instead: brands and schemes nest.
      useEffect(() => {
        if (inDocs) return;
        const root = document.documentElement;
        root.dataset.brand = brand;
        if (scheme === 'system') delete root.dataset.scheme;
        else root.dataset.scheme = scheme;
      }, [inDocs, brand, scheme]);
      if (!inDocs) return <Story />;
      return (
        <div className="docs-story-scope" data-brand={brand} data-scheme={scheme === 'system' ? undefined : scheme}>
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    a11y: {
      // Violations fail the story in the Vitest run, not just warn in the panel.
      test: 'error',
    },
    // Docs pages take a token-derived theme in the toolbar's brand and scheme (DocsContainer.tsx).
    docs: { page: ComponentDocs, container: DocsContainer },
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
