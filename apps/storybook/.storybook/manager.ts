import { createElement } from 'react';
import { Link } from 'storybook/internal/components';
import { addons, types } from 'storybook/manager-api';
import { getPreferredColorScheme } from 'storybook/theming';
import pkg from '../../../packages/react/package.json';
import manifest from '../../../packages/react/dist/component-manifest.json';
import { makeTheme } from './theme';

// The sidebar marks components that are not stable, from the same source as
// the Docs and Status pages: the manifest. Storybook has no native tag badges,
// so the label is text after the name.
const STORY_TO_COMPONENT: Record<string, string> = { Toast: 'ToastProvider' };
const status = new Map(manifest.components.map((component) => [component.name, component.status]));

addons.setConfig({
  // The manager follows the OS scheme; the toolbar's brand and scheme axes apply to the preview.
  theme: makeTheme(getPreferredColorScheme() === 'dark' ? 'dark' : 'light'),
  sidebar: {
    renderLabel: (item) => {
      if (item.type !== 'component') return item.name;
      const state = status.get(STORY_TO_COMPONENT[item.name] ?? item.name);
      return state && state !== 'stable' ? `${item.name} · ${state}` : item.name;
    },
  },
});

// The released version, on every page: the react package's version, which the release tag follows.
// It links to that GitHub Release (notes built from the CHANGELOGs by scripts/release-notes.mjs).
addons.register('pulp/version', () => {
  addons.add('pulp/version/tool', {
    type: types.TOOL,
    title: 'Version',
    match: () => true,
    render: () =>
      createElement(
        Link,
        { href: `https://github.com/pearpages/pulp/releases/tag/v${pkg.version}`, target: '_blank', rel: 'noreferrer', cancel: false, secondary: true },
        `v${pkg.version}`,
      ),
  });
});
