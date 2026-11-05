# AGB runs on claude-fable-5-1 (5 November 2026)

The first batch of experiment `AGB` (T1, T2, T3, T6 × layout agb × direct × 2) ran on `claude-fable-5-1`, because the CLI's default model had changed and the harness did not pin the model yet. Every other run in `results/runs/` is on `claude-opus-5-5`, so these eight are not comparable on cost and are kept here as a record. The batch was run again on `claude-opus-5-5`; those runs are in `results/runs/`.

| Run | Success | Hard | Soft | Cost | Turns |
|---|---|---|---|---|---|
| T1 r1 | yes | 4/4 | 1/1 | $1.72 | 28 |
| T1 r2 | yes | 4/4 | 1/1 | $2.51 | 52 |
| T2 r1 | yes | 3/3 | 2/2 | $2.29 | 54 |
| T2 r2 | yes | 3/3 | 2/2 | $2.45 | 53 |
| T3 r1 | yes | 3/3 | 0/2 | $1.89 | 36 |
| T3 r2 | yes | 3/3 | 0/2 | $1.46 | 40 |
| T6 r1 | yes | 5/5 | 2/3 | $1.81 | 41 |
| T6 r2 | yes | 5/5 | 3/3 | $2.00 | 43 |

In all eight runs the agent used nothing of AGB: no `agb` command, no call to the `ab-knowledge` MCP server, no `/agb-skills:*` command, no commit (so the pre-commit gate never ran). The first turn carried about 3,300 more cache-write tokens than the Opus runs of layout A; on Opus the difference between AGB and A is about 1,400 tokens ([agb-findings.md](../../agb-findings.md)).
