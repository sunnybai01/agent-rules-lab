import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const root = resolve(import.meta.dirname, "..");
export default defineConfig({
  test: {
    root,
    include: ["packages/*/src/**/*.test.ts", "apps/*/src/**/*.test.ts"],
    setupFiles: [resolve(root, "grader/shift.setup.ts")],
  },
});
