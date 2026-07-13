import config from './eslint/base.js';

export default [
  ...config,
  // These are deliberately CommonJS modules: this package has no `type: module`
  // declaration and consumers load the shared configs through `require()`.
  // Keep the exception local to the config modules themselves; application code
  // continues to use the project-wide import rules.
  {
    files: ['eslint/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
