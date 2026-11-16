# Writing

For every Markdown file, Jira text and code comment. Agents load these files into their context, so each word costs on every task.

## Style: ASD-STE100

- One topic per sentence. An instruction has at most 20 words, a description at most 25.
- Active voice. Use the imperative for an instruction.
- One word for one meaning.
- No filler: no "please", "note that", "in order to", "basically".

## Content

- Write each fact once, in the document that owns it ([document map](../README.md)). Elsewhere, link to it.
- Use a table for facts of the same shape. Use prose only for a reason.
- A living document holds no status, no date of change, no version history and no plan. Git and Jira hold them.
- Never repeat the code: no copy of a schema, field list or config. A document gives only what the code cannot show, such as a reason.

## Limits

A table cell counts as a sentence. Inline code counts as one word.

| Files | Words | Loaded |
|---|---|---|
| `AGENTS.md` | 600 | Every task |
| Module, package and app `AGENTS.md` | 350 | When an agent changes the module |
| `docs/agent/*.md` | 500 | Once per task |
| `docs/conventions/*.md` | 500 | When the task touches the topic |
| `docs/jira.md` | 750 | When an agent writes to Jira |
| ADR | 900 | When a change touches the decision |
| Any other file in `docs/` | 2500 | When a task needs it |

A file over its limit: delete repetition and details that another document owns. Split a file by module when a task needs only one part of it. Never delete a rule to fit. Only the tech lead changes a limit.
