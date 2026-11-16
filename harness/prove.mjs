#!/usr/bin/env node
// Proves that a task is ready (tasks/README.md, section 4), without a model:
//   none       the untouched workspace: the grader loads and the task is not solved yet
//   reference  tasks/<id>/solutions/reference.patch (or .final.txt): the right solution passes
//   shortcut   tasks/<id>/solutions/shortcut.patch: `pnpm check` passes, and the run still fails
//   node harness/prove.mjs T7 [T8 ...] [--layout c]
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

const LAB = resolve(import.meta.dirname, "..");
const { values: opts, positionals: tasks } = parseArgs({ allowPositionals: true, options: { layout: { type: "string", default: "c" } } });
if (!tasks.length) {
  console.error("Usage: node harness/prove.mjs <task> [<task> ...] [--layout c]");
  process.exit(1);
}

function proof(task, solution) {
  let out = "";
  try {
    out = execFileSync("node", ["harness/run.mjs", "--task", task, "--layout", opts.layout, "--solution", solution], { cwd: LAB, encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    return { error: `${e.stdout ?? ""}\n${e.stderr ?? ""}`.trim().slice(-600) };
  }
  const line = out.split("\n").find((l) => l.startsWith("PROOF "));
  return line ? JSON.parse(line.slice(6)) : { error: out.slice(-600) };
}

const has = (task, name) => ["patch", "final.txt"].some((ext) => existsSync(join(LAB, "tasks", task, "solutions", `${name}.${ext}`)));
// What each proof must show. Returns "" when it holds, or what is wrong.
const expectations = {
  none: (r) => (r.state === "evaluator_error" ? "the grader did not run" : r.state === "pass" ? "the untouched workspace passes" : r.hardCount === 0 ? "no hard test" : ""),
  reference: (r) => (r.state === "pass" ? "" : `state ${r.state}`),
  shortcut: (r) => (!r.checksAll ? "pnpm check fails: a check enforces the rule" : r.state === "fail" ? "" : `state ${r.state}: the grader does not catch the shortcut`),
};

let bad = 0;
for (const task of tasks) {
  for (const name of ["none", "reference", "shortcut"]) {
    if (name !== "none" && !has(task, name)) {
      console.log(`${task} ${name.padEnd(9)} MISSING  no tasks/${task}/solutions/${name}.patch`);
      if (name === "reference") bad++;
      continue;
    }
    const r = proof(task, name);
    const wrong = r.error ? `harness error: ${r.error}` : expectations[name](r);
    if (wrong) bad++;
    const detail = r.error ? "" : `state=${r.state} checks=${r.checksAll ? "pass" : "FAIL"} hardFailed=[${r.hardFailed.join("; ")}] softFailed=[${r.softFailed.join("; ")}]`;
    console.log(`${task} ${name.padEnd(9)} ${wrong ? "WRONG  " : "ok     "} ${wrong}${wrong && detail ? " | " : ""}${detail}${r.reasons?.length ? ` reasons=[${r.reasons.join("; ")}]` : ""}`);
  }
}
process.exit(bad ? 1 : 0);
