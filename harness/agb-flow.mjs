// The AGB workflow (proposals/agb-workflow-test.zh.md): AGB's own pipeline on one task.
// Stage sessions run AGB's slash commands; `agb run` does the coding; a fixed rule answers the
// question ledger between sessions; a watchdog stops the run above the cost cap. Delivery runs
// after grading and is not scored.
import { execFileSync, spawn } from "node:child_process";
import { cpSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const MAX_ANSWER_ROUNDS = 3;
const AGB_RUN_TIMEOUT_MS = 3 * 60 * 60 * 1000;
const WATCH_MS = 30_000;
// Files AGB adds to a repository: counted as "added artifacts", not as module documents.
const AGB_PATHS = /^(\.ab\/|_contracts\/|docs\/PRD|docs\/DESIGN\.md|docs\/prototype|docs\/deliverables\/|docs\/requests\/|UI_CONTRACT\.md|\.abrc\.json)/;

// The change request AGB's spec stage reads: tasks/<id>/request.md, or the task prompt without
// the two lines that address an agent ("Implement this Jira story", "ready for a pull request").
export function requestDoc(LAB, taskId, task) {
  const key = task.storyKey ?? task.id;
  const path = `docs/requests/${key}.md`;
  const own = join(LAB, "tasks", taskId, "request.md");
  if (existsSync(own)) return { path, text: readFileSync(own, "utf8") };
  const body = task.prompt
    .replace(/^Implement this Jira story\.\s*/, "")
    .replace(/\s*When you are done, the change must be ready for a pull request\.\s*$/, "")
    .trim();
  return { path, text: `# Change request ${key}\n\n${body}\n` };
}

const UNATTENDED =
  "\n\nThis session runs unattended: nobody can answer you while it runs, and there is no way to ask. " +
  "Write each question you would ask a person into .ab/questions.json in the shape the asking skill gives " +
  "(no answer, with `blocks`), finish what you can without the answer, commit as the stage says, and end the session. " +
  "A person answers the ledger between sessions.";

// The fixed answering rule of the lab (the same rule the v2.1 runs got from lab-approver).
const ANSWER =
  "/agb-skills:agb-questions --accept-recommended I am lab-approver, the person who answers, and these are my answers. " +
  "For a question without a recommendation, take the option that agrees with docs/conventions/ and the module AGENTS.md files; " +
  "where they say nothing, take the option the question proposes, or the most conservative one if it proposes none. " +
  'Secrets: this workspace needs no external secret; answer "not needed, use a fake value". ' +
  "Write each of these answers to .ab/questions.json now as final answers by lab-approver. " +
  "Leave the answers a machine gave (answeredBy ai:...) as they are. I give no further input in this session.";

const STAGES = (request) => [
  { name: "spec", cmd: `/agb-skills:agb-spec --accept-recommended The input document is the change request ${request}.`, out: ".ab/prd.json" },
  { name: "arch", cmd: "/agb-skills:agb-arch --accept-recommended", out: ".ab/arch.json" },
  { name: "tasks", cmd: "/agb-skills:agb-tasks", out: ".ab/tasks.json" },
  { name: "test-plan", cmd: "/agb-skills:agb-test-plan --accept-recommended", out: ".ab/test-plan.json" },
];

// Edits are accepted (AGB's executor uses acceptEdits too); the shell comes from AGB's own
// .claude/settings.local.json, which the session loads with --setting-sources project,local.
const PERM_ARGS = [
  "--permission-mode", "acceptEdits",
  "--disallowedTools", "AskUserQuestion",
  "--allowedTools", "Read", "Edit", "Write", "Glob", "Grep", "Task", "Skill", "TodoWrite", "mcp__ab-knowledge__*",
];

const readJson = (path, fallback) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
};

