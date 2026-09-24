import { create, type ThemeVars } from 'storybook/theming';
import tokens from '@pearpages/pulp-tokens/tokens.json';

/**
 * The docs site is a consumer of the tokens: its theme is read from the
 * built token manifest (brand pulp), never typed in. A renamed token throws
 * at build time, so the site cannot silently drift from the system.
 */
export type Scheme = 'light' | 'dark';
export type Brand = keyof typeof tokens;
type Token = { name: string; css: string; value?: unknown; light?: string; dark?: string };

function token(brand: Brand, name: string): Token {
  const found = (tokens[brand] as Token[]).find((entry) => entry.name === name);
  if (!found) throw new Error(`theme: token ${name} is missing from tokens.json (${brand})`);
  return found;
}

export const WORDMARK: Record<Scheme, string> = { light: 'wordmark.svg', dark: 'wordmark-dark.svg' };

/** The manager uses brand pulp; docs pages follow the toolbar's brand and scheme (DocsContainer.tsx). */
export function makeTheme(scheme: Scheme, brand: Brand = 'pulp'): ThemeVars {
  const color = (name: string) => {
    const value = token(brand, name)[scheme];
    if (!value) throw new Error(`theme: token ${name} has no ${scheme} value (${brand})`);
    return value;
  };
  const text = (name: string) => String(token(brand, name).value);
  const px = (name: string) => parseFloat(text(name));
  return create({
    base: scheme,
    brandTitle: 'pulp',
    brandUrl: './',
    brandImage: WORDMARK[scheme],
    brandTarget: '_self',
    colorPrimary: color('--color-action-primary'),
    colorSecondary: color('--color-action-text'),
    appBg: color('--color-surface-base'),
    appContentBg: color('--color-surface-raised'),
    appPreviewBg: color('--color-surface-raised'),
    appBorderColor: color('--color-border-default'),
    appBorderRadius: px('--radius-control'),
    fontBase: text('--typeface-body'),
    fontCode: text('--typeface-mono'),
    textColor: color('--color-text-default'),
    textInverseColor: color('--color-text-on-inverse'),
    textMutedColor: color('--color-text-muted'),
    barTextColor: color('--color-text-muted'),
    barHoverColor: color('--color-text-default'),
    barSelectedColor: color('--color-action-text'),
    barBg: color('--color-surface-raised'),
    buttonBg: color('--color-action-secondary'),
    buttonBorder: color('--color-border-default'),
    inputBg: color('--color-surface-raised'),
    inputBorder: color('--color-border-default'),
    inputTextColor: color('--color-text-default'),
    inputBorderRadius: px('--radius-control'),
  });
}
