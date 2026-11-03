# Provital platform

Engineering workspace for the Provital platform build. The documents in [`docs/`](docs/) are the proposed architecture, infrastructure and the delivery plan to launch.

| Document | Purpose |
|---|---|
| [Architecture](docs/architecture.md) | Target architecture: runtime units, modules, data, key flows and the rules CI checks |
| [Infrastructure](docs/infrastructure.md) | What the platform needs to run, the target topology, environments and cloud options |
| [Delivery plan](docs/delivery-plan.md) | Milestones to launch: team, two-week sprints, Jira tracking and the UAT, RC and launch checklists |
| [Discovery baseline](docs/discovery-baseline.md) | Engineering digest of the Discovery package v0.1, with the item IDs |

## Status

| | |
|---|---|
| Phase | Setup, week 0 |
| Date | 2 November 2026 |
| Source | Discovery package v0.1, `57blocks/provital-discovery`, `outputs/discovery/`, commit `733e97e` |
| Tracking | Jira project `AN`, [board 1144](https://57blocks.atlassian.net/jira/software/projects/AN/boards/1144/backlog) |
| Decisions | ADRs 0002 to 0014 are under review. The `docs/adr/` index is still to be added |

The documents are proposals. They become the baseline when the ADRs they cite are accepted.

## Repository conventions

- Trunk-based development on `main`. Short-lived branches, squash merge, one review at least (see [delivery plan section 8](docs/delivery-plan.md#8-ways-of-working)).
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`.
- A change to a module boundary, a contract, the data model or the technology needs an ADR first.
