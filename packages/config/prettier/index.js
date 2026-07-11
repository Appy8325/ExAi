// @concourse/config/prettier/index.js
//
// Single Prettier 3 config every workspace extends. Package has no "type": "module"
// in package.json, so this file is CommonJS (module.exports) — kept consistent with
// the ESLint flat configs in this package.

/** @type {import('prettier').Config} */
module.exports = {
  semi: true,
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'all',
  arrowParens: 'always',
  endOfLine: 'lf',
  bracketSpacing: true,
};
