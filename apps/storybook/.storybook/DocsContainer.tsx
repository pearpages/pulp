import { DocsContainer as BaseContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import { type PropsWithChildren, useEffect, useState, useSyncExternalStore } from 'react';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { type Brand, makeTheme, type Scheme } from './theme';

/**
 * Docs pages follow one scheme: the toolbar's, and the OS when it says "system" (the default).
 *
 * Storybook's docs chrome takes a theme once, and MDX pages run no story decorator, so without this
 * the chrome stayed light while the token tables on it followed the OS: on a dark OS the Tokens and
 * Status tables were #ededf2 on white. Here the container reads the toolbar globals, sets
 * data-brand/data-scheme on <html> for every docs page (MDX included) and hands the chrome the
 * theme built from the same brand and scheme. check-built-site.mjs holds it with axe in three views.
 */
type Globals = { brand?: string; scheme?: string };
type WithStore = { store?: { userGlobals?: { get?: () => Globals } } };

const DARK = '(prefers-color-scheme: dark)';
const osDark = () => window.matchMedia(DARK).matches;
function subscribeOs(onChange: () => void) {
  const query = window.matchMedia(DARK);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function currentGlobals(context: DocsContainerProps['context']): Globals {
  const fromStore = (context as unknown as WithStore).store?.userGlobals?.get?.();
  return fromStore ?? (context.projectAnnotations.initialGlobals as Globals | undefined) ?? {};
}

export function DocsContainer({ context, children }: PropsWithChildren<DocsContainerProps>) {
  const [globals, setGlobals] = useState<Globals>(() => currentGlobals(context));
  const systemDark = useSyncExternalStore(subscribeOs, osDark, () => false);

  useEffect(() => {
    const update = ({ globals: next }: { globals: Globals }) => setGlobals(next);
    context.channel.on(GLOBALS_UPDATED, update);
    return () => context.channel.off(GLOBALS_UPDATED, update);
  }, [context]);

  const brand: Brand = globals.brand === 'bitepals' ? 'bitepals' : 'pulp';
  const chosen = globals.scheme ?? 'system';
  const scheme: Scheme = chosen === 'dark' || (chosen === 'system' && systemDark) ? 'dark' : 'light';

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.brand = brand;
    if (chosen === 'system') delete root.dataset.scheme;
    else root.dataset.scheme = chosen;
  }, [brand, chosen]);

  return (
    <BaseContainer context={context} theme={makeTheme(scheme, brand)}>
      {children}
    </BaseContainer>
  );
}
