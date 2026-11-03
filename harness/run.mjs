#!/usr/bin/env node
// One benchmark run: build the workspace, run the agent headless, grade, save the evidence.
//   node harness/run.mjs --task T3 --layout c [--workflow direct|spec] [--feedback off|on]
//                        [--repeat 1] [--model <id>] [--gate auto|manual] [--keep] [--force]
import { execFileSync, execSync, spawn } from "node:child_process";
import {
  appendFileSync,
  cpSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";

const LAB = resolve(import.meta.dirname, "..");
const RUN_TIMEOUT_MS = 40 * 60 * 1000;

const { values: args } = parseArgs({
  options: {
    task: { type: "string" },
    layout: { type: "string", default: "c" },
    workflow: { type: "string", default: "direct" },
    feedback: { type: "string", default: "off" },
    repeat: { type: "string", default: "1" },
    model: { type: "string" },
    gate: { type: "string", default: "auto" },
    keep: { type: "boolean", default: false },
    force: { type: "boolean", default: false },
    "no-agent": { type: "boolean", default: false },
    permissions: { type: "string", default: "scoped" },
  },
});

const runIdOf = (a) => `${a.task}-${a.layout}-${a.workflow}-${a.feedback}-r${a.repeat}`;

const task = JSON.parse(readFileSync(join(LAB, "tasks", args.task, "task.json"), "utf8"));
const runId = runIdOf(args);
const outDir = join(LAB, "results", "runs", runId);
if (existsSync(join(outDir, "result.json")) && !args.force) {
  console.log(`skip ${runId}: result exists (use --force)`);
  process.exit(0);
}
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const ws = join(tmpdir(), "agentic-lab", runId);
const log = (msg) => {
  console.log(`[${runId}] ${msg}`);
  appendFileSync(join(outDir, "run.log"), `${new Date().toISOString()} ${msg}\n`);
};

// ---------- 1. Workspace ----------
function buildWorkspace() {
  rmSync(ws, { recursive: true, force: true });
  mkdirSync(ws, { recursive: true });
  const skip = (src) => !/[/\\](node_modules|\.git)([/\\]|$)/.test(src);
  cpSync(join(LAB, "fixture"), ws, { recursive: true, filter: skip });
  cpSync(join(LAB, "variants/_shared"), ws, { recursive: true });
  cpSync(join(LAB, `variants/layout-${args.layout}`), ws, { recursive: true });
  if (args.workflow === "spec") {
    cpSync(join(LAB, "variants/workflow"), ws, {
      recursive: true,
      filter: (s) => !s.endsWith("AGENTS.append.md"),
    });
    appendFileSync(join(ws, "AGENTS.md"), readFileSync(join(LAB, "variants/workflow/AGENTS.append.md"), "utf8"));
  }
  if (args.feedback === "on") cpSync(join(LAB, "variants/feedback"), ws, { recursive: true });
  const sh = (cmd) => execSync(cmd, { cwd: ws, stdio: "pipe", encoding: "utf8" });
  sh("pnpm install --offline --frozen-lockfile");
  sh("git init -q -b main && git add -A && git -c user.name=lab -c user.email=lab@example.test commit -qm baseline && git tag baseline");
}

// ---------- 2. Agent ----------
// Drop the variables of a parent Claude Code session (desktop app, IDE) so that the run is a
// plain CLI session. Keep the credentials a person sets on purpose.
const KEEP = new Set(["CLAUDE_CODE_OAUTH_TOKEN", "ANTHROPIC_API_KEY"]);
function cleanEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (KEEP.has(key)) continue;
    if (key === "CLAUDECODE" || key.startsWith("CLAUDE_CODE_") || key.startsWith("CLAUDE_AGENT_SDK")) delete env[key];
  }
  if (!process.env.LAB_KEEP_BASE_URL) delete env.ANTHROPIC_BASE_URL;
  return env;
}

