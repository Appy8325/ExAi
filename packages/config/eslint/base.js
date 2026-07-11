// @concourse/config/eslint/base.js
//
// Base ESLint 9 flat config shared by every workspace. Package has no "type": "module"
// in package.json, so this file is CommonJS (module.exports) — kept consistent with the
// other config files in this package (see prettier/index.js).
//
// Scope of responsibility: ESLint owns correctness (types, unused vars, restricted
// imports); Prettier owns formatting. eslint-config-prettier is applied last to turn
// off every stylistic rule that would otherwise conflict with Prettier's output.

const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier');

// SDK containment rule (doc 00 §6, doc 37 §6.4/§6.7):
//   - Only packages/ai/** may import `@anthropic-ai/sdk` or `voyageai`.
//   - Only packages/notifications/** may import `@aws-sdk/client-ses` or `web-push`.
// Expressed as: ban everywhere by default, then re-allow (turn the rule off) inside
// the one package glob that's permitted to use each SDK.
const restrictedAiImports = {
  paths: [
    {
      name: '@anthropic-ai/sdk',
      message: 'Direct use of @anthropic-ai/sdk is confined to packages/ai. Consume the AI service module instead.',
    },
    {
      name: 'voyageai',
      message: 'Direct use of voyageai is confined to packages/ai. Consume the AI service module instead.',
    },
  ],
};

const restrictedNotificationsImports = {
  paths: [
    {
      name: '@aws-sdk/client-ses',
      message: 'Direct use of @aws-sdk/client-ses is confined to packages/notifications. Consume the notifications module instead.',
    },
    {
      name: 'web-push',
      message: 'Direct use of web-push is confined to packages/notifications. Consume the notifications module instead.',
    },
  ],
};

module.exports = [
  // 1. TypeScript recommended rule sets (type-aware is opt-in per-consumer via
  //    languageOptions.parserOptions.project; this base stays project-agnostic).
  ...tseslint.configs.recommended,

  // 2. Project-wide correctness defaults.
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      // Let the TypeScript-aware version own unused-vars; the base rule false-positives
      // on types/overloads.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // 3. SDK containment: banned everywhere...
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['packages/ai/**'],
    rules: {
      'no-restricted-imports': ['error', restrictedAiImports],
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['packages/notifications/**'],
    rules: {
      'no-restricted-imports': ['error', restrictedNotificationsImports],
    },
  },

  // 4. Prettier compatibility — must stay last so it wins over any stylistic rules
  //    enabled above (or by consumers extending this base).
  prettierConfig,
];
