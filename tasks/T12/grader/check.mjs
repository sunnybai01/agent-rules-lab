// T12 grader, second part: a time bomb. The repository's tests (the agent's new ones included) must
// pass on another day. See shift.setup.ts.
import { execSync } from "node:child_process";

const root = process.argv[2];
const out = { hard: [], soft: [] };
let pass = true;
let detail = "";
try {
  execSync("pnpm exec vitest run --config grader/shift.config.ts", { cwd: root, stdio: "pipe", encoding: "utf8", timeout: 240_000 });
} catch (e) {
  pass = false;
  detail = `${e.stdout ?? ""}\n${e.stderr ?? ""}`.replace(/\u001b\[[0-9;]*m/g, "").split("\n").filter((l) => /FAIL|Error|expected/i.test(l)).slice(0, 6).join(" | ").slice(0, 400);
}
out.hard.push({ name: "the tests of the repository pass on another day (system date 14 June 2031)", pass, detail });
console.log(JSON.stringify(out));
