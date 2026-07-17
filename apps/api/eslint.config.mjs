import config from '@concourse/config/eslint/nestjs';

export default [
  {
    ignores: ['dist/**', 'src/**/*.js', 'src/**/*.d.ts', 'src/**/*.js.map', 'src/**/*.d.ts.map'],
  },
  ...config,
  {
    // NestJS DI requires runtime class imports — `import type` would erase
    // the constructor parameter types that `emitDecoratorMetadata` needs to
    // resolve providers. Allow the legacy `import` form for service classes.
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];