// "scoped" (default): edits are accepted; shell use is limited to the commands a developer needs
// in this repository. "bypass": no permission checks; use it only in a sandbox.
const SCOPED_TOOLS = [
  "Read", "Edit", "Write", "Glob", "Grep", "Task", "Skill", "TodoWrite",
  "Bash(pnpm:*)", "Bash(npx:*)", "Bash(node:*)", "Bash(git status:*)", "Bash(git diff:*)", "Bash(git log:*)",
  "Bash(git add:*)", "Bash(git commit:*)", "Bash(ls:*)", "Bash(cat:*)", "Bash(head:*)", "Bash(tail:*)",
  "Bash(grep:*)", "Bash(rg:*)", "Bash(find:*)", "Bash(wc:*)", "Bash(mkdir:*)", "Bash(cp:*)", "Bash(mv:*)",
  "Bash(sed -n:*)", "Bash(echo:*)", "Bash(pwd)", "Bash(date:*)", "Bash(tsc:*)",
];
function permissionArgs() {
  if (args.permissions === "bypass") return ["--permission-mode", "bypassPermissions"];
  return ["--permission-mode", "dontAsk", "--allowedTools", ...SCOPED_TOOLS];
}

function runClaude(phase, prompt) {
  const cliArgs = [
    "-p",
    prompt,
    "--output-format",
    "stream-json",
    "--verbose",
    "--setting-sources",
    "project",
    "--strict-mcp-config",
    "--mcp-config",
    '{"mcpServers":{}}',
    ...permissionArgs(),
    "--max-budget-usd",
    String(task.budgetUsd ?? 5),
    "--no-session-persistence",
  ];
  if (args.model) cliArgs.push("--model", args.model);
  const transcript = join(outDir, `transcript-${phase}.jsonl`);
  log(`phase ${phase}: claude -p (budget $${task.budgetUsd ?? 5})`);
  return new Promise((done) => {
    const child = spawn("claude", cliArgs, { cwd: ws, env: cleanEnv(), stdio: ["ignore", "pipe", "pipe"] });
    const file = createWriteStream(transcript);
    child.stdout.pipe(file);
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d;
    });
    const timer = setTimeout(() => {
      log(`phase ${phase}: timeout, killing`);
      child.kill("SIGTERM");
    }, RUN_TIMEOUT_MS);
    child.on("close", (code) => {
      clearTimeout(timer);
      file.end(() => done({ phase, code, stderr: stderr.slice(-2000), ...parseTranscript(transcript) }));
    });
  });
}

function parseTranscript(path) {
  const events = readFileSync(path, "utf8")
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
  const init = events.find((e) => e.type === "system" && e.subtype === "init") ?? {};
  const result = events.findLast((e) => e.type === "result") ?? {};
  const toolCalls = {};
  const filesRead = new Set();
  for (const e of events) {
    if (e.type !== "assistant") continue;
    for (const part of e.message?.content ?? []) {
      if (part.type !== "tool_use") continue;
      toolCalls[part.name] = (toolCalls[part.name] ?? 0) + 1;
      const p = part.input?.file_path;
      if (part.name === "Read" && p) filesRead.add(p.startsWith(ws) ? p.slice(ws.length + 1) : p);
    }
  }
  const docsRead = [...filesRead].filter((f) => f.endsWith(".md"));
  return {
    env: {
      model: init.model,
      claudeCodeVersion: init.claude_code_version,
      tools: init.tools?.length,
      mcpServers: init.mcp_servers,
      slashCommands: init.slash_commands,
      skills: init.skills,
      plugins: init.plugins,
      agents: init.agents,
      permissionMode: init.permissionMode,
    },
    outcome: result.subtype,
    isError: result.is_error ?? true,
    costUsd: result.total_cost_usd ?? 0,
    durationMs: result.duration_ms ?? 0,
    turns: result.num_turns ?? 0,
    usage: result.usage ?? {},
    finalText: typeof result.result === "string" ? result.result.slice(-3000) : "",
    toolCalls,
    docsRead,
    filesReadCount: filesRead.size,
  };
}

