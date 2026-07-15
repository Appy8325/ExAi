import { mergeConfig, defineConfig } from 'vitest/config';
import { baseVitestConfig } from '@concourse/config/vitest/base';

// apps/api unit tier (doc 42 §4): plain node environment -- NestJS modules, no DOM. Integration
// tests against real Postgres/Redis via Testcontainers (doc 42 §5) are a separate config/task,
// not this one; this file is unit-tier only.
export default mergeConfig(
  baseVitestConfig,
  defineConfig({
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
      exclude: ['src/**/*.integration.test.ts', 'node_modules/**', 'dist/**'],
    },
  }),
);
