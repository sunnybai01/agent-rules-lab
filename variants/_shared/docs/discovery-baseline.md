# Discovery baseline for engineering

| | |
|---|---|
| Status | Current for Discovery package v0.1 |
| Date | 2 November 2026 |
| Source | `57blocks/provital-discovery`, `outputs/discovery/`, commit `733e97e` |

This document is the engineering digest of the Discovery package. It does not replace the package. Where this digest and the package differ, the package applies. Each statement names its item ID, so you can read the full text.

**Update rule.** When Provital signs version 1.0, or when a change request changes an item, update this file in the same week and note the change in the change log.

## 1. Status and dates

- Version 0.1 is the pre-read of 2 November 2026. The playback is on 4 November. Provital signs the normative sections of version 1.0 (DR section 9).
- The build starts on 2 November 2026 on version 0.1. It follows version 1.0 when that version changes a decision.

| Release | Date | Content |
|---|---|---|
| R0 | Early February 2027 | First build of the RC and R1 items whose inputs have arrived. Provital's acceptance test in February |
| R0.x | February to March 2027 | Fixes, and the items whose inputs arrived since |
| RC | 12 to 13 March 2027 | Release candidate of R1. Soft launch on production for a pilot group of at most 10 advisors. Decision lock |
| R1 | 1 April 2027 | Launch in Germany and Austria, in German and English. Cutover in the night from 31 March to 1 April, 00:00 to 05:00 German time |
| R1.x | After R1, no date | Functions marked R1.x |
| R2 | Date not known | NAV changes to Business Central with KatarGo. 57Blocks adds a Business Central adapter. Scoped separately |

## 2. Change rules that affect the code

These rules come from DR section 8. They decide how we design.

| Rule | What it means for engineering |
|---|---|
| **Structural change** = a change to the domain model, the system boundary or an interface. It goes through change control at any time | The data model (T3 section 4) and the payload contracts (T2) are the expensive parts. Review them with care before they are approved |
| **Setting** = the value of a business rule. It needs no release and no change request | Rule values live in data: a platform screen, or the rule-set file that 57Blocks loads. Never hard-code a value that a rule set lists (A1 to A6, section 5) |
| **New rule-set entry** (a new journey, a new calculator question) is not a setting | The engines must take new entries as data where the annex says so, but the entry itself is a decision |
| **Late input** moves only the function that needs it | Build every flow against a fake first. Make each function switchable per release |
| **RC is the decision lock**. Between RC and R1 only fixes ship | All R1 features are in the RC build. Plan the feature cut-off before RC |

## 3. The system boundary (DP1)

**The ERP runs** (DP1 section 3.1): customer and advisor master data; the assignment of a customer to an advisor and its protection; the advisor structure and its history; prices and campaigns; point values and point corrections; vouchers (a voucher is an ERP article with a negative price); shipping fees; payment collection, credit limits, direct debit, refund decisions; orders after the hand-off, fulfilment, returns; invoicing, accounting, VAT and the commission payout.

**The platform runs** (DP1 section 3.2): identity, consents, pets and consultations; the shop and the checkout, one main domain with a path per advisor; subscriptions and the card and PayPal charge at shipment; the advisor page and portal; journeys, tasks and leads; the commission calculation; content and media; the interfaces to the ticket tool and the e-mail marketing tool.

**Head office works in the ERP** (DP1 section 3.3), except in the head office portal (A4-C-020). Its screens: commission settings and the run review; subscription cases; the clarification queue; approval of defined self-service cases; moderation of advisor content; KPI and report screens; the content function. Its admin functions: the pilot switch, data-subject requests, staff roles.

**The order** belongs to the platform until the ERP accepts it. From then the ERP is its master (DP1 section 3.4, T1 section 2).

**Rule:** no interface writes to a master from another system. A change to ERP data goes to the ERP as a request (T2-C-003). The platform copy updates when the ERP returns the new value.

## 4. Architecture decisions in the package (T3)

