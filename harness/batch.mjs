#!/usr/bin/env node
// Runs the matrix of one experiment. Resumable: a run with a result is skipped.
//   node harness/batch.mjs E1 [--best c] [--parallel 2] [--model <id>] [--dry-run]
import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

const LAB = resolve(import.meta.dirname, "..");
const { values: opts, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    best: { type: "string", default: "c" },
    parallel: { type: "string", default: "1" },
    model: { type: "string" },
    permissions: { type: "string", default: "scoped" },
    "dry-run": { type: "boolean", default: false },
  },
});
const name = positionals[0];
const exp = JSON.parse(readFileSync(join(LAB, "harness/experiments.json"), "utf8"))[name];
if (!exp) throw new Error(`Unknown experiment ${name}`);

export function matrix(e, best) {
  const runs = [];
  for (let r = 1; r <= e.repeats; r++)
    for (const task of e.tasks)
      for (const layout of e.layouts.map((l) => (l === "$best" ? best : l)))
        for (const workflow of e.workflows)
          for (const feedback of e.feedback) runs.push({ task, layout, workflow, feedback, repeat: String(r) });
  return runs;
}

const runs = matrix(exp, opts.best).filter(
  (a) => !existsSync(join(LAB, "results/runs", `${a.task}-${a.layout}-${a.workflow}-${a.feedback}-r${a.repeat}`, "result.json")),
);
console.log(`${name}: ${runs.length} runs to do`);
if (opts["dry-run"]) {
  for (const r of runs) console.log(r);
  process.exit(0);
}

// Preflight: the CLI must be signed in, or a token or API key must be set.
if (!process.env.CLAUDE_CODE_OAUTH_TOKEN && !process.env.ANTHROPIC_API_KEY) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (key === "CLAUDECODE" || key.startsWith("CLAUDE_CODE_")) delete env[key];
  delete env.ANTHROPIC_BASE_URL;
  let status = {};
  try {
    status = JSON.parse(execFileSync("claude", ["auth", "status"], { env, encoding: "utf8" }));
  } catch {}
  if (!status.loggedIn) {
    console.error("The claude CLI is not signed in. Run `claude auth login`, or set CLAUDE_CODE_OAUTH_TOKEN (`claude setup-token`) or ANTHROPIC_API_KEY.");
    process.exit(1);
  }
}

const queue = [...runs];
async function worker() {
  while (queue.length) {
    const a = queue.shift();
    const argv = ["harness/run.mjs", "--task", a.task, "--layout", a.layout, "--workflow", a.workflow, "--feedback", a.feedback, "--repeat", a.repeat];
    if (opts.model) argv.push("--model", opts.model);
    argv.push("--permissions", opts.permissions);
    await new Promise((done) => spawn("node", argv, { cwd: LAB, stdio: "inherit" }).on("close", done));
  }
}
await Promise.all(Array.from({ length: Number(opts.parallel) }, worker));
