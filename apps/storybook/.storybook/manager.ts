import { addons } from 'storybook/manager-api';
import manifest from '../../../packages/react/dist/component-manifest.json';

// The sidebar marks components that are not stable, from the same source as
// the Docs and Status pages: the manifest. Storybook has no native tag badges,
// so the label is text after the name.
const STORY_TO_COMPONENT: Record<string, string> = { Toast: 'ToastProvider' };
const status = new Map(manifest.components.map((component) => [component.name, component.status]));

addons.setConfig({
  sidebar: {
    renderLabel: (item) => {
      if (item.type !== 'component') return item.name;
      const state = status.get(STORY_TO_COMPONENT[item.name] ?? item.name);
      return state && state !== 'stable' ? `${item.name} · ${state}` : item.name;
    },
  },
});