| ID | Decision | Normative |
|---|---|---|
| T3-D-001 | Modular monolith: one application, one worker, built from one code base. Modules: commerce, subscription, commission, journey, content, identity, integration | No: 57Blocks may change it if the acceptance criteria and T4 hold |
| T3-D-002 | Commerce core built in house, TypeScript, server-side rendering front end, one repository | No |
| T3-D-003 | Background work in a worker: due-delivery run, commission run, journey triggers, outbox, copies, reconciliation | No |
| T3-D-004 | One PostgreSQL database, one object store, one queue. No second database for a module | No |
| T3-D-005 | Every module reaches the ERP only through the integration module and its port. The NAV and Business Central adapters implement the port | **Yes** |
| T3-D-006 | Provider-neutral: a container platform on any of the three major clouds; no managed service that only one cloud offers. External services are outside this rule | **Yes** |
| T3-D-007 | A read copy per shop domain, written by a schedule or an event, never by a user request | No |
| T3-D-008 | Server rendering for the shop and the advisor page; client rendering for the advisor portal and the head office portal | No |
| T3-D-009 | One person record with roles. Linked to the ERP customer number when the ERP creates one. A person keeps the customer role as an advisor | **Yes** |
| T3-D-010 | All AI calls through one gateway: prompt, limit, record and off switch per function | No |
| T3-D-013 | One brand, ANIfit. The data model carries a brand field | **Yes** |
| T3-D-014 | Germany and Austria. Several languages supported; R1 runs German and English | **Yes** |
| T3-O-001 | EU container platform, provider-neutral, in an account that can move to Provital's. **Provital names the cloud provider** | **Yes** |
| T3-O-002 | Login and staff sign-in use a standard protocol, so the component behind them stays replaceable. Staff sign in through the company directory | **Yes** |

**Platform-wide capabilities:** the pilot switch per advisor (T3-C-001, RC); the advisor's e-mail sending path (T3-C-002, R1); data-subject requests (T3-C-003, RC); page-variant readiness (T3-C-004, R1).

**Acceptance criteria:** T3-AC-001 (no direct ERP access), T3-AC-002 (one command on a clean environment; deployments keep the shop available), T3-AC-003 (one person record, at most one ERP customer number), T3-AC-004 (consent record fields), T3-AC-005 (no single-cloud managed service), T3-AC-006 (AI call record and off switch).

## 5. Integration facts (T2)

- **One interface design for both ERPs** (T2-D-001). NAV receives the part of the payload it can use.
- **No direct database access** (T2-D-002). The order hand-off starts on NAV's file import.
- **Every outbound message** is stored until the ERP confirms it (T2-D-005), carries a business key (T2-D-006), and is reconciled daily by count and total (T2-D-007).
- **One authenticated, encrypted connection** to the ERP. Every message is logged with personal data masked (T2-D-008).
- **Order number ranges** of the platform and the current shop cannot collide. NAV replaces an order with the same number, so a resend runs a pre-check first (T2-O-002).
- **The acceptance signal** is the order status read. The outbox keeps the order until it appears (T2-O-003).
- **Synchronous calls** exist only for the payment provider, the address validation, and the reads of payment options, vouchers (fallback) and order history (T2 section 4). Everything else is asynchronous.
- **Flows:** 9 outbound (T2-C-001 to -009), 15 inbound (T2-C-010 to -024), 8 external systems (T2-C-030 to -037).
- **NAV changes N-1 to N-12** each have a fallback (T2 section 3). The build must contain the fallbacks. A fallback still in use three months after R1 becomes a platform function through change control.

**Maximum age of a copy at the checkout** (T2 section 5):

| Copy | Maximum age | If older |
|---|---|---|
| Articles and stock | 1 hour | Sell; mark the availability as not current; record the version |
| Prices, campaigns | 1 hour | Sell at the last prices; the order records their version |
| Shipping fees | 1 day | The last fee set applies; the order records its version |
| Vouchers | 5 minutes, plus a live read | A voucher that cannot be confirmed is not accepted |
| Customer, assignment, payment options | 1 day | Payment options: only card and PayPal. Others: the last copy; the order records its age |

