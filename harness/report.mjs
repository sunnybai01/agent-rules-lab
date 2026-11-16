#!/usr/bin/env node
// Builds results/summary.md from results/runs/*/result.json (and invalid.json), review.md and outcome.json.
//   node harness/report.mjs [--best c]
// The state of each run (pass, fail, stopped, evaluator_error, not_evaluated) comes from harness/outcome.mjs.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { classify, wilson } from "./outcome.mjs";

const LAB = resolve(import.meta.dirname, "..");
const { values: opts } = parseArgs({ options: { best: { type: "string", default: "c" } } });
const runsDir = join(LAB, "results/runs");
const experiments = JSON.parse(readFileSync(join(LAB, "harness/experiments.json"), "utf8"));

const runs = (existsSync(runsDir) ? readdirSync(runsDir) : [])
  .map((d) => {
    const dir = join(runsDir, d);
    if (existsSync(join(dir, "result.json"))) {
      const r = JSON.parse(readFileSync(join(dir, "result.json"), "utf8"));
      const review = existsSync(join(dir, "review.md")) ? readFileSync(join(dir, "review.md"), "utf8") : "";
      const scores = [...review.matchAll(/^- \[(\d)\]/gm)].map((m) => Number(m[1]));
      const items = [...review.matchAll(/^- \[[ \d]\]/gm)].length;
      r.reviewScore = scores.length && scores.length === items ? scores.reduce((a, b) => a + b, 0) / (2 * items) : null;
      r.state = classify(r, dir);
      return r;
    }
    // A run that never reached the model: kept as "not evaluated", with no result to measure.
    if (existsSync(join(dir, "invalid.json"))) {
      const r = JSON.parse(readFileSync(join(dir, "invalid.json"), "utf8"));
      return { ...r, invalid: true, state: { outcome: "not_evaluated", reasons: [r.reason] } };
    }
    return null;
  })
  .filter(Boolean);

const pct = (xs) => (xs.length ? `${Math.round((100 * xs.filter(Boolean).length) / xs.length)}%` : "–");
const mean = (xs, d = 1) => (xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(d) : "–");
const range = (xs, d = 2) => (xs.length ? `${Math.min(...xs).toFixed(d)}–${Math.max(...xs).toFixed(d)}` : "–");
const ratio = (list) => list.map((l) => (l.length ? l.filter((t) => t.pass).length / l.length : 0));
const count = (rs, outcome) => rs.filter((r) => r.state.outcome === outcome).length;

// Success over the runs that could be judged (pass or fail), with its 95% interval.
function success(rs) {
  const pass = count(rs, "pass");
  const judged = pass + count(rs, "fail");
  const ci = wilson(pass, judged);
  return { pass, judged, rate: judged ? pass / judged : null, ci };
}
const fmtSuccess = (s) =>
  s.judged ? `${Math.round(100 * s.rate)}% [${Math.round(100 * s.ci[0])}–${Math.round(100 * s.ci[1])}] (${s.pass}/${s.judged})` : "–";

function row(label, all) {
  const rs = all.filter((r) => !r.invalid); // runs with a result
  const s = success(all);
  const spend = rs.reduce((n, r) => n + r.costUsd, 0);
  return [
    label,
    all.length,
    fmtSuccess(s),
    pct(rs.map((r) => r.state.resultOk)),
    pct(rs.map((r) => r.state.ranChecks)),
    count(all, "stopped"),
    count(all, "evaluator_error"),
    count(all, "not_evaluated"),
    pct(rs.map((r) => r.checks.all)),
    `${Math.round(100 * Number(mean(ratio(rs.map((r) => r.grader.hard)), 3)))}%`,
    `${Math.round(100 * Number(mean(ratio(rs.map((r) => r.grader.soft)), 3)))}%`,
    mean(rs.map((r) => r.checks.archViolations ?? 0)),
    mean(rs.map((r) => r.checks.piiErrors ?? 0)),
    pct(rs.map((r) => r.docsChanged.length > 0)),
    mean(rs.map((r) => r.phases.reduce((n, p) => n + p.docsRead.length, 0))),
    rs.length ? `$${mean(rs.map((r) => r.costUsd), 2)} (${range(rs.map((r) => r.costUsd))})` : "–",
    // All spend, failed and stopped runs included, divided by the passes. No pass: undefined, not zero.
    s.pass ? `$${(spend / s.pass).toFixed(2)}` : "undefined",
    mean(rs.map((r) => r.turns), 0),
    mean(rs.map((r) => r.wallMs / 60000)),
    mean(rs.map((r) => r.humanInterventions ?? 0)),
    rs.some((r) => r.reviewScore !== null) ? `${Math.round(100 * Number(mean(rs.filter((r) => r.reviewScore !== null).map((r) => r.reviewScore), 3)))}%` : "–",
  ];
}

