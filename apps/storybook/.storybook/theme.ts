import { create, type ThemeVars } from 'storybook/theming';
import tokens from '@pearpages/pulp-tokens/tokens.json';

/**
 * The docs site is a consumer of the tokens: its theme is read from the
 * built token manifest (brand pulp), never typed in. A renamed token throws
 * at build time, so the site cannot silently drift from the system.
 */
type Scheme = 'light' | 'dark';
type Token = { name: string; css: string; value?: unknown; light?: string; dark?: string };
const pulp = tokens.pulp as Token[];

function token(name: string): Token {
  const found = pulp.find((entry) => entry.name === name);
  if (!found) throw new Error(`theme: token ${name} is missing from tokens.json`);
  return found;
}

function color(name: string, scheme: Scheme): string {
  const value = token(name)[scheme];
  if (!value) throw new Error(`theme: token ${name} has no ${scheme} value`);
  return value;
}

const text = (name: string) => String(token(name).value);
const px = (name: string) => parseFloat(text(name));

export const WORDMARK: Record<Scheme, string> = { light: 'wordmark.svg', dark: 'wordmark-dark.svg' };

export function makeTheme(scheme: Scheme): ThemeVars {
  return create({
    base: scheme,
    brandTitle: 'pulp',
    brandUrl: './',
    brandImage: WORDMARK[scheme],
    brandTarget: '_self',
    colorPrimary: color('--color-action-primary', scheme),
    colorSecondary: color('--color-action-text', scheme),
    appBg: color('--color-surface-base', scheme),
    appContentBg: color('--color-surface-raised', scheme),
    appPreviewBg: color('--color-surface-raised', scheme),
    appBorderColor: color('--color-border-default', scheme),
    appBorderRadius: px('--radius-control'),
    fontBase: text('--typeface-body'),
    fontCode: text('--typeface-mono'),
    textColor: color('--color-text-default', scheme),
    textInverseColor: color('--color-text-on-inverse', scheme),
    textMutedColor: color('--color-text-muted', scheme),
    barTextColor: color('--color-text-muted', scheme),
    barHoverColor: color('--color-text-default', scheme),
    barSelectedColor: color('--color-action-text', scheme),
    barBg: color('--color-surface-raised', scheme),
    buttonBg: color('--color-action-secondary', scheme),
    buttonBorder: color('--color-border-default', scheme),
    inputBg: color('--color-surface-raised', scheme),
    inputBorder: color('--color-border-default', scheme),
    inputTextColor: color('--color-text-default', scheme),
    inputBorderRadius: px('--radius-control'),
  });
}
