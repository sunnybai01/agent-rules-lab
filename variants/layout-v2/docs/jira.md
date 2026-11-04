# Jira

All development is tracked in Jira. The board is the only status source (delivery plan section 1).

| | |
|---|---|
| Site | `57blocks.atlassian.net` |
| Project | `AN` (Anifit), team-managed |
| Board | [1144](https://57blocks.atlassian.net/jira/software/projects/AN/boards/1144/backlog) |
| Issue types | Epic, Story, Task, Bug, Subtask |
| Access for agents | The `atlassian` MCP server in `.mcp.json`. Each person signs in with their own Atlassian account: run `/mcp`, select `atlassian`, then authorize in the browser |

### Issue types

| Type | Use it for | Parent |
|---|---|---|
| Epic | One week of work, Monday to Friday. Name: `W<two-digit week> <short theme>`, for example `W01 Foundations` (AN-1). Set Start date and Due date to the Monday and the Friday | None |
| Story | One deliverable of the week. This includes technical work, for example CI, infrastructure or a plan | The Epic of the week |
| Task | Small work that is not a deliverable, for example a configuration change or a chore | The Epic of the week |
| Bug | A behavior that does not agree with the acceptance criterion or the design | The Epic of the week in which it is fixed |
| Subtask | One step of a Story, Task or Bug | Story, Task or Bug |

Work that is not done by Friday moves to the Epic of the next week.

### Fields

- **Summary.** Short, in English, in the imperative. A Story that covers acceptance criteria puts their IDs at the end, for example `Offer the allowed payment methods at checkout (A2-AC-006)`.
- **Parent.** Every Story, Task and Bug has the Epic of its week as parent.
- **Description.** Use the template below.
- **Labels.**
  - The release: `R0`, `R0.x`, `RC` or `R1`.
  - The module, for Stories, Tasks and Bugs in one module: `mod-identity`, `mod-commerce`, `mod-subscription`, `mod-commission`, `mod-journey`, `mod-content`, `mod-ai`, `mod-integration` or `mod-kernel` ([architecture section 4](architecture.md#4-modules)). Work across modules, such as CI or planning, has no module label.
  - The scope per module is tracked with the module label, not with the Epic. The project has no Fix Version or Component field at this time.
- **Story point estimate.** The team sets it in sprint planning. Do not set it unless asked.
- **Sprint, Assignee.** Do not set them unless asked.

### Description template

```markdown
## Context
Why this work is necessary. One to three sentences.

## Scope
- What is included.
- What is not included.

## Acceptance criteria
- A2-AC-006 (the ID only. `pnpm ids show A2-AC-006` prints the text).

## Sources
- Discovery item IDs, ADRs, design links.
```

A Story also lists its annex items and its inputs (definition of ready, delivery plan section 9). An Epic uses the sections Goal, Exit and Sources.

### Rules for agents

- Read before you write. Search with JQL for an issue that already exists before you create a new one.
- Before you create, change or transition more than one issue, show the list to the user and get approval.
- Do not delete issues. Do not change the status of an issue that another person owns, unless the user asks.
- Write in English.
- Name the issue key in the branch name and in the pull request title, for example branch `AN-123-paypal-checkout` and title `feat: pay an order with PayPal (AN-123)`.