async function gate() {
  const key = task.storyKey ?? task.id;
  const dir = join(ws, "docs/specs", key);
  if (!existsSync(join(dir, "spec.md"))) {
    log("gate: no spec written");
    return { gate: args.gate, specWritten: false, waitedMs: 0, editedByPerson: false };
  }
  cpSync(dir, join(outDir, "spec"), { recursive: true });
  const before = readFileSync(join(dir, "spec.md"), "utf8") + readFileSync(join(dir, "plan.md"), "utf8");
  const started = Date.now();
  if (args.gate === "manual") {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    await rl.question(`\nReview and edit ${dir}/spec.md and plan.md. Set Status to Approved. Press Enter to continue. `);
    rl.close();
  }
  const spec = readFileSync(join(dir, "spec.md"), "utf8");
  if (!/Status:\*\*\s*Approved/.test(spec)) {
    writeFileSync(join(dir, "spec.md"), spec.replace(/(Status:\*\*\s*)[^\n]*/, "$1Approved"));
  }
  const after = readFileSync(join(dir, "spec.md"), "utf8") + readFileSync(join(dir, "plan.md"), "utf8");
  return {
    gate: args.gate,
    specWritten: true,
    waitedMs: Date.now() - started,
    editedByPerson: args.gate === "manual" && before.replace(/Status[^\n]*/, "") !== after.replace(/Status[^\n]*/, ""),
  };
}

// ---------- 3. Grading ----------
function run(cmd, cwd = ws) {
  try {
    return { pass: true, output: execSync(cmd, { cwd, stdio: "pipe", encoding: "utf8", timeout: 300_000 }) };
  } catch (e) {
    return { pass: false, output: `${e.stdout ?? ""}\n${e.stderr ?? ""}` };
  }
}

function grade() {
  const checks = {};
  let checkLog = "";
  for (const name of ["typecheck", "lint", "test", "arch", "pii"]) {
    const r = run(`pnpm -s ${name}`);
    checks[name] = r.pass;
    checkLog += `\n===== ${name}: ${r.pass ? "pass" : "FAIL"} =====\n${r.output.slice(-6000)}`;
    if (name === "arch") checks.archViolations = r.pass ? 0 : Number(r.output.match(/(\d+) dependency violations/)?.[1] ?? 1);
    if (name === "pii") checks.piiErrors = r.pass ? 0 : Number(r.output.match(/failed \((\d+)\)/)?.[1] ?? 1);
  }
  checks.all = ["typecheck", "lint", "test", "arch", "pii"].every((n) => checks[n]);
  if (task.requiredAc?.length) {
    const r = run(`pnpm -s trace --require ${task.requiredAc.join(",")}`);
    checks.trace = r.pass;
    checkLog += `\n===== trace: ${r.pass ? "pass" : "FAIL"} =====\n${r.output}`;
  }
  writeFileSync(join(outDir, "check.log"), checkLog);

  // Diff before the grader files are copied in.
  execSync("git add -A", { cwd: ws });
  const changed = execSync("git diff --cached baseline --name-only", { cwd: ws, encoding: "utf8" }).split("\n").filter(Boolean);
  writeFileSync(join(outDir, "diff.patch"), execSync("git diff --cached baseline", { cwd: ws, encoding: "utf8", maxBuffer: 64 << 20 }));
  const docsChanged = changed.filter((f) => f.endsWith(".md") && !f.startsWith("docs/specs/"));

  const graderSrc = join(LAB, "tasks", args.task, "grader");
  const grader = { hard: [], soft: [] };
  cpSync(graderSrc, join(ws, "grader"), { recursive: true });
  if (readdirSync(graderSrc).some((f) => f.endsWith(".test.ts"))) {
    cpSync(join(LAB, "tasks/vitest.grader.config.ts"), join(ws, "grader/vitest.config.ts"));
    run("pnpm exec vitest run --config grader/vitest.config.ts --reporter=json --outputFile=grader/out.json");
    try {
      const out = JSON.parse(readFileSync(join(ws, "grader/out.json"), "utf8"));
      for (const file of out.testResults ?? []) {
        for (const t of file.assertionResults ?? []) {
          const kind = t.ancestorTitles?.[0] === "soft" ? "soft" : "hard";
          grader[kind].push({ name: t.title, pass: t.status === "passed", detail: (t.failureMessages ?? []).join("\n").slice(0, 400) });
        }
        if (file.status === "failed" && !(file.assertionResults ?? []).length) {
          grader.hard.push({ name: "grader file loads", pass: false, detail: String(file.message).slice(0, 400) });
        }
      }
    } catch (e) {
      grader.hard.push({ name: "grader ran", pass: false, detail: String(e).slice(0, 400) });
    }
  }
  if (existsSync(join(graderSrc, "check.mjs"))) {
    const r = run(`node grader/check.mjs "${ws}"`);
    try {
      const out = JSON.parse(r.output.trim().split("\n").at(-1));
      grader.hard.push(...out.hard);
      grader.soft.push(...out.soft);
    } catch {
      grader.hard.push({ name: "check.mjs ran", pass: false, detail: r.output.slice(0, 400) });
    }
  }
  const hardPass = grader.hard.length > 0 && grader.hard.every((t) => t.pass);
  return { checks, grader, hardPass, changed, docsChanged };
}