const header = [
  "Variant", "n", "Success [95% CI]", "Result only", "Ran checks", "Stopped", "Eval err.", "Not eval.", "Checks", "Hidden hard",
  "Hidden soft", "Arch viol.", "PII err.", "Docs updated", "Docs read", "Cost/run (range)", "Cost/success", "Turns", "Minutes", "Answers", "Review",
];
const table = (rows) =>
  [`| ${header.join(" | ")} |`, `|${header.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");

// Firm needs holdout tasks (kept out of tuning) and intervals that do not overlap; otherwise directional.
function grade(e, groups) {
  const scored = groups.map(([v, rs]) => [v, success(rs)]).filter(([, s]) => s.judged);
  if (scored.length < 2) return "";
  const [bestV, best] = scored.reduce((a, b) => (b[1].rate > a[1].rate ? b : a));
  const overlap = scored.filter(([v, s]) => v !== bestV && s.ci[1] >= best.ci[0]).map(([v]) => v);
  const why = [];
  if (!e.holdout) why.push("no holdout tasks: every task here was also used to tune the variants");
  if (overlap.length) why.push(`the 95% interval of ${bestV} overlaps with ${overlap.join(", ")}`);
  const text = why.join("; ");
  return why.length ? `\nGrade: **directional**. ${text[0].toUpperCase()}${text.slice(1)}.\n` : `\nGrade: **firm**. ${bestV} is ahead and the intervals do not overlap.\n`;
}

let md = `# Results\n\nGenerated by \`node harness/report.mjs\` on ${new Date().toISOString().slice(0, 16)}. ${runs.length} runs.\n\n`;
md += `Each run has one state ([harness/outcome.mjs](../harness/outcome.mjs)), after the [Agent Evaluation Protocol](https://agent-eval.ai/#protocol):

- **pass**: \`pnpm check\` passes, all hidden hard tests pass, the required AC IDs are traced, **and** the agent ran a check or test itself before it stopped (a right result without that evidence is a fail).
- **fail**: anything else in which the agent changed code.
- **stopped**: the agent changed only \`docs/\` (spec, plan, ADR) and handed back to a person. Not a failure, not a success.
- **evaluator error**: the hidden grader did not load or run. Never counted against the variant.
- **not evaluated**: the run never reached the model (\`invalid.json\`).
- A person can overrule one run with \`results/runs/<run-id>/outcome.json\`.

Success = pass / (pass + fail), with a 95% Wilson interval and the counts. Result only = the old definition of success (result right, evidence not required), for comparison. Ran checks = the agent ran \`pnpm check\`, a part of it or the tests at least once (a denied command does not count). Cost/success = all spend of the group, failed and stopped runs included, divided by the passes. Docs read = Markdown files opened with Read. Answers = questions a person answered (spec gate: 1). Review = rubric score / max.

Grade: a result is **firm** only with holdout tasks and intervals that do not overlap; otherwise it is **directional** (protocol §1, §7 step 10).
`;

for (const [name, e] of Object.entries(experiments)) {
  if (name === "defaults") continue;
  const layouts = e.layouts.map((l) => (l === "$best" ? opts.best : l));
  const inExp = runs.filter(
    (r) => e.tasks.includes(r.task) && layouts.includes(r.layout) && e.workflows.includes(r.workflow) && e.feedback.includes(r.feedback) && r.repeat <= e.repeats,
  );
  if (!inExp.length) continue;
  const varying = layouts.length > 1 ? "layout" : e.workflows.length > 1 ? "workflow" : e.feedback.length > 1 ? "feedback" : "layout";
  const values = varying === "layout" ? layouts : varying === "workflow" ? e.workflows : e.feedback;
  const groups = values.map((v) => [v, inExp.filter((r) => r[varying] === v)]).filter(([, rs]) => rs.length);
  md += `\n## ${name}: by ${varying}\n\n${table(groups.map(([v, rs]) => row(v, rs)))}\n${grade(e, groups)}`;
  if (e.tasks.length > 1) {
    md += `\n### ${name}: by task and ${varying}\n\n`;
    md += table(e.tasks.flatMap((t) => values.map((v) => row(`${t} / ${v}`, inExp.filter((r) => r.task === t && r[varying] === v)))));
    md += "\n";
  }
}

md += "\n## All runs\n\n| Run | State | Result | Ran checks | Hard | Soft | Cost | Turns | Reasons |\n|---|---|---|---|---|---|---|---|---|\n";
for (const r of runs.sort((a, b) => a.runId.localeCompare(b.runId))) {
  const why = r.state.reasons.join("; ").replace(/\|/g, "\\|").replace(/\n/g, " ");
  if (r.invalid) {
    md += `| [${r.runId}](runs/${r.runId}/invalid.json) | not evaluated | – | – | – | – | $${(r.costUsd ?? 0).toFixed(2)} | – | ${why} |\n`;
    continue;
  }
  const n = (l) => `${l.filter((t) => t.pass).length}/${l.length}`;
  const ran = r.state.ranChecks ? `yes (${r.state.checkCommands})` : r.state.deniedChecks ? `no (${r.state.deniedChecks} denied)` : "no";
  md += `| [${r.runId}](runs/${r.runId}/result.json) | ${r.state.outcome.replace("_", " ")} | ${r.state.resultOk ? "right" : "wrong"} | ${ran} | ${n(r.grader.hard)} | ${n(r.grader.soft)} | $${r.costUsd.toFixed(2)} | ${r.turns} | ${why} |\n`;
}
writeFileSync(join(LAB, "results/summary.md"), md);
const totals = ["pass", "fail", "stopped", "evaluator_error", "not_evaluated"].map((o) => `${o} ${count(runs, o)}`).join(", ");
console.log(`results/summary.md: ${runs.length} runs (${totals})`);
