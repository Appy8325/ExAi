import { defineConfig, mergeConfig } from "vitest/config";
import base from "@concourse/config/vitest/base";

// Node environment is correct for every package here (packages/ui's components
// are tested via apps/web's jsdom config when integrated into real pages;
// unit-testing this package's own logic in isolation stays on the base's
// 'node' default). See docs/42-testing-strategy.md §4.
export default mergeConfig(base, defineConfig({}));
