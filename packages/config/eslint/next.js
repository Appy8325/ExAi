// @concourse/config/eslint/next.js
//
// Next.js 15 (App Router, React 19) additive flat config. Extends base.js and layers
// on React / React Hooks correctness rules. Kept intentionally small — a11y/JSX
// conventions beyond this belong in apps/web's own config, not the shared base.

const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const base = require('./base');

module.exports = [
  ...base,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // React 19 / Next.js App Router: JSX transform means React need not be in scope.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
];
