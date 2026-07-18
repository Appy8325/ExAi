import { mergeConfig, defineConfig } from "vitest/config";
import { baseVitestConfig } from "@concourse/config/vitest/base";

export default mergeConfig(
  baseVitestConfig,
  defineConfig({
    test: {
      environment: "node",
      include: ["src/**/*.integration.test.ts"],
      hookTimeout: 180_000,
      testTimeout: 60_000,
      pool: "forks",
      poolOptions: { forks: { minForks: 1, maxForks: 1 } },
    },
  }),
);
