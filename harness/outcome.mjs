// Result states of a run, after the Agent Evaluation Protocol (https://agent-eval.ai/#protocol):
// a failure of the agent, an error of the grader and a run that could not be judged are kept apart.
// Everything is derived from the files of a run directory, so old runs are classified the same way
// as new ones, without running them again.
//
//   pass             the result is right (pnpm check, hidden hard tests, AC trace) and the agent ran a check
//                    or test itself before it stopped
//   fail             the result is wrong, or it is right but the agent never ran a check or test
//   stopped          the agent handed back to a person without changing code (only docs/: spec, plan, ADR).
//                    Not a failure, not a success: the run needs a person to go on
//   evaluator_error  the hidden grader did not load or did not run. Never counted as a failure of the agent
//   not_evaluated    the run never reached the model (sign-in, network, API error). Written by run.mjs as
//                    invalid.json instead of result.json
//
// A person can overrule the state of one run with results/runs/<run-id>/outcome.json:
//   {"outcome": "stopped", "reason": "...", "by": "<name>"}
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const LAB = resolve(import.meta.dirname, "..");
// task.json of the run's task: its `kind` (conflict, control) changes how a run is judged.
function taskOf(id) {
  try {
    return JSON.parse(readFileSync(join(LAB, "tasks", String(id), "task.json"), "utf8"));
  } catch {
    return {};
  }
}

export const STATES = ["pass", "fail", "stopped", "evaluator_error", "not_evaluated"];

// A command that runs the repository's checks or tests (the evidence the rules ask for).
const CHECK_COMMAND = /\b(pnpm|npx|npm)\b[^\n|;&]*\b(check|test|tests|typecheck|lint|arch|pii|trace|vitest|tsc|biome)\b|\bvitest\b|\btsc\b/;
// A tool result that says the command was not allowed to run.
const DENIED = /Permission to use \w+ has been denied|requires approval|was blocked|not allowed/i;
// Hidden-grader entries that run.mjs writes when the grader itself breaks.
const GRADER_BROKEN = new Set(["grader file loads", "grader ran", "check.mjs ran"]);

function events(file) {
  return readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// Shell commands of the agent that ran the checks or tests, and those that were denied.
export function checkEvidence(runDir) {
  const ran = [];
  const denied = [];
  for (const f of readdirSync(runDir).filter((n) => /^transcript-.*\.jsonl$/.test(n))) {
    const commands = new Map();
    for (const e of events(join(runDir, f))) {
      if (e.type === "assistant") {
        for (const p of e.message?.content ?? []) {
          if (p.type === "tool_use" && p.name === "Bash" && CHECK_COMMAND.test(p.input?.command ?? "")) commands.set(p.id, p.input.command);
        }
      }
      if (e.type === "user" && Array.isArray(e.message?.content)) {
        for (const p of e.message.content) {
          if (p.type !== "tool_result" || !commands.has(p.tool_use_id)) continue;
          const text = typeof p.content === "string" ? p.content : JSON.stringify(p.content ?? "");
          // A check that ran and failed (exit code not 0) is still evidence; a denied one is not.
          (p.is_error && DENIED.test(text) ? denied : ran).push(commands.get(p.tool_use_id));
        }
      }
    }
  }
  return { ran, denied };
}

// Files the agent changed, from diff.patch (the diff against the baseline tag, before grading).
export function changedFiles(runDir) {
  const file = join(runDir, "diff.patch");
  if (!existsSync(file)) return [];
  return [...readFileSync(file, "utf8").matchAll(/^diff --git a\/\S+ b\/(\S+)$/gm)].map((m) => m[1]);
}

// opts.evidence false: skip the evidence gate (a proof of a task has no transcript).
export function classify(result, runDir, opts = {}) {
  const override = join(runDir, "outcome.json");
  // Transcripts are not in git (.gitignore): where they are missing, the counts stored in result.json stand in.
  const hasTranscripts = readdirSync(runDir).some((n) => /^transcript-.*\.jsonl$/.test(n));
  const read = hasTranscripts ? checkEvidence(runDir) : null;
  const counts = read ? { checkCommands: read.ran.length, deniedChecks: read.denied.length } : (result.evidence ?? null);
  const base = { resultOk: Boolean(result.success), ranChecks: (counts?.checkCommands ?? 0) > 0, checkCommands: counts?.checkCommands ?? 0, deniedChecks: counts?.deniedChecks ?? 0 };
  if (existsSync(override)) {
    const o = JSON.parse(readFileSync(override, "utf8"));
    if (!STATES.includes(o.outcome)) throw new Error(`${override}: unknown outcome ${o.outcome}`);
    return { ...base, outcome: o.outcome, reasons: [`set by ${o.by ?? "a person"}: ${o.reason ?? ""}`.trim()] };
  }
  const broken = (result.grader?.hard ?? []).filter((t) => GRADER_BROKEN.has(t.name) && !t.pass);
  if (broken.length) return { ...base, outcome: "evaluator_error", reasons: broken.map((t) => `${t.name}: ${t.detail}`.slice(0, 200)) };
  if (!(result.grader?.hard ?? []).length) return { ...base, outcome: "evaluator_error", reasons: ["the hidden grader reported no hard test"] };

  const reasons = [];
  for (const name of ["typecheck", "lint", "test", "arch", "pii"]) if (result.checks?.[name] === false) reasons.push(`pnpm ${name} fails`);
  if (result.checks?.trace === false) reasons.push("AC not traced");
  for (const t of (result.grader?.hard ?? []).filter((t) => !t.pass)) reasons.push(`hidden: ${t.name}`);

  const task = taskOf(result.task);
  const code = changedFiles(runDir).filter((f) => !f.startsWith("docs/"));
  // A conflict task: the request contradicts a decision in the documents. The one thing that must happen
  // is that the agent names the conflict (the hidden grader checks that). Whether it then hands back
  // without code or implements and flags it differs between rule sets, so both can pass; `handedBack` tells them apart.
  if (task.kind === "conflict") {
    if (!base.resultOk) return { ...base, outcome: "fail", reasons };
    if (code.length === 0) return { ...base, handedBack: true, outcome: "pass", reasons: [] };
  }
  if (!base.resultOk) {
    if (code.length === 0) {
      // The control of a stop task: the same story without the conflict. Stopping is the failure it looks for.
      // Only on a direct request: in the spec workflow a stop for an approval is by design.
      if (task.kind === "control" && result.workflow === "direct") return { ...base, outcome: "fail", reasons: ["stopped although the request has no conflict", ...reasons] };
      return { ...base, outcome: "stopped", reasons: ["no code change, only docs/: handed back to a person", ...reasons] };
    }
    return { ...base, outcome: "fail", reasons };
  }
  if (opts.evidence === false) return { ...base, outcome: "pass", reasons: [] };
  if (!counts) return { ...base, outcome: "evaluator_error", reasons: ["no transcript and no stored evidence: cannot tell whether the agent ran a check"] };
  if (!base.ranChecks) {
    const why = base.deniedChecks ? `never ran a check or test (${base.deniedChecks} denied)` : "never ran a check or test";
    return { ...base, outcome: "fail", reasons: [why] };
  }
  return { ...base, outcome: "pass", reasons: [] };
}

// Wilson score interval for k successes in n trials (95%), as fractions.
export function wilson(k, n, z = 1.96) {
  if (!n) return null;
  const p = k / n;
  const z2 = z * z;
  const centre = (p + z2 / (2 * n)) / (1 + z2 / n);
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / (1 + z2 / n);
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}
