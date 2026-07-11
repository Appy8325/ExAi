// Shared base Vitest config (doc 37 §6.9 -- packages/config is the one place every workspace's
// shared tooling config lives, mirroring the existing eslint/typescript/prettier bases). Every
// package's own vitest.config.ts should spread this in via `mergeConfig` and override only what it
// needs (environment, coverage thresholds, setupFiles), per docs/42-testing-strategy.md §4.
import { defineConfig } from 'vitest/config';

export const baseVitestConfig = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/e2e/**',
      '**/.turbo/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '.next/**',
        'e2e/**',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
      ],
    },
  },
});

export default baseVitestConfig;
