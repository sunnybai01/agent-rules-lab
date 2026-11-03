import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// Copied to <run>/grader/vitest.config.ts after the agent finishes. Never visible to the agent.
export default defineConfig({
  test: { root: resolve(import.meta.dirname, ".."), include: ["grader/**/*.test.ts"] },
});
