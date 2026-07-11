import { mergeConfig, defineConfig } from 'vitest/config';
import { baseVitestConfig } from '@concourse/config/vitest/base';

// apps/worker unit tier (doc 42 §4): plain node environment -- BullMQ consumers, no DOM.
// Integration tests against real Redis via Testcontainers (doc 42 §5) are a separate config/task.
export default mergeConfig(
  baseVitestConfig,
  defineConfig({
    test: {
      environment: 'node',
    },
  }),
);