**During an ERP outage** the shop sells from the copies, and orders wait in the outbox. The outbox drains in order when the ERP returns.

**What we know about NAV today** (internal analysis, `internals/analyses/NAV_Order_Flat_File_Reconstructed_Example.md`): the current shop sends an order as a text file with one `KEY<TAB>value` pair per line, German decimal commas, through the NAV SOAP function `ProvideOrderData`. Several value lists and formats are still unknown. The contract (T2-AC-001) must close these gaps.

## 6. Data and migration (T1)

- **Migrated:** accounts (about 30,000 customers and 1,800 active advisors), consents with a legal classification, pets, advisor page settings, about 10,000 active subscriptions with their payment agreements, two years of commission history.
- **Not migrated:** past orders, invoices, payments and returns. The account reads three years from the ERP on demand (T1-O-001).
- **Passwords are not migrated.** Every customer sets a new password at the first login. A set-password e-mail goes to each migrated customer (T1-O-002).
- **Duplicates are reported, never merged** (T1-AC-004).
- **Provital's operator runs the loads on production personal data** with 57Blocks' scripts and runbook. 57Blocks reviews the reports without personal data (T1-O-006).
- **Run order:** two test migrations on the NAV test environment; the rehearsal on a production-like copy before RC; the pilot subset run on production before RC; the cutover as the second run of the runbook (T1 section 4).
- **Data feed for reports** with a pseudonymous customer key (T1 section 6, R1).

## 7. Non-functional numbers (T4 section 2)

| Topic | Value |
|---|---|
| Availability (hypercare target) | 99.5 % per month |
| Page response, 95th percentile | 1.5 s; 2.5 s on the mobile network profile |
| Checkout step, 95th percentile | 2.0 s |
| Reference load | 300 concurrent visitors; peaks of 1,500 for one hour |
| Volume | 24,000 to 30,000 orders a month; 10,000 active subscriptions; 1,800 active advisors; 30,000 customers |
| Due-delivery run | All due deliveries inside 60 minutes at twice today's volume |
| Commission run | Twice today's statements, not slower than NAV's run |
| Backup | Daily full backup; point-in-time recovery for 35 days |
| Recovery | RPO 15 minutes; RTO 4 hours; restore tests before RC, before the cutover, in the hypercare |
| Browsers | Current two versions of the major browsers; mobile from 360 px |
| Accessibility | WCAG 2.2 AA |
| Media pipeline | Image variants in 30 s; video variants in 5 minutes |
| E-mail | 95 % of the transactional e-mails handed to the delivery service in 60 s |

**Security and privacy controls** (T4 sections 3 and 4): current TLS and HSTS; encryption at rest including backups; secrets in a managed store; least privilege with logged support access; OWASP top ten; rate limits and bot protection on login, registration and checkout; a pen test before RC and a retest before the cutover; an audit log with two years of retention; EU hosting; masked logs; no card data on the platform; encrypted outbox payloads with deletion rules (T4-R-036); a cookie banner before any non-essential cookie.

**Operations** (T4 section 5): a dashboard per area (availability, response time, error rate, queue depth, copy age, last job run); alerts to an on-call rota; reviewed changes, automated tests, a staging run and a **blue-green release**; no release in the content freeze.

## 8. Facts per business area

