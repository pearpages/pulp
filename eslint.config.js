import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const NO_INLINE_STYLES = {
  propName: 'style',
  message: 'No inline styles. Put it in the component CSS module and use tokens.',
};

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/storybook-static/**'],
  },
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser, ...globals.node, vi: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly' },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-vars': 'error',
      // The guardrail. The only exception is the token preview in the docs,
      // which carries an eslint-disable comment explaining why.
      'react/forbid-dom-props': ['error', { forbid: [NO_INLINE_STYLES] }],
      'react/forbid-component-props': ['error', { forbid: [NO_INLINE_STYLES] }],
      '@typescript-eslint/consistent-type-imports': 'error',
      // Module augmentation needs `interface X extends Y {}`.
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
    },
  },
);
