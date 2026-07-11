import { mergeConfig, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { baseVitestConfig } from '@concourse/config/vitest/base';

// apps/web unit/component tier (doc 42 §4): jsdom environment for React component tests, since
// this is the one workspace that renders components rather than running pure node logic.
export default mergeConfig(
  baseVitestConfig,
  defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
      // Playwright's e2e/ tree is a separate test runner entirely -- never picked up by Vitest.
      exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'e2e/**'],
    },
  }),
);
