import config from '@concourse/config/eslint/base';

export default [
  {
    ignores: ['dist/**', 'src/**/*.js', 'src/**/*.d.ts', 'src/**/*.js.map', 'src/**/*.d.ts.map', 'openapi/**'],
  },
  ...config,
];