// ---------- Main ----------
const started = Date.now();
log(`build workspace ${ws}`);
buildWorkspace();

const phases = [];
let gateInfo = null;
if (args["no-agent"]) {
  log("no agent: grading the untouched workspace");
} else if (args.workflow === "spec") {
  const key = task.storyKey ?? task.id;
  phases.push(await runClaude("spec", `Use the story-to-spec skill for this story. The story key is ${key}.\n\n${task.prompt}`));
  gateInfo = await gate();
  phases.push(await runClaude("implement", `The spec and the plan in docs/specs/${key}/ are approved. Use the implement-plan skill to implement them.`));
} else {
  phases.push(await runClaude("main", task.prompt));
}

// A phase that never reached the model (not signed in, network, budget 0) is not a result.
const broken = phases.find((p) => p.turns <= 1 && p.costUsd === 0);
if (broken) {
  log(`INVALID: phase ${broken.phase} did not reach the model: ${broken.finalText.slice(0, 200)} ${broken.stderr.slice(0, 200)}`);
  if (!args.keep) rmSync(ws, { recursive: true, force: true });
  process.exit(2);
}

log("grade");
const graded = grade();
const sum = (k) => phases.reduce((n, p) => n + (p[k] ?? 0), 0);
const result = {
  runId,
  task: args.task,
  layout: args.layout,
  workflow: args.workflow,
  feedback: args.feedback,
  repeat: Number(args.repeat),
  model: phases[0]?.env.model,
  startedAt: new Date(started).toISOString(),
  wallMs: Date.now() - started,
  success: graded.checks.all && graded.hardPass && (graded.checks.trace ?? true),
  ...graded,
  gate: gateInfo,
  humanInterventions: gateInfo ? 1 : 0,
  costUsd: sum("costUsd"),
  agentMs: sum("durationMs"),
  turns: sum("turns"),
  phases: phases.map(({ env, ...rest }) => rest),
};
writeFileSync(join(outDir, "env.json"), JSON.stringify(phases[0]?.env ?? {}, null, 2));
writeFileSync(join(outDir, "result.json"), JSON.stringify(result, null, 2));
const rubric = readFileSync(join(LAB, "tasks", args.task, "rubric.md"), "utf8");
writeFileSync(
  join(outDir, "review.md"),
  `${rubric}\nReplace each [ ] with a score [0], [1] or [2]. Read diff.patch and the final message in result.json.\n\nReviewer:\nNotes:\n`,
);
if (!args.keep) rmSync(ws, { recursive: true, force: true });
log(`done: success=${result.success} hard=${graded.hardPass} checks=${graded.checks.all} cost=$${result.costUsd.toFixed(2)} turns=${result.turns}`);