export async function agbWorkflow(ctx) {
  const { ws, outDir, log, runClaude, killGroup, cleanEnv, claudeBin, task, request, capUsd, phases } = ctx;
  const cfgDir = `${ws}.claude-config`;
  rmSync(cfgDir, { recursive: true, force: true });
  mkdirSync(cfgDir, { recursive: true });
  // A clean config directory: AGB's own sessions start `claude` without --setting-sources or
  // --strict-mcp-config, so the user's CLAUDE.md, plugins and MCP servers would reach them.
  const env = {
    ...cleanEnv(),
    CLAUDE_CONFIG_DIR: cfgDir,
    AB_USAGE_WAIT_MAX_H: "0",
    PATH: `${dirname(claudeBin)}:${process.env.PATH}`,
  };
  const ledger = () => readJson(join(ws, ".ab/questions.json"), {}).questions ?? [];
  const unanswered = (q) =>
    Array.isArray(q.blocks) && q.blocks.length > 0 && (q.answer == null || q.answer === "" || (q.provisional === true && !q.answeredBy));
  const open = () => ledger().filter(unanswered);
  const agbRunCost = () => readJson(join(ws, ".ab/run/state.json"), {}).costUsd ?? 0;

  const s = { rounds: 0, interventions: 0, answeredInRounds: [], stages: {}, agbRun: [], abort: null, maxAgbCost: 0 };
  let current = null;
  const spent = () => phases.reduce((n, p) => n + (p.costUsd ?? 0), 0) + s.maxAgbCost;
  const checkBudget = () => {
    s.maxAgbCost = Math.max(s.maxAgbCost, agbRunCost());
    if (!s.abort && spent() > capUsd) {
      s.abort = `over budget: $${spent().toFixed(2)} > $${capUsd}`;
      log(`watchdog: ${s.abort}; stopping`);
      if (current) killGroup(current);
    }
  };
  const watchdog = setInterval(checkBudget, WATCH_MS);
  const session = async (phase, prompt) => {
    const p = await runClaude(phase, prompt, {
      settingSources: "project,local",
      permArgs: PERM_ARGS,
      env,
      onSpawn: (c) => {
        current = c;
      },
    });
    current = null;
    phases.push(p);
    log(`phase ${phase}: ${p.outcome} $${p.costUsd.toFixed(2)} turns=${p.turns}`);
    checkBudget();
    return p;
  };

  // One answering round: the person answers the open questions by the fixed rule.
  const answerRound = async () => {
    if (s.rounds >= MAX_ANSWER_ROUNDS) return false;
    s.rounds++;
    const before = Object.fromEntries(ledger().map((q) => [q.id, JSON.stringify([q.answer, q.answeredBy])]));
    await session(`answers-${s.rounds}`, ANSWER);
    const changed = ledger().filter((q) => before[q.id] !== JSON.stringify([q.answer, q.answeredBy]) && q.answer != null);
    const byPerson = changed.filter((q) => q.via !== "accept-recommended");
    s.interventions += byPerson.length;
    s.answeredInRounds.push({ round: s.rounds, byRule: byPerson.map((q) => q.id), byRecommendation: changed.length - byPerson.length });
    return true;
  };

  try {
    // ---- Stages ----
    for (const st of STAGES(request)) {
      for (let attempt = 1; ; attempt++) {
        await session(attempt === 1 ? st.name : `${st.name}-${attempt}`, st.cmd + UNATTENDED);
        if (s.abort) throw new Error(s.abort);
        if (open().length && !(await answerRound())) throw new Error(`more than ${MAX_ANSWER_ROUNDS} answering rounds`);
        if (s.abort) throw new Error(s.abort);
        if (existsSync(join(ws, st.out))) break;
        if (attempt >= 2) throw new Error(`stage ${st.name} did not write ${st.out}`);
      }
      s.stages[st.name] = { done: true, commits: git(ws, ["log", "--oneline", "baseline..HEAD"]).split("\n").filter(Boolean).length };
    }

    // ---- Coding: agb run, in the foreground ----
    const dirty = git(ws, ["status", "--porcelain"]).trim();
    let runArgs = ["run", ...(dirty ? ["--allow-dirty"] : [])];
    if (dirty) s.dirtyBeforeRun = dirty.split("\n");
    for (;;) {
      const code = await agbRun(ws, runArgs, env, join(outDir, "agb-run.log"), log, (c) => {
        current = c;
      }, killGroup);
      current = null;
      s.maxAgbCost = Math.max(s.maxAgbCost, agbRunCost());
      const stop = readJson(join(ws, ".ab/run/stop.json"), null);
      s.agbRun.push({ args: runArgs, exitCode: code, state: stop?.state, reason: stop?.reason, owner: stop?.owner, detail: stop?.detail });
      if (s.abort) throw new Error(s.abort);
      if (stop?.state === "done") break;
      if (open().length && (await answerRound())) {
        runArgs = ["run", "--resume"];
        continue;
      }
      throw new Error(`agb run stopped: ${stop?.reason ?? `exit ${code}`} (owner ${stop?.owner ?? "?"})`);
    }
  } catch (e) {
    s.failure = String(e.message ?? e);
    log(`agb workflow stopped: ${s.failure}`);
  }

  // ---- After grading: AGB's own gates, delivery (not scored), evidence ----
  async function afterGrade(graded) {
    rmSync(join(ws, "grader"), { recursive: true, force: true });
    git(ws, ["reset", "-q"]);
    const gates = {};
    for (const [name, cmdArgs] of [["checkAll", ["check", "--all"]], ["build", ["build"]]]) {
      const r = sh(join(ws, ".ab/bin/agb"), cmdArgs, ws, env);
      writeFileSync(join(outDir, `agb-${name}.log`), r.output);
      // The verdict line: "✓ pass  hard=0 partial=10 info=7  (2091ms)".
      const verdict = r.output.replace(/\x1b\[[0-9;]*m/g, "").match(/hard=(\d+) partial=(\d+) info=(\d+)/);
      gates[name] = {
        exit: r.code,
        hard: verdict ? Number(verdict[1]) : null,
        partial: verdict ? Number(verdict[2]) : null,
        info: verdict ? Number(verdict[3]) : null,
      };
    }
    let delivery = null;
    if (!s.abort && !s.failure) {
      const before = phases.length;
      const p = await session("delivery", `/agb-skills:agb-delivery${UNATTENDED}`);
      const dir = join(ws, "docs/deliverables");
      delivery = {
        costUsd: phases.slice(before).reduce((n, x) => n + x.costUsd, 0),
        deliverables: existsSync(dir) ? readdirSync(dir) : [],
        finalText: p.finalText.slice(-1500),
      };
    }
    clearInterval(watchdog);
    s.maxAgbCost = Math.max(s.maxAgbCost, agbRunCost());
    const q = ledger();
    if (existsSync(join(ws, ".ab"))) {
      cpSync(join(ws, ".ab"), join(outDir, "ab"), { recursive: true, filter: (src) => !/[/\\](bin|node_modules)([/\\]|$)/.test(src) });
    }
    const scoredPhases = phases.filter((p) => p.phase !== "delivery");
    return {
      failure: s.failure ?? null,
      overBudget: Boolean(s.abort),
      stages: s.stages,
      agbRun: s.agbRun,
      dirtyBeforeRun: s.dirtyBeforeRun ?? [],
      answeringRounds: s.rounds,
      answeredInRounds: s.answeredInRounds,
      humanInterventions: s.interventions,
      questions: {
        total: q.length,
        byRecommendation: q.filter((x) => x.via === "accept-recommended").length,
        machineAdjudicated: q.filter((x) => /^ai:/i.test(x.answeredBy ?? "")).length,
        unanswered: q.filter(unanswered).length,
      },
      cost: {
        sessions: scoredPhases.reduce((n, p) => n + p.costUsd, 0),
        agbRun: s.maxAgbCost,
        delivery: delivery?.costUsd ?? 0,
      },
      addedArtifacts: graded.changed.filter((f) => AGB_PATHS.test(f)),
      gates,
      delivery,
    };
  }
  return { afterGrade, isAgbPath: (f) => AGB_PATHS.test(f) };
}

function git(cwd, argv) {
  try {
    return execFileSync("git", argv, { cwd, encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    return `${e.stdout ?? ""}`;
  }
}

function sh(cmd, argv, cwd, env) {
  try {
    return { code: 0, output: execFileSync(cmd, argv, { cwd, env, encoding: "utf8", stdio: "pipe", timeout: 30 * 60 * 1000, maxBuffer: 64 << 20 }) };
  } catch (e) {
    return { code: e.status ?? 1, output: `${e.stdout ?? ""}\n${e.stderr ?? ""}` };
  }
}

function agbRun(ws, runArgs, env, logFile, log, onSpawn, killGroup) {
  log(`agb ${runArgs.join(" ")}`);
  return new Promise((done) => {
    const child = spawn(join(ws, ".ab/bin/agb"), runArgs, { cwd: ws, env, stdio: ["ignore", "pipe", "pipe"], detached: true });
    onSpawn(child);
    const file = createWriteStream(logFile, { flags: "a" });
    child.stdout.pipe(file, { end: false });
    child.stderr.pipe(file, { end: false });
    const timer = setTimeout(() => {
      log("agb run: timeout, stopping");
      killGroup(child);
    }, AGB_RUN_TIMEOUT_MS);
    child.on("close", (code) => {
      clearTimeout(timer);
      file.end(() => done(code));
    });
  });
}
