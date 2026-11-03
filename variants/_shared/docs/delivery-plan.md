# Delivery plan: from setup to launch

| | |
|---|---|
| Status | Proposed. The tech lead accepts or changes it in week 0 |
| Date | 2 November 2026 |
| Covers | 2 November 2026 to 1 April 2027 |
| Based on | Discovery output package v0.1 (`57blocks/provital-discovery`, `outputs/discovery/`, commit `733e97e`) |

The Discovery package defines scope; [discovery-baseline.md](discovery-baseline.md) is its digest. [architecture.md](architecture.md) and [infrastructure.md](infrastructure.md) describe the target. [work-split.md](proposal/work-split.md) sets who does what.

This plan sets the schedule and the exit gates of the key milestones only. The package dates stay: R0 in early February, the RC window on 12 to 13 March, R1 on 1 April.

**Two RC dates.** The package RC (12 to 13 March) is the soft launch on production for the pilot group and the decision lock of the package (DR sections 2 and 8). This plan adds an internal lock before it: the RC build is cut on Fri 26 February, and from Mon 1 March only fixes go into it. The time from 1 to 12 March is for the penetration test, the pilot subset run and the production set-up of the pilot.

## 1. Team, sprints and tracking

| | |
|---|---|
| Team | Tech lead: Teki (about 50 % development). Engineers: Sunny, Ryan. Product manager: Steven (50 %, November). Designer: Xueyi. EU developer on site: Marko (data loads and their verification). DevOps and QA: to be named. Allocations and the staffing estimate: [work-split.md](proposal/work-split.md) |
| Sprints | Two weeks. Sprint 1 starts on Monday 2 November 2026 |
| Tracking | Jira project `AN`, [board 1144](https://57blocks.atlassian.net/jira/software/projects/AN/boards/1144/backlog). All development is tracked there |
| Rituals | Planning on the first Monday; review and retro on the last Friday; demo on the development environment |
| Shared window | 15:00 to 18:00 Chengdu (08:00 to 11:00 Germany) |
| Holidays, team | Chinese New Year: 5 to 13 February 2027. The team returns on 15 February |
| Holidays, Provital | Christmas and New Year: about 24 December 2026 to 6 January 2027. Easter: Good Friday 26 March, Easter Monday 29 March 2027 (public holidays in Germany and Austria) |

Jira holds one epic per week (`W01`, `W02`, …) and one story per deliverable. Each story and task carries the label of its module (`mod-<module>`, see [architecture section 4](architecture.md#4-modules)). Each story names the acceptance criterion IDs it covers. The board is the only status source.

## 2. Milestones and sprints

| Sprint | Dates | Milestone |
|---|---|---|
| S1 | 2 to 13 Nov 2026 | Setup (Fri 6 Nov); walking skeleton (Fri 13 Nov) |
| S2 | 16 to 27 Nov | Vertical slice (Fri 27 Nov); scope inventory with estimates per module (Fri 27 Nov) |
| S3 | 30 Nov to 11 Dec | Staging and the first NAV contract test (Fri 4 Dec) |
| S4 | 14 to 25 Dec | Staging on the target cloud (18 Dec); infrastructure code for the chosen cloud; **UAT scope draft agreed with Provital (Fri 18 Dec)** |
| S5 | 28 Dec to 8 Jan 2027 | New Year; reduced capacity. **UAT scope frozen (Fri 8 Jan)** |
| S6 | 11 to 22 Jan | Production account ready (15 Jan) |
| S7 | 25 Jan to 4 Feb | **UAT build (Tue 2 Feb)** |
| — | 5 to 13 Feb | Chinese New Year holiday |
| S8 | 15 to 26 Feb | Rehearsal on the production-like copy (22 to 26 Feb); RC build cut (Fri 26 Feb) |
| S9 | 1 to 12 Mar | **RC lock (Mon 1 Mar)**; penetration test on the RC build (1 to 5 Mar); pilot subset run on production; **soft launch for the pilot group (Fri 12 Mar)** |
| S10 | 15 to 26 Mar | Load test, cutover runbook walk-through and the second restore test; go/no-go before Easter (Thu 25 Mar) |
| S11 | 29 Mar to 9 Apr | **Cutover in the night from 31 March to 1 April**; hypercare starts. Easter Monday on 29 March |

The key milestones map to the package: the UAT build is R0, the soft launch is the package RC, and the launch is R1.

## 3. UAT build (Tue 2 Feb 2027)

Goal: hand the UAT version to Provital before the Chinese New Year holiday. The acceptance test in February is R0 in the package.

**Scope.** R0 holds the RC and R1 items whose inputs have arrived (DR section 2). The scope decision is therefore which module capabilities go into R0 and which move to R0.x because their input is late. It runs in three steps:

1. **27 November: scope inventory.** Every module with its annex capabilities, its inputs and an estimate.
2. **18 December: draft agreed with Provital**, before the Christmas break. By then the cloud, the NAV changes N-1 to N-12 and the company directory inputs are due, so the late inputs are known.
3. **8 January: scope frozen.** Only the inputs that changed over the holidays move a capability. After the freeze, S6 and S7 finish and stabilise the frozen scope. A capability that is not on track by 15 January moves to R0.x.

**Checklist.**

- [ ] UAT scope frozen on 8 January; the R0 and R0.x capabilities labelled in Jira.
- [ ] All UAT stories accepted on staging; no open blocker or critical defect.
- [ ] ERP integration on the NAV adapter or an approved fallback; the order hand-off contract approved and its contract tests pass.
- [ ] Payments in test mode: card and iDEAL through Stripe; PayPal in the sandbox.
- [ ] Identity and migration: login; set-password link for migrated accounts; staff sign-in through the company directory; masked NAV test data loaded.
- [ ] Content and design in German and English; pilot mode per advisor.
- [ ] UAT environment from a release tag; test accounts and an e-mail allowlist ready.
- [ ] Traceability report maps every acceptance criterion to its tests; UAT test scripts ready.
- [ ] Support rota and defect triage agreed for February.
- [ ] Build, release note and known-issues list handed to Provital.

Exit: Provital starts the acceptance test. Defects go to the Jira backlog and are triaged for R0.x.

## 4. RC build (cut Fri 26 Feb, locked Mon 1 Mar 2027)

Goal: cut the release candidate with every RC and R1 item, and run the rehearsal before it. From 1 March only fixes go into the candidate.

- [ ] UAT defects closed, or accepted in writing with a risk owner.
- [ ] Provital's sign-off for UAT, or a dated list of remaining items.
- [ ] DPIA signed before the rehearsal, the first load of production personal data (T4-R-030); the processing agreements in place.
- [ ] Pilot group and its roll-out steps named by Provital before the rehearsal (A7-D-003).
- [ ] Rehearsal of the whole runbook on the production-like copy with Provital's operator: migration, interface switch-on, reconciliation report, without an unexplained difference (A7-D-002, T1-AC-008). Its report reviewed without personal data.
- [ ] Restore test passed: RPO 15 minutes, RTO 4 hours; duration recorded.
- [ ] Blue-green release and rollback proven on staging; the content freeze window enforced by the pipeline.
- [ ] Contracts approved: ERP payloads, payments, e-mail service.
- [ ] Production account ready, EU only; access rules for staff outside the EU agreed.
- [ ] Decision lock: only fixes after 1 March; release notes drafted; the go/no-go owner named.

Exit: the RC build is cut and locked.

## 5. Soft launch for the pilot group (Fri 12 Mar 2027)

Goal: the package RC. The pilot group (at most 10 advisors) and their customers place one-off orders on production. Every pilot order reaches production NAV, or waits in the clarification queue with its reason (DR section 2, A7-D-003).

- [ ] Penetration test on the RC build done (1 to 5 March); no open high finding, or Provital's written decision to start pilot mode (T4-R-026, T4-O-003).
- [ ] RC deployed to production.
- [ ] Pilot subset run on production done by Provital's operator; its report approved (T1 section 3.1).
- [ ] Production NAV connection live; a pilot order handed off and accepted end to end.
- [ ] Live payment accounts: Stripe and PayPal.
- [ ] Pilot address, edge and TLS ready; sending domain ready for the set-password e-mails of the pilot customers.
- [ ] Monitoring, alerting and the on-call rota ready for production; enhanced care for the pilot period (A7 section 7).
- [ ] Pilot switch on for the named pilot advisors.
- [ ] RC accepted by Provital in the RC window (12 to 13 March).

Exit: pilot mode runs. From here to R1 only fixes ship.

## 6. Launch (Thu 1 Apr 2027)

Goal: cutover in the night from 31 March to 1 April; R1 is live.

- [ ] High findings of the penetration test fixed; the retest passed (T4-R-026).
- [ ] Load test passed on the production-like environment: 300 concurrent visitors, 1,500 for one hour.
- [ ] Second restore test passed.
- [ ] Cutover runbook walked through with Provital; owners, time slots and the rollback plan agreed. Easter: every Provital owner confirmed for 29 March to 1 April.
- [ ] Data migration runbook ready; Provital's operator runs the loads at cutover.
- [ ] Pilot switch ready to switch every advisor on.
- [ ] DNS and redirects ready: main domain, old advisor domains, pilot address; TTL lowered one week before.
- [ ] About 30,000 set-password e-mails staged and sent in batches.
- [ ] Monitoring, alerting, the on-call rota and the hypercare plan ready; status communication ready.
- [ ] Go/no-go decision with Provital by Thu 25 March, before Good Friday; a final check on 31 March; release notes published.

Exit: R1 is live on 1 April. Hypercare runs to mid-April. The third restore test runs in the hypercare.

## 7. Inputs that gate the milestones

| Input | Needed by | Fallback |
|---|---|---|
| Cloud provider and account (T3-O-001) | 27 Nov 2026 | Interim 57Blocks account; the move costs more each week |
| NAV test environment with the personal data masked by Provital, and the network path (T2-P-001, D107) | 23 Nov 2026 | Fake adapter and fixtures; NAV items at risk |
| Stripe and PayPal sandbox access (A2-P-001, A2-P-002) | 16 Nov 2026 | 57Blocks test accounts |
| NAV tables, schema and the changes N-1 to N-12 (T2-P-002, T2-P-003) | 4 and 18 Dec 2026 | A late input moves only the function that needs it; the fallbacks are in the build |
| Transactional e-mail provider (T2-C-036) | 11 Dec 2026 | Mailpit in development; RC e-mail at risk |
| Masked NAV test data (Discovery #121) | 18 Dec 2026 | Synthetic data only; contract tests on golden files; UAT on synthetic data |
| Company directory app registration and staff groups (A4-P-004) | 18 Dec 2026 | Named staff use a platform login |
| Address validation provider (T2-C-034) | 18 Dec 2026 | Checkout without address validation; the function moves to R0.x |
| AI provider approval (A5-O-003) | 18 Dec 2026 | The AI gateway runs on a fake provider; the AI functions move to the next release that has the approval |
| Sending domain: DNS records, then warm-up (T1-O-002) | 8 Jan 2027 | Set-password e-mails at risk of spam filters |
| Ticket tool API access (T2-C-032) | 8 Jan 2027 | Fake adapter; the function moves to R0.x |
| Main domain, DNS and edge account (A3-C-001) | 15 Jan 2027 | Pilot address at risk |
| Penetration test window (T4-O-003) | Booked by 15 Jan 2027, for 1 to 5 Mar | The soft launch needs Provital's written decision |
| Production-like copy for the rehearsal (T1-P-005) | 29 Jan 2027 | The rehearsal, the RC and the soft launch slip |
| DPIA signature (T4-R-030) | 19 Feb 2027 | The rehearsal cannot load personal data; the RC slips |
| Pilot group and its roll-out steps (T1-P-005, A7-D-003) | 19 Feb 2027 | The subset run and the soft launch slip |

## 8. Risks

| Risk | Effect | Response |
|---|---|---|
| NAV developer availability | The hand-off and the copies slip | Fake adapter and golden files from week 1; every fallback in the build; contracts early and in parts |
| Two to three engineers against the RC and R1 scope; the estimate in [work-split.md](proposal/work-split.md) section 6 shows about 1.3× the capacity | Scope or quality slips | Extra engineers, DevOps and QA as work-split.md recommends; scope inventory with estimates by 27 November; input-gated R0; vertical slices; scope frozen on 8 January; the tech lead cuts scope by the DR rules |
| Late inputs | Environments and contract tests late | Cloud-neutral code; interim account; a fake for every open input |
| Production data access from outside the EU | Debugging and data tasks blocked | Telemetry without personal data; deployments through Git; the EU developer on site (Marko) for the data loads and data tasks |
| Chinese New Year falls in the acceptance window | Little capacity at Provital and TSO-DATA; UAT fixes start only on 15 February | UAT build on 2 February; a support rota for the holiday |
| S8 holds UAT fixes, the rehearsal and the RC cut in two weeks | The rehearsal or the RC slips | Production-like copy, DPIA and pilot group before the team returns; the preprod environment ready by 5 February; R0.x items only if the rehearsal is on track |
| Pen test, fixes and the soft launch inside 1 to 12 March | An open high finding at the soft launch | Book the window early; fix high findings first; Provital decides in writing if a finding stays open (T4-O-003) |
| Easter falls in the cutover week | Provital, TSO-DATA or the operator not available | Go/no-go by 25 March; every owner in the runbook confirms 29 March to 1 April in writing |
| About 30,000 set-password e-mails and a login peak on launch day | Mails land in spam; rate limits hit real users | Sending domain from January; staged sending; a load test for the login |

## 9. Ways of working

- **Jira.** Project `AN`, board 1144. One epic per week; one sprint goal per sprint; one story per deliverable; a module label on each story and task; the acceptance criterion IDs in the story title.
- **Definition of ready.** The story names its annex items and criteria; its inputs exist or a fake replaces them; the screen design exists or the story says that the existing components apply.
- **Definition of done.** The tests name the criterion IDs; the personal data check passes; the telemetry exists; the change runs on the development environment; the docs are updated.
- **Branches.** Trunk-based; short-lived branches; squash merge; one review at least. A structural change needs an ADR first.
- **Commits.** Conventional Commits.
- **Demo.** Every second Friday on the development environment. Provital sees tagged builds on staging.
- **Language.** English. Documents follow ASD-STE100.

## 10. Repository settings

- Private repository `57blocks/provital-platform`, default branch `main`. Squash merge only; head branches deleted.
- One review per pull request. CODEOWNERS for `packages/erp-*`, payments, identity, database migrations and `infra/`.
- CI: install, type check, lint, unit and integration tests, build, architecture checks, secret scan, dependency audit.
- Environments `development`, `staging` and `production`; a named approver promotes to production.
- No production secrets in GitHub. Production secrets live in the cloud secret store.
- Branch protection: the current GitHub plan has no rulesets for private repositories. Until the plan changes, the team applies the review and the status checks by convention.

## Change log

| Version | Date | Change |
|---|---|---|
| 0.4 | 2 November 2026 | NAV test environment masked by Provital (D107); Team row with roles and allocations; EU developer for NAV test and data tasks; staffing risk points to work-split.md (estimate redone for AI-assisted development: about 1.3× the capacity) |
| 0.3 | 2 November 2026 | Soft launch for the pilot group (12 March) as its own milestone; rehearsal, DPIA and pilot group before the RC cut; pen test on the RC build from 1 to 5 March; UAT scope in three steps (inventory 27 Nov, draft 18 Dec, freeze 8 Jan); infrastructure code for the chosen cloud only; Christmas and Easter holidays; missing inputs added; designer added to the team |
| 0.2 | 2 November 2026 | Milestone plan to launch: team, sprints, Jira tracking, UAT/RC/launch checklists |
| 0.1 | 2 November 2026 | First version |
