import config from '@concourse/config/eslint/nestjs';

export default [
  {
    // Exclude build outputs: tsc emits .js/.d.ts alongside .ts sources
    // (no outDir in tsconfig.json). dist/ is also excluded.
    ignores: ['dist/**', 'src/**/*.js', 'src/**/*.d.ts', 'src/**/*.js.map', 'src/**/*.d.ts.map'],
  },
  ...config,
];
