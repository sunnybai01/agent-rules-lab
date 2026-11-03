// Stop hook: run `pnpm check` before the agent finishes. On failure, block the stop and
// send the failing output back to the agent. Gives up after 3 attempts per session.
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const counter = join(tmpdir(), `check-on-stop-${input.session_id ?? "x"}`);
const attempts = existsSync(counter) ? Number(readFileSync(counter, "utf8")) : 0;
if (attempts >= 3) process.exit(0);

try {
  execSync("pnpm -s check", { cwd: process.env.CLAUDE_PROJECT_DIR, stdio: "pipe", encoding: "utf8" });
  process.exit(0);
} catch (error) {
  writeFileSync(counter, String(attempts + 1));
  const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}`.trim().split("\n").slice(-60).join("\n");
  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason: `pnpm check failed (attempt ${attempts + 1} of 3). Fix the problems, then finish.\n\n${output}`,
    }),
  );
  process.exit(0);
}