| Area | Engineering facts |
|---|---|
| Payments (A2) | Card and iDEAL through Stripe; PayPal through Provital's own business account (A2-C-019). Existing PayPal billing agreements are reused (A2-P-001, T1-O-004). The platform charges card and PayPal for a subscription delivery when the ERP reports the shipment (A2-D-009). Direct debit and invoice stay in the ERP. The ERP sends the allowed methods per customer; without ERP data, card and PayPal apply (A2-D-007). New customers cannot pay by invoice (A2-D-010). The platform never stores card data (T4-R-037) |
| Identity (T3) | One person record with dated roles (T3-D-009). Staff sign in through the company directory; until access exists, named staff use a platform login (A4-P-004) |
| Shop and portal (A3) | One main domain with a path per advisor. Permanent redirects from the old advisor domains that Provital owns, from the redirect list, the current shop and the pilot address (A3-C-001). No native app. Five calculators at launch |
| Journeys (A4) | One trigger per journey in R1 (date, time before or after an event, amount threshold); no branching. 57Blocks sets up the journeys of the rule set (A4-O-001) |
| AI and content (A5) | AI gateway (A5-C-006) in R1. The provider runs in the EU or at a location that Provital approves; no training on platform data (A5-O-003). The content function and the media pipeline are built in; no external CMS (A5-C-015, A5-C-016, RC) |
| Design (A6) | Design tokens are data: a token change changes every screen without a code change (A6-AC-001). Component library at RC. WCAG 2.2 AA |
| Cutover (A7) | Pilot mode from RC: pilot advisors and their customers place one-off orders on the platform; their subscriptions move at the cutover (A7-D-003, A7-D-004). Rehearsal before RC (A7-D-002). No rollback after the go decision; the platform exports a complete activity log (A7 section 5). The current shop database becomes a read-only archive (A7-D-009) |
| External tools | E-mail marketing: Inxmail (decision log D58). Ticket tool: INEXSO (Discovery #191). Web analytics: open (Discovery #207) |

## 9. What changed since the internal architecture direction of 20 October

The internal note `internals/analyses/Architecture_Direction_InHouse_TanStack_Monorepo.md` is the starting point of the technical design. Later decisions change some of its points. The ADRs of this repo use the newer decisions.

| Topic | Direction note (20 October) | Now | Source |
|---|---|---|---|
| Advisor storefronts | Custom domain per advisor, through the edge provider's custom-hostname product | One main domain with a path per advisor; old domains redirect | D69, A3-C-001 |
| Identity | A separate identity pool for advisors | One person record with roles | T3-D-009 |
| Payment provider | Mollie or Adyen | Stripe for card and iDEAL; PayPal direct | D35, A2-C-019 |
| Voucher check | Last synced state only | 5-minute copy plus a live read at the checkout | T2-C-014 |
| ERP access | Only the worker talks to the ERP | Still true for writes. Three reads at the checkout are synchronous; see ADR-0006 | T2 section 4 |
| Deployment | One container image per app | T3 explains "one application image, one worker image". ADR-0003 chooses and records the difference | T3 section 3 |
| Commission | Not settled | Platform calculates from R1 in parallel with NAV; switch at the latest at R2 | DP1 section 4.2, A1-D-004 |
| Admin | A back office | The head office portal with a defined screen list, the content function and the admin functions | A4-C-020 |
| Hosting | AWS Frankfurt, managed Kubernetes | Still open: Provital names the cloud provider | T3-O-001, Discovery #123 |

## 10. Open items that block or shape engineering

| Discovery issue | Question | Affects |
|---|---|---|
| #123 | AWS or Azure | Staging and production; ADR-0008 |
| #122 | Where the source code lives long term | Repository and pipeline location |
| #121, #181 | Masked NAV test data, and access from outside the EU | All integration work |
| #120, #177 | NAV change capacity; NAV tables and schema | Contracts and NAV changes |
| #124 | Request-response order API or flat files until Business Central | NAV adapter; the package starts on the file import (T2-D-002) |
| #126 | The Business Central data set beyond NAV | Contract design (T2-D-001) |
| #19 | Reuse of the PayPal billing agreements (sandbox test not run yet) | Subscription charge at R1 |
| #164, #165 | How shop customers and advisors are linked in NAV | Identity link, migration |
| #132, #135 | SEPA mandate references; active subscription export | Subscription migration |
| #207 | Web analytics tool | R1 |

## Change log

| Version | Date | Change |
|---|---|---|
| 0.1 | 2 November 2026 | First version, from package v0.1 |
