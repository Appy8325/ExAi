// @concourse/config/eslint/nestjs.js
//
// NestJS 11 additive flat config. Extends base.js with a small set of decorator-
// friendly relaxations — Nest's DI/DTO/decorator patterns routinely produce empty
// classes, parameter-property constructors, and decorator metadata shapes that the
// stricter TS rules would otherwise flag as errors.

const base = require('./base');

module.exports = [
  ...base,
  {
    files: ['**/*.ts'],
    rules: {
      // DTOs/interfaces commonly extend a base class/interface with no additional
      // members yet (e.g. `class CreateFooDto extends BaseDto {}`).
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      // Nest relies on constructor parameter properties for DI (`constructor(private readonly x: X)`).
      '@typescript-eslint/parameter-properties': 'off',
      // Decorator metadata frequently needs `Object`/`Function`-shaped types.
      '@typescript-eslint/ban-types': 'off',
    },
  },
];
