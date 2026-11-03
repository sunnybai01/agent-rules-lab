# Open technical decisions

| | |
|---|---|
| Status | Proposed. The tech lead reviews it in sprint 1 |
| Date | 2 November 2026 |
| Based on | [architecture.md](architecture.md), [infrastructure.md](infrastructure.md), [delivery-plan.md](delivery-plan.md), Discovery package v0.1 (digest: [discovery-baseline.md](discovery-baseline.md)) |

[architecture.md](architecture.md) sets the shape of the platform: the runtime units, the modules, the data rules and the key flows. It does not yet set the detailed technical design that the team needs before it writes the code of each area. This document lists those open decisions. For each one it gives the question, the reason it matters, the options and a proposal.

A proposal here is not a decision. A decision is made when its ADR is accepted. A decision that changes the domain model, the system boundary or an interface is a structural change (DR section 8). It needs an ADR before the code.

## 1. How to read this document

- **ID.** `TD-nn`. The ID stays the same when the decision becomes an ADR. The ADR cites the TD ID.
- **Needed by.** The latest date on which the decision must be made, so that the delivery plan holds. The dates come from [delivery-plan.md](delivery-plan.md) section 2: setup (6 Nov), walking skeleton (13 Nov), vertical slice (27 Nov), staging (4 Dec), UAT scope draft (18 Dec), UAT scope frozen (8 Jan), production account (15 Jan). A decision is needed by the start of the sprint that builds it, so some dates are earlier than the milestone they serve.
- **Owner.** "TL" is the tech lead. "Team" is the engineer who owns the area. A decision that needs Provital says so.
- **Proposal.** The option that we recommend, and the reason. The ADR records the alternatives in full.

## 2. Gaps in the current documents

These gaps exist in the documents of this repository today. Close them first.

1. **The ADRs do not exist.** [architecture.md](architecture.md) cites ADR-0003, -0005, -0006, -0007, -0008, -0010, -0011, -0012 and -0014, but `docs/adr/` is empty. The numbers 0001, 0002, 0004, 0009 and 0013 are not assigned. Section 4 maps each cited ADR to the TD items that it must cover.
2. **The application framework is not named.** [architecture.md](architecture.md) says "server functions" and "server-rendered" but does not name the web framework, the UI library or the package manager. The internal direction note of 20 October chose TanStack Start. No document of this repo records that choice (TD-01).
3. **ADR-0014 covers three different topics**: languages, the design system and the path scheme. Split it (TD-30, TD-31, TD-28, TD-46).
4. **The module rule "a module never reads another module's tables"** has no answer for the screens that combine data from many modules: the advisor's customer view, the KPI screens, the field report (TD-07).
5. **The hosts of the portals are stated but not decided.** [architecture.md](architecture.md) section 3 puts `portal` and `head-office` on their own subdomains. The package fixes only the shop: one main domain with a path per advisor (A3-C-001). The portal host decides the session design (TD-11, TD-47).

## 3. Summary

| ID | Decision | Needed by | Owner | Blocks |
|---|---|---|---|---|
| **A. Foundation** | | | | |
| TD-01 | Web framework, UI library and runtime | 6 Nov | TL | Every app |
| TD-02 | Monorepo tooling, package manager, build and lint | 6 Nov | TL | CI, every package |
| TD-03 | Client-server API style for the client-rendered apps | 6 Nov | TL | `portal`, `head-office` |
| TD-04 | Test stack and test conventions | 6 Nov | TL | Definition of done |
| TD-05 | Configuration and secrets in the application | 13 Nov | TL | Every unit |
| **B. Data and modules** | | | | |
| TD-06 | Database conventions: schema, IDs, migrations, connection pooling | 13 Nov | TL | Every module |
| TD-07 | Cross-module reads and transactions | 13 Nov | TL | Portal views, KPI screens |
| TD-08 | Domain events, the outbox and pg-boss usage | 13 Nov | TL | All asynchronous work |
| TD-09 | Personal data metadata and field encryption | 27 Nov | TL | Schema CI check, outbox, DPIA |
| TD-10 | Settings, rule sets and feature switches | 27 Nov | TL | Commission, subscription, journeys, payment matrix |
| **C. Identity and access** | | | | |
| TD-11 | Identity component, sessions and cookie scope | 13 Nov | TL | Login, portal, head office |
| TD-12 | Authorisation model and staff roles | 27 Nov | TL | Portal, head office, support access |
| TD-13 | Migrated accounts and the set-password flow | 8 Jan | Team | Migration, launch-day login wave |
| TD-14 | Rate limits and bot protection | 8 Jan | Team | Login, registration, checkout |
| **D. ERP integration** | | | | |
| TD-15 | The ERP port: operations, contract format and versioning | 27 Nov | TL | Every ERP flow; NAV contract approval |
| TD-16 | The gateway's internal API and its security | 27 Nov | TL | Synchronous checkout reads |
| TD-17 | NAV transport: SOAP, the flat file and the inbound exports | 4 Dec | TL | Order hand-off, copies |
| TD-18 | Read copies: refresh, versions and staleness | 27 Nov | Team | Catalogue, checkout |
| TD-19 | Outbox delivery: ordering, retries, clarification queue, reconciliation | 4 Dec | Team | Order hand-off |
| **E. Commerce, payments, subscriptions** | | | | |
| TD-20 | Price, VAT and rounding calculation | 27 Nov | Team, Finance | Cart, order payload, NAV booking |
| TD-21 | Order numbers and the order state machine | 27 Nov | Team, NAV developer | Hand-off, pilot mode |
| TD-22 | Stripe integration: one-off and subscription charges | 4 Dec | Team | Checkout, subscription charge |
| TD-23 | PayPal integration and the migrated billing agreements | 18 Dec | Team | Subscription charge at R1 |
| TD-24 | Due-delivery run design | 18 Dec | Team | Subscriptions at R1 |
| **F. Commission, journeys, content** | | | | |
| TD-25 | Commission engine design | 18 Dec | Team | Parallel run at R1 |
| TD-26 | Journey engine and event catalogue | 18 Dec | Team | Journeys, tasks, leads |
| TD-27 | Content model, editor and preview | 4 Dec | Team | Content function (RC) |
| TD-48 | Product publication: draft, release and visibility | 4 Dec | Team; Provital marketing confirms | Catalogue, content function |
| TD-28 | URL and path scheme, pilot gate routing and redirects | 20 Nov | TL, design | Shop routing, SEO, cache |
| TD-46 | Language and country in the URL | 20 Nov | TL, design | Routing, SEO, cache, e-mail links |
| TD-47 | Hosts of the shop, the advisor portal and the head office portal | 13 Nov | TL | Session design (TD-11), edge, certificates |
| TD-29 | Media pipeline details and upload safety | 18 Dec | Team | Content, advisor page, returns |
| TD-30 | Languages: library, formats and content per language | 13 Nov | Team | Every screen |
| TD-31 | Design tokens and the component base | 13 Nov | Team, design | Every screen |
| **G. Shop delivery and external services** | | | | |
| TD-32 | Caching and rendering strategy of the shop | 4 Dec | TL | Response times, launch peak |
| TD-33 | Catalogue search | 18 Dec | Team | Catalogue |
| TD-34 | E-mail: provider adapter, templates, sending and bounces | 11 Dec | Team; Provital confirms the provider | Transactional e-mail (RC) |
| TD-35 | Documents: invoices, delivery notes, statements | 18 Dec | Team, NAV developer | Account, commission statement |
| TD-36 | Adapters for the other external services | 4 Dec | Team | Ticket tool, Inxmail, address check, carrier |
| TD-37 | Consent banner and web analytics | 18 Dec | Team; Provital names the tool | R1 analytics |
| TD-38 | AI gateway design | 18 Dec | Team; Provital approves the provider | AI functions (R1) |
| **H. Operations and delivery** | | | | |
| TD-39 | Telemetry: SDK, backend, error tracking, masking | 13 Nov | TL | Definition of done |
| TD-40 | Infrastructure code and Kubernetes packaging | 27 Nov | TL | Staging, both clouds |
| TD-41 | Release mechanics: blue-green, migrations, workers | 4 Dec | TL | Staging releases |
| TD-42 | Autoscaling and capacity | 15 Jan | TL | Load test |
| TD-43 | Audit log, data-subject requests and retention jobs | 8 Jan | Team | RC admin functions |
| TD-44 | Migration tooling | 4 Dec | Team | Test migrations, rehearsal |
| TD-45 | Cutover activity log and the reporting data feed | 8 Jan | Team | A7, T1 section 6 |

## 4. Mapping to the cited ADRs

| ADR cited in architecture.md | Covers | Status |
|---|---|---|
| ADR-0003 Runtime units | TD-01 in part, TD-41 (images per unit, the T3 "one image" difference) | Not written |
| ADR-0005 Drizzle and migrations | TD-06 | Not written |
| ADR-0006 Integration gateway | TD-15, TD-16 | Not written |
| ADR-0007 Identity | TD-11 | Not written; due 13 Nov |
| ADR-0008 Runtime and cloud | TD-40; the cloud choice is Provital's | Not written; cloud due 27 Nov |
| ADR-0010 Settings and rule sets | TD-10 | Not written |
| ADR-0011 Personal data | TD-09, TD-43 | Not written |
| ADR-0012 Telemetry | TD-39 | Not written |
| ADR-0014 Languages, design system, path scheme | Split into TD-30, TD-31, TD-28, TD-46 | Not written; path scheme due 20 Nov |
| ADR-0007 Identity, or a new ADR | TD-47 (hosts of the apps) | Not written; due 13 Nov with TD-11 |
| New | TD-01 to TD-04 (foundation) | Proposed ADR-0001 and ADR-0002 |

## 5. Decisions

### A. Foundation

#### TD-01 Web framework, UI library and runtime

- **Question.** Which framework builds `shop`, `portal` and `head-office`? Which Node.js version runs every unit?
- **Why it matters.** T3-D-008 needs server rendering for the shop and the advisor page, and client rendering for the two portals. The framework fixes routing, data loading, server functions and the build for three apps.
- **Options.** (a) TanStack Start 1.x with React, for all three apps. (b) Next.js (App Router). (c) TanStack Start for `shop`, a Vite single-page app with TanStack Router for the portals.
- **Proposal.** (a), as the direction note says. One framework, one set of patterns. TanStack Start renders on the server or on the client per route, so it covers T3-D-008. Its 1.0 is new: keep `packages/core` free of the framework (rule 3 of architecture.md section 4) and keep server functions thin. Node.js: the active LTS line at the start of the build; pin it in `.nvmrc`, the Dockerfiles and CI.
- **Also decide.** React version; the data-loading pattern (route loaders with TanStack Query); the form library (TanStack Form or React Hook Form) with Zod validation shared with the server.

#### TD-02 Monorepo tooling, package manager, build and lint

- **Question.** Which tools manage the workspace, the task graph and the code style?
- **Options.** pnpm workspaces with Turborepo or with Nx. Biome, or ESLint with Prettier.
- **Proposal.** pnpm (strict dependency isolation supports the module rules) with Turborepo for the task cache and "build what changed". Biome for format and lint, as `packages/config` already says. dependency-cruiser for the boundary rules. TypeScript project references with `strict` on.
- **Also decide.** Internal package build mode (source-only packages compiled by the app, or built packages); the remote cache for CI; the commit hook set.

#### TD-03 Client-server API style for the client-rendered apps

- **Question.** How do `portal` and `head-office` call the server?
- **Options.** (a) Framework server functions only. (b) tRPC. (c) REST with an OpenAPI document.
- **Proposal.** (a). Server functions are typed end to end and need no second router. Each server function only checks the session and the policy (TD-12), validates the input with Zod and calls an application service in `core`. No business logic in a server function. A public HTTP API is not in scope; payment and ERP webhooks are plain HTTP routes.
- **Also decide.** The error format that every server function returns; the naming rule; how a long action (a commission run) reports progress (polling of a job status).

#### TD-04 Test stack and test conventions

- **Question.** Which tools and which layers?
- **Proposal.** Vitest for unit and integration tests. Integration tests run on a real PostgreSQL (Testcontainers locally, a service container in CI), never on a mock database. Property tests (fast-check) for money, rounding, VAT and commission. Playwright with axe for end-to-end and accessibility tests (T4-R-012). k6 for the load test (T4-AC-001). Contract tests run the `erp-nav` adapter against golden files and against the NAV test environment (T2-AC-006).
- **Traceability.** Each test that proves an acceptance criterion carries its ID in the test name, for example `[A2-AC-001]`. `tools/traceability` reads these tags. Fix the tag format now.
- **Test data.** Synthetic only (`tools/seed`), with a fixed seed. No personal data.

#### TD-05 Configuration and secrets in the application

- **Question.** How does a unit read its configuration?
- **Proposal.** Environment variables only, validated with a Zod schema at start-up; a unit with an invalid configuration does not start. Secrets reach the pod as environment variables or files from External Secrets Operator. One config schema per unit in `server-kit`. No secret in a client bundle (bundle scan of architecture.md section 9).

### B. Data and modules

#### TD-06 Database conventions

- **Question.** Which conventions apply to every module schema?
- **Proposal.**
  - One PostgreSQL schema per module; one database role per runtime unit with the least privilege. `erp_copy` is writable only by the role of the worker and the gateway (T3-D-007).
  - UUIDv7 generated in the application. ERP keys in separate, indexed columns.
  - `created_at`, `updated_at` in UTC on every table; `brand` on the entities of T3-D-013.
  - Drizzle Kit generates SQL migrations; the team reviews the SQL. A lint step rejects a destructive step (drop, rename, type change, `NOT NULL` without a default) unless the pull request marks it as the contract step of an expand-contract change.
  - The PostgreSQL major version and the extensions (`pg_trgm`, `unaccent`, `pgcrypto`, `citext`) must exist on both Azure Flexible Server and Amazon RDS. Check this list before the first migration.
- **Open point: connection pooling.** Three to ten `shop` pods, the portals, the worker and the gateway can exceed the connection limit of a 4 vCPU server. pg-boss uses `LISTEN`, which a transaction-mode pooler does not support. Proposal: a small pool per pod, a PgBouncer in transaction mode for the web units, and direct connections for the worker and the gateway. Measure in the load test.

#### TD-07 Cross-module reads and transactions

- **Question.** How does a screen read data that several modules own? May one database transaction span two modules?
- **Why it matters.** The advisor's customer view (A3-C-016) needs identity, commerce, subscription and ERP copy data. The KPI screens (A3-C-022) and the field report (A3-C-020) need more. The module rule forbids reading another module's tables.
- **Options.** (a) The application layer calls the public query functions of each module and joins in memory. (b) A `reporting` read model that subscribes to events and owns denormalised tables. (c) Each module publishes SQL views in its own schema as part of its public API; other modules read only these views.
- **Proposal.** (a) for screens with small lists, (c) for KPI and report screens. A published view is part of the module's contract and the contract snapshot check covers it. (b) only if (c) is too slow in the load test.
- **Transactions.** Allow one transaction across modules only through a unit-of-work that the application service opens and passes to each module's command. Never inside a module call to another module. The rule "order placed and outbox message in one transaction" (architecture.md section 6.1) depends on this.

#### TD-08 Domain events, the outbox and pg-boss usage

- **Question.** How are events written, delivered and versioned?
- **Proposal.**
  - A module writes its event into an `events` outbox table in the same transaction as its state change. A relay publishes it to pg-boss. A direct `boss.send()` inside the business transaction is also possible because pg-boss stores its jobs in the same database; choose one pattern and use it everywhere.
  - Each event has a name, a version, a Zod schema, an ID and the business key. A consumer is idempotent: it stores the event IDs that it handled.
  - One pg-boss queue per consumer, not per event, so a slow consumer does not delay others. Separate queues for heavy work: media, commission run, due-delivery run.
  - Each queue sets its retry limit, backoff and dead-letter queue. A dead letter appears in the IT monitoring view (T2 section 6).
  - Schedules run as pg-boss cron schedules, so only one replica runs each schedule.
- **Also decide.** Which events form the event catalogue of A4-C-005 (TD-26); whether the ERP outbox (TD-19) is a separate table with its own retention (T4-R-036). Proposal: yes, separate.

#### TD-09 Personal data metadata and field encryption

- **Question.** How does a column carry its purpose, owner and retention? Which fields are encrypted in the application?
- **Proposal.**
  - A Drizzle column helper, for example `pii(column, { purpose, owner, retention, category })`. A script reads the schema and fails CI for a personal data column without metadata (architecture.md section 9). The same script writes the field list for the technical description of the processing (T4-P-001).
  - Application-level envelope encryption for the outbox payloads (T4-R-036) and for bank details until the ERP confirms (T4-R-037). The data key is encrypted by a key in the cloud key service (Azure Key Vault or AWS KMS) behind a small `crypto` port, like the storage port. The cloud key service is outside the T3-D-006 rule only if the port keeps it replaceable; record this in ADR-0011.
  - Masking in logs and traces at the logger (TD-39), not at the call site.
- **Also decide.** Whether data-subject deletion uses crypto-shredding for event payloads and the outbox, or a hard delete with a scan (TD-43).

#### TD-10 Settings, rule sets and feature switches

- **Question.** How are the rule sets of A1 to A6 stored, validated, released and read?
- **Why it matters.** DR section 8: a setting needs no release. A1-D-013 needs an effective date, few named roles and a second person who releases. A commission run uses one version (architecture.md section 6.4).
- **Proposal.**
  - One `kernel.rule_set` table: key, version, effective-from date, JSON body, status (draft, released), author, releaser, reason. A Zod schema per rule-set key validates the body. The same schema generates the edit form in the head office portal where a screen exists.
  - Four-eyes release as one generic `kernel` function; the commission settings and the pilot switch use it.
  - A rule-set file in the repository (YAML) for the sets that 57Blocks loads (journeys, calculators); a CLI job loads it into the same table. The file is not read at run time.
  - The services read the version in force for a date. Pods cache the value and drop the cache on a PostgreSQL `NOTIFY`.
  - Feature switches use the same table with a simple boolean body and a scope (global, per advisor for the pilot gate).
- **Also decide.** Which rule sets get a head office screen at RC and which are file-only until R1.x.

### C. Identity and access

#### TD-11 Identity component, sessions and cookie scope

- **Question.** A library in the application, or a separate identity server? How does one session cover `shop` and `portal`?
- **Drivers.** T3-O-002 (standard protocol, replaceable component); T3-D-009 (one person record with roles); staff sign-in through the company directory (OpenID Connect); a fallback platform login for named staff until access exists (A4-P-004); 30,000 set-password e-mails and a login wave on launch day.
- **Options.** (a) A library in the app (for example Better Auth) with the person table in `identity`. (b) A self-hosted identity server (Keycloak or Zitadel) with OpenID Connect to the apps. (c) A managed identity service (Entra External ID, Cognito): this conflicts with T3-D-006 and with the move of the account.
- **Proposal.** (a) for customers and advisors: fewer moving parts, the person record stays in our schema, and the password hash is a standard format (argon2id) that a later identity server can import. Staff sign in with OpenID Connect to the company directory through the same library. A second protocol endpoint is not needed at R1. Decide by 13 November (architecture.md section 11).
- **Cookie scope.** Depends on the host of the portal (TD-47). The `head-office` cookie is host-only in every option.
- **Also decide.** Session store (database table, with a short cache); session lifetime and idle timeout per role; a second factor for staff (from the directory) and for advisors (optional at R1?); e-mail address as the login name, and what happens when the current shop has two customers with the same e-mail address (ask for the count in the NAV extract).

#### TD-12 Authorisation model and staff roles

- **Question.** How is access checked in the code, and how does the data scope of an advisor work?
- **Proposal.**
  - Policy functions in `core`, one per action, called by every server function. Deny by default. A test lists every server function and fails if one has no policy.
  - Data scope as a query filter that the module applies: an advisor sees only the customers of the assignment copy and their own downline. PostgreSQL row-level security is not used at R1; it adds cost to every query and to the migrations.
  - Staff roles from directory groups, mapped to the staff-role rule set (A4-C-020, T4-R-023). The fallback staff login uses the same roles.
  - Support access to a customer record writes an audit entry with the reason (T4-R-023).
- **Also decide.** How the live sale on a tablet (A3-C-003, A3-C-018) proves the customer's approval: a login of the customer, a one-time code to the customer's e-mail, or a signature on the screen. This is a product decision with a security effect.

#### TD-13 Migrated accounts and the set-password flow

- **Question.** How does a migrated customer get into the account, and how do 30,000 e-mails go out without harm?
- **Proposal.** A migrated person has no password. The e-mail carries a single-use token with an expiry (stored as a hash). After the expiry the normal "forgot password" flow applies. Send in batches over several days, with the sending domain warmed up from January (infrastructure.md section 12). The login page handles "account exists, no password yet" with a clear message.
- **Also decide.** Token lifetime; the batch size and the order (pilot customers first); the login rate limits for the launch day (TD-14); what a customer sees if the e-mail address is shared (TD-11).

#### TD-14 Rate limits and bot protection

- **Question.** Where do rate limits run, and which challenge protects login, registration and checkout (T4-R-025)?
- **Options.** At the edge (WAF rules, a challenge such as Cloudflare Turnstile), in the application, or both.
- **Proposal.** Both. The edge takes the volume. The application keeps a per-account and per-IP counter for login and password reset in PostgreSQL (no Redis, T3-D-004). The challenge appears only after a signal, so the launch-day login wave meets no challenge without reason. Depends on the edge provider (Provital's approval under T4-R-032).

### D. ERP integration

#### TD-15 The ERP port: operations, contract format and versioning

- **Question.** What does the port look like, and in which format does Provital's NAV developer review and approve a contract (T2-AC-001)?
- **Proposal.**
  - The port is a TypeScript interface in `packages/erp-port`: one operation per flow of T2 section 4 (T2-C-001 to -024), each with a Zod schema for the request and the response, an error-code list and a retry rule.
  - The canonical payload is the full data set (T2-D-001). The NAV adapter maps it and drops what NAV cannot use. Each adapter states the fields it drops; the contract test checks it.
  - From the Zod schemas generate a readable contract document (Markdown and JSON Schema) for the NAV developer and later for TSO-DATA. The approved version is stored in `docs/contracts/` with its approval date.
  - Contract versions: semantic versions per operation. A breaking change is a structural change (DR section 8).
- **Also decide.** Whether the port is sync (`Promise`) for every operation and the worker makes it asynchronous, or whether the port models "send" and "read status" as separate operations (as T2-O-003 needs).

#### TD-16 The gateway's internal API and its security

- **Question.** How do `shop` and `worker` call `integration-gateway`?
- **Proposal.** Internal HTTP with JSON, generated from the port operations, so the caller uses the same port interface with an HTTP adapter. Authentication by a service token per caller (or mTLS through the service mesh, if one is installed); a Kubernetes network policy allows only `shop` and `worker`. Timeouts: the checkout reads have a fixed budget inside the 2.0 s step target (T4-R-003); proposal 800 ms with no retry, then the fallback of T2 section 5. A circuit breaker opens after repeated failures so the checkout does not wait on a dead ERP.
- **Also decide.** The inbound path for the ERP exports (N-11): authentication (mTLS or a token, plus the IP allowlist), the maximum file size, and where the file lands (the object store, then a job).

#### TD-17 NAV transport: SOAP, the flat file and the inbound exports

- **Question.** How does the NAV adapter talk to NAV 2015?
- **What we know.** The current shop sends an order as a `KEY<TAB>value` text file with German decimal commas through the SOAP function `ProvideOrderData` (discovery-baseline.md section 5). Several value lists and formats are unknown. Discovery #124 asks whether a request-response API is possible before Business Central.
- **Decide.** The SOAP client (a maintained Node SOAP library or hand-written envelopes from the WSDL); NTLM or another authentication on the NAV web service; the character encoding of the flat file (check whether NAV expects Windows-1252); the export format of each read (CSV, XML, NAV XMLport) and its parser; how the adapter reads the order status (N-8, T2-O-003). Each choice waits on T2-P-001 and T2-P-002. Build against golden files from the analysis until the NAV test environment exists.

#### TD-18 Read copies: refresh, versions and staleness

- **Question.** How does a refresh write the copy, and how does an order record the version it used (T2-D-010)?
- **Proposal.**
  - Each refresh run gets a `sync_run` row: flow, start, end, count, source version, status. Every copy row carries the `sync_run` ID and the source change date (T2-D-009).
  - A full load writes into a staging table and swaps in one transaction, so the shop never reads half a load. A delta load upserts.
  - The order line stores the `sync_run` ID of the price, campaign and voucher it used. That ID is the "version" of T2-D-010; agree with the NAV developer whether NAV needs a value of its own (a price list code or a campaign number) instead.
  - A copy's age is `now - last successful run`. The staleness rules of T2 section 5 read it through one function. The alert of T4 section 5 uses the same function.
- **Also decide.** How a deleted record in the ERP shows in a delta (T2-O-007); the history of the structure copy for the commission (A1-C-012), which needs valid-from and valid-to, not only the current state.

#### TD-19 Outbox delivery: ordering, retries, clarification queue, reconciliation

- **Question.** In which order does the outbox send? What does a retry do?
- **Why it matters.** T2 section 5 says "the outbox drains in order". One global order makes one slow message block every order.
- **Proposal.** Order per business entity (per customer for orders and change requests), not global. A customer change request goes before that customer's next order. Retries with exponential backoff and a maximum count, set per flow in the contract (T2 section 6). After the last retry an order goes to the clarification queue with its reason; any other message goes to the IT monitoring view. A resend runs the NAV pre-check (N-8, T2-O-002) first. The daily reconciliation compares count and total per flow and writes a report row per difference (T2-D-007).
- **Also decide.** The clarification queue data model: reasons as a fixed list, actions (resend, cancel and refund, mark solved), and who may do each.

### E. Commerce, payments, subscriptions

#### TD-20 Price, VAT and rounding calculation

- **Question.** How does the cart compute the gross price, the VAT and the totals, so that NAV books the same values?
- **Why it matters.** The ERP delivers net prices per article, country and role (T2-C-013). The shop shows gross prices to consumers. N-2 makes NAV book the shop's values and flag a difference; without N-2 the fallback is a difference line (DP1 section 6). Each rounding difference becomes a flag or a line in NAV.
- **Decide with Finance and the NAV developer.** Rounding per line or per document; rounding of the unit price or of the line total; the order of discount, voucher, shipping fee and VAT; VAT on the shipping fee; the VAT rate per article and country (destination country for Austria); prices for advisors (net or gross display). Write the rules as pure functions with property tests and golden cases from real NAV invoices with fake customer data.

#### TD-21 Order numbers and the order state machine

- **Question.** What is the format of a platform order number, and which states does an order pass?
- **Proposal.** A PostgreSQL sequence with a prefix or a number range that the NAV developer confirms cannot collide with the current shop (T2-O-002, T2-AC-008). Check the maximum length of the NAV field. The number is assigned when the order is placed, not at the cart.
- **State machine.** Draft (cart) → placed → paid (or payment pending) → handed off → accepted (ERP master; read-only copy from here) → invoiced → shipped → returned. Side states: held (subscription), in clarification, cancelled. Write the machine as one module with explicit transitions and an audit entry per transition. Include the change window before the hand-off (A2-C-007): the hand-off of a one-off order waits until the window ends.

#### TD-22 Stripe integration: one-off and subscription charges

- **Question.** How do the checkout and the subscription charge use Stripe?
- **Proposal.**
  - One-off order: Payment Element with a PaymentIntent, captured at the checkout. Card and iDEAL. The order is placed when the webhook confirms, not on the client redirect (architecture.md section 6.1).
  - Subscription: save the payment method at the first checkout (`setup_future_usage: off_session`) or with a SetupIntent when the customer changes the method. At the shipment report (T2-C-021) the worker creates an off-session, merchant-initiated PaymentIntent for the reported amount (A2-D-009). A failed charge becomes an open item for the ERP (A2-C-023).
  - Card authorisation at the checkout for later capture is not used, because an authorisation expires before a late shipment.
  - Idempotency key per charge: delivery ID plus attempt. Webhook events stored by event ID.
- **Also decide.** The payment provider port, so PayPal and Stripe share one interface (T3 section 6: "a new payment provider is a new provider module"); the behaviour when the customer must authenticate again for an off-session charge (SCA): send a link, hold the next delivery, or create an open item.

#### TD-23 PayPal integration and the migrated billing agreements

- **Question.** Which PayPal API charges the migrated billing agreements, and which one creates new ones?
- **Why it matters.** About 10,000 active subscriptions move at the cutover, many with a PayPal billing agreement (T1-O-004, A2-P-001). Discovery #19: the sandbox test has not run yet.
- **Decide.** Whether the migrated agreements are charged by reference transactions on the existing agreement IDs, and whether new subscriptions use the same API or the current vault API (Orders v2 with a vaulted payment source). Two APIs in parallel may be needed until every old agreement ends. Run the sandbox spike before 18 December; the result decides the design of the PayPal adapter.

#### TD-24 Due-delivery run design

- **Question.** How does the run create every due delivery once, inside 60 minutes at twice today's volume (T4-R-006), also in the cutover night (A2-AC-003)?
- **Proposal.** The run selects due subscriptions per business day from the calendar of the subscription-deadlines rule set. It creates one pg-boss job per batch. Each delivery has a unique key (subscription ID plus delivery date) with a unique index, so a second run creates nothing twice. The run checks the payment method at the cutoff and holds a delivery with a reason (A2-C-023). A dry-run mode produces the simulated run on migrated data (A2-C-018, T1-AC-003).
- **Also decide.** The combining rule (A2-C-014); the cutoff time of day; holidays per country (Germany, Austria and the federal states, if the rule set needs them).

### F. Commission, journeys, content

#### TD-25 Commission engine design

- **Question.** How is the engine built so that it is exact, repeatable and fast enough?
- **Drivers.** A1-AC-001 to -009; the parallel run against NAV; recalculation of a past period with the structure in force at that time (A1-AC-003); twice today's statements not slower than NAV (T4-R-007); every parameter is a setting (A1-D-013).
- **Proposal.**
  - A pure calculation: input snapshot → result. The run first freezes its inputs (points, corrections, structure as of the period, assignment, invoice status, rule-set version) into run tables; then it calculates in memory; then it writes the statement lines. A repeated run on the same snapshot gives the same result (A1-AC-002).
  - The commission types of the handbook are code; their parameters are rule-set data (TD-10). A new type is a code change through change control (A1-C-027).
  - Decimal arithmetic for rates and points with one documented rounding rule per line type; money in minor units only at the statement line.
  - The NAV comparison (A1-C-018) imports NAV's result into its own table and compares per advisor and type.
- **Also decide.** The rounding rules with Finance; the tolerance of A1 section 5; whether the structure history from N-12 is enough for two years back (A1-D-016).

#### TD-26 Journey engine and event catalogue

- **Question.** How are the three trigger types of A4-O-001 evaluated?
- **Proposal.** Event-relative triggers and amount thresholds react to events from TD-08. Date triggers (birthday, anniversary, days since the last order) run as a daily scheduled scan. Each journey run per person is a row with a state, so a person never receives the same step twice. Every send checks the consent at send time (A4-AC-007), not at trigger time. Times use `Europe/Berlin`.
- **Also decide.** The event catalogue (A4-C-005) as a versioned list; frequency limits across journeys; the template engine (shared with TD-34).

#### TD-27 Content model, editor and preview

- **Question.** How are pages stored and edited (A5-C-015, A3-C-023)?
- **Options.** A block-based JSON document per page and language, edited in a custom block editor (for example on TipTap or Lexical), or a page builder library.
- **Proposal.** Block-based JSON with a Zod schema per block type and per page type. The editor shows only the blocks that the page type allows. Draft and released versions are rows; the preview renders the draft with the shop's components under a signed preview URL. Each block can carry a variant key, which gives the page-variant readiness of T3-C-004 without the A/B function.
- **Also decide.** Rich-text format inside a block; how product texts relate to ERP articles; how a release invalidates the edge cache (TD-32).

#### TD-48 Product publication: draft, release and visibility

- **Question.** Does a product have a draft state, a review and a release? When does a product show in the shop?
- **What the package already says.** The ERP is the master of the article: number, price, VAT rate, point value, stock (DP1 section 3.1, T2-C-013, T2-C-016). The platform never creates or changes an article. "Add a product" on the platform means: give an ERP article its shop content (texts, images, category, cross-selling). Product texts stay with Provital; an advisor cannot change them (A5 section 3). The content function has a draft and a released version, a language per market and a preview (A5-C-015). The health-claim check gives a hint, and a person can still release (A5-C-004, A5-AC-009). The package has no second-person review for product content; moderation applies to advisor content only.
- **Decide.**
  1. **Visibility rule.** Proposal: a product shows only if the ERP article is active and sellable for the country and role in the copy, **and** it has released content in the page's language. A new ERP article without released content stays hidden and appears on a "new articles without content" list in the head office portal.
  2. **Missing translation.** Hide the product on English pages, or show the German text. Provital decides; the default is to hide.
  3. **An article that ends or is blocked in the ERP** is hidden at the next copy refresh. Its content stays for a later return. Old product URLs redirect to the category.
  4. **Review before release.** Proposal: no separate workflow at R1. Two staff roles (content editor: saves drafts; content publisher: releases) from the staff-role rule set (TD-12). If Provital wants four eyes, it gives the two roles to different people. A real approval workflow is a new capability and goes through change control.
  5. **Scheduled release.** Release at a date and time, for campaigns. Proposal: yes, a small extension of the release step.
  6. **Categories.** Who owns the category tree and the assignment of an article to a category: the ERP (an export field) or the content function. Ask the NAV developer what NAV holds today.
- **Relation to TD-27.** A product page uses the same draft and release model as the other page types.

#### TD-28 URL and path scheme, pilot gate routing and redirects

- **Question.** How does the advisor path appear in the URL? How does the pilot gate send a non-pilot customer to the current shop? Where do the redirects run?
- **Decide.** The shape of the advisor segment and its place after the language segment of TD-46 (for example `/de/b/{advisor-slug}/…`); the slug rule and what happens when an advisor leaves; canonical and `hreflang` tags so that one product page under many advisor paths does not count as duplicate content; the sitemap (A3-C-001).
- **Redirects.** The old advisor domains that Provital owns and a redirect list (A3-C-001, A3-AC-003). Proposal: the redirect table lives in the platform database and the edge reads it as a generated rule list, or the edge sends unknown hosts to one `shop` route that answers with a 301. Decide with the edge provider.
- **Pilot gate.** The gate runs in `server-kit` on the advisor path, the login and the checkout (architecture.md section 6.5). Decide what a customer sees when the gate sends them to the current shop, and how the pilot address works until the cutover (A7-D-003). Due 20 November.

#### TD-46 Language and country in the URL

- **Question.** Does the URL carry the language in a path prefix, in a subdomain, or not at all (a cookie only)? Does it carry the country?
- **Drivers.** R1 runs German and English; a further language follows after R1 (T3-D-014). The country decides the price, the VAT and the payment methods (T3-D-014), so language and country are two separate values: an English-speaking customer in Austria exists. The advisor path is on the main domain (A3-C-001).
- **Options.**

| Option | Search engines | Edge cache | Other effects |
|---|---|---|---|
| (a) Cookie only, one URL for all languages | Only one language is indexed; no `hreflang` | The cache must vary on a cookie, or the page cannot be cached | A shared link opens in the reader's language, not the sender's |
| (b) Path prefix: `/de/…`, `/en/…` | Each language has its own URL; `hreflang` works | The URL is the cache key | One host, one certificate, one session cookie |
| (c) Subdomain: `en.…` | Works, but each host builds its own ranking | Per host | DNS, certificate and edge rules per language; the session cookie must cover several hosts; the advisor path repeats on every host |

- **Proposal.** (b), with a prefix for every language, also German. The root `/` and the old advisor domains redirect to `/de/…`, or to the language that the visitor chose before. A cookie only remembers that choice for the redirect; it never decides the language of a URL that has a prefix. A logged-in person's language (T3 section 4, Person) decides the language of e-mails and of links in e-mails.
- **Country.** Not in the URL at R1. The country comes from the delivery address in the checkout and the account, and from a country choice for an anonymous visitor. The price block is not in the cached HTML (TD-32), so the country choice does not split the cache. Ask Provital whether an Austrian domain exists and must serve Austrian visitors; that would make the country part of the host.
- **Also decide.** Whether a page without an English text shows in English at all (TD-48); the language switch on a page whose slug differs per language.

#### TD-47 Hosts of the shop, the advisor portal and the head office portal

- **Question.** Does the advisor portal run on the shop's host under a path, or on its own host?
- **Why it matters.** An advisor keeps the customer role (T3-D-009), so one person often uses the shop and the portal. The host decides how one login covers both (TD-11), the edge rules and the browser's security boundary.
- **Options.**

| Option | One login for shop and portal | Security boundary | Operations |
|---|---|---|---|
| (a) Same host, path prefix: `{main-domain}/portal/…`; the edge routes the prefix to the `portal` unit | Yes, a host-only cookie | Shop and portal are one origin: an XSS flaw in one reaches the other | One certificate; one edge routing rule |
| (b) Own subdomain, parent-domain session cookie | Yes | Two origins, but every subdomain of the parent domain receives the cookie | One more host; nothing else may run on that parent domain |
| (c) Own subdomain, own session, sign-on hop from the shop session | Yes, after a redirect | Two origins; two host-only cookies | A small sign-on flow in the identity component |

- **Proposal.** (a) for R1: it is the simplest one-login design and needs no cookie on the parent domain. A strict Content Security Policy on both apps reduces the XSS risk. The head office portal stays on its own host in every option: separate staff sessions, the extra edge access rule (infrastructure.md section 6). If Provital wants a separate address for advisors, choose (c), not (b).
- **Effect.** If (a) is accepted, [architecture.md](architecture.md) section 3 changes: `portal` is exposed under a path of the main domain.

#### TD-29 Media pipeline details and upload safety

- **Question.** Which formats, sizes and checks apply?
- **Decide.** Image variants (widths, AVIF and WebP with a JPEG fallback); video output (MP4 with H.264, or HLS); size and type limits per upload; a malware scan of every upload (customer return photos and advisor uploads, A2-C-009), for example ClamAV in the media worker; removal of image metadata (location data in photos); whether the AI photo check (A5-C-003) runs in the same job.

#### TD-30 Languages: library, formats and content per language

- **Question.** Which i18n library, and how is a missing translation handled?
- **Proposal.** A typed message library with compile-time keys (for example Paraglide or FormatJS); ICU message format; `Intl` for numbers, dates and currency. A CI check fails on a missing German or English key. Content and product texts per language live in `content` (T3-D-014). E-mail templates use the same catalogues.

#### TD-31 Design tokens and the component base

- **Question.** How do tokens become CSS, and which component base do we use?
- **Proposal.** Tokens as JSON (W3C design token format), built to CSS custom properties, loaded at run time so a token change needs no code change (A6-AC-001). Components on an accessible headless base (React Aria or Radix) in `packages/ui`, styled with the tokens. Decide whether to use Tailwind on top of the tokens. Storybook or Ladle for the review per component (A6-C-006).

### G. Shop delivery and external services

#### TD-32 Caching and rendering strategy of the shop

- **Question.** What does the edge cache, and for how long?
- **Why it matters.** 1.5 s at the 95th percentile with 1,500 concurrent visitors (T4-R-002, T4-R-004). Prices depend on role and country; the advisor path and the advertisement parameter (A5-C-005) change the page.
- **Proposal.** Cache anonymous catalogue and content pages at the edge with a short time to live and stale-while-revalidate. Keep price and stock for a logged-in person out of the cached HTML; load them through a small uncached request. Purge by tag when content is released or a copy refresh changes a price. Never cache a response that sets a cookie.
- **Also decide.** The cache key (path, language, country); how the advisor path is part of the key without one cache entry per advisor and product.

#### TD-33 Catalogue search

- **Proposal.** PostgreSQL full-text search with the German and English dictionaries, `unaccent` and `pg_trgm` for typing errors. The catalogue is small. No separate search service (T3-D-004).

#### TD-34 E-mail: provider adapter, templates, sending and bounces

- **Question.** How does the platform send and track e-mail (T2-C-036, A4-C-013, T3-C-002)?
- **Proposal.** An e-mail port with one adapter per provider; Mailpit locally. Templates in React Email or MJML, per language. Each send writes a send record; bounce and complaint webhooks update the customer profile and a suppression list. Advisor e-mails use the advisor's name as sender name and the advisor's address as reply-to (T3-C-002). The provider is open (architecture.md section 11, due 11 December); first check whether Provital's Inxmail contract covers transactional e-mail.
- **Also decide.** The sending sub-domains (transactional, advisor, marketing) so that one stream does not harm the reputation of another; the queue throughput limit for the set-password batches.

#### TD-35 Documents: invoices, delivery notes, statements

- **Question.** Where do the invoice and the delivery note in the account come from (A3-C-010)? How is the commission statement produced (A1-C-016)?
- **Decide.** Invoice and delivery note: read on demand from the ERP through the gateway as a file, or delivered by an export into the object store. Ask the NAV developer which exists. Statement: an HTML view in the portal and a PDF made by the worker (a headless browser or a PDF library). Proposal: one PDF renderer for all platform documents.

#### TD-36 Adapters for the other external services

- **Question.** Where do the adapters for the ticket tool (INEXSO), Inxmail, address validation and the carrier return service live?
- **Proposal.** One port per service in the module that needs it, with the adapters in a separate package, like the ERP. Outbound calls run in the worker, except the address check at the checkout (synchronous, with a short timeout; an outage does not block, T2-C-034). Each adapter has a fake for development and tests.
- **Open.** The address validation provider; the ticket tool API scope (A4-O-003); the carrier process (Discovery #205).

#### TD-37 Consent banner and web analytics

- **Question.** Own consent banner or a consent management product? Which analytics tool (Discovery #207)?
- **Proposal.** A small own banner from `packages/ui` that writes the consent record of T3-AC-004 and loads analytics scripts only after consent (T4-R-038). A product adds a processor and often processing outside the EU. The analytics tool is Provital's choice (A3-P-003); the integration loads it through one consent-gated loader.

#### TD-38 AI gateway design

- **Question.** How does the `ai` module call a model and meet T3-AC-006?
- **Proposal.** One provider port with an adapter per provider. Prompts are versioned rule-set entries. Each call writes a record: function, prompt version, model, tokens, cost, result status, latency. A cost limit per function and per advisor; an off switch per function (TD-10). Personal data minimised before the call (T4-R-035). The provider is open until Provital approves it (A5-O-003).

### H. Operations and delivery

#### TD-39 Telemetry: SDK, backend, error tracking, masking

- **Question.** Which logger, which backend, which error tracker?
- **Proposal.** OpenTelemetry Node SDK with automatic HTTP and PostgreSQL instrumentation; pino for structured logs with a redaction list built from the personal data metadata (TD-09). A log sample test proves the masking (T4-R-034, T4-AC-006). Backend: Grafana Cloud in an EU region or a self-hosted Grafana stack (Loki, Tempo, Mimir) in the cluster. Error tracking: Sentry in its EU region or self-hosted GlitchTip. On-call routing: decide the tool. One dashboard per T4 area; alerts per T4-AC-004.
- **Also decide.** Business metrics that IT needs: copy age per flow, outbox depth, clarification queue size, last run per schedule.

#### TD-40 Infrastructure code and Kubernetes packaging

- **Question.** Which tools build the cloud resources and package the units?
- **Proposal.** OpenTofu or Terraform (decide one) with one module set per cloud and a shared interface, state in the cloud's object store. Helm charts per unit, or one chart with values per unit; Argo CD application per environment. cert-manager and External DNS in the cluster. Decide the Gateway API controller (infrastructure.md section 3 names Envoy Gateway as an example).

#### TD-41 Release mechanics: blue-green, migrations, workers

- **Question.** How do Argo Rollouts, the database migration and the workers fit together?
- **Proposal.** The migration runs as a pre-sync job and is always an expand step (TD-06). The web units switch blue to green after the health checks. The worker and the gateway do not run blue-green: two versions would consume the same queues. They roll; every job payload carries a version and a new worker reads the previous version. A contract step runs in a later release, after no old version runs.
- **Also decide.** The image rule of ADR-0003 (one image per web app, one for worker and gateway, versus T3's "one application image"); the release window and the content freeze date window in the pipeline (T4 section 5).

#### TD-42 Autoscaling and capacity

- **Proposal.** Horizontal pod autoscaler on CPU and request latency for `shop`; KEDA with a PostgreSQL query on the pg-boss tables for the media queue and the due-delivery run. Load test with k6 at 300 and 1,500 concurrent visitors and the login wave, on the production-like environment, before the cutover (T4-AC-001). Set the starting values of infrastructure.md section 11 after the first test.

#### TD-43 Audit log, data-subject requests and retention jobs

- **Question.** How are T4-R-028, T3-C-003 and the retention rules implemented?
- **Proposal.** An append-only `kernel.audit` table; the application role has `INSERT` only. A retention job deletes entries older than two years. A data-subject request runs as a job that calls a deletion or export handler in each module (each module registers one); data under a legal retention is blocked, not deleted. The platform marks the ERP customer number so the next sync does not load the person again (T3-C-003). Backups expire after 35 days; record in the DPIA that a deleted person stays in backups until then.

#### TD-44 Migration tooling

- **Question.** How do the scripts of `tools/migrate` read the NAV and current-shop extracts, load them and report?
- **Proposal.** Each load is a command with the steps extract-file → validate → stage → load → reconcile. It is idempotent: a second run loads nothing twice (T1-AC-008). The report holds counts, totals and record IDs, never personal data (T1-O-006). Provital's operator runs it as a Kubernetes job from a tagged image. Duplicates are reported, not merged (T1-AC-004). The same tool runs the pilot subset and the cutover.
- **Also decide.** The input format of each extract (wait on T1 inputs); the delta load between the rehearsal and the cutover.

#### TD-45 Cutover activity log and the reporting data feed

- **Question.** How does the platform export "a complete activity log" (A7 section 5, A7-AC-003) and the data feed for reports with a pseudonymous customer key (T1 section 6)?
- **Proposal.** The activity log is built from the audit log and the domain events, exported as CSV or JSON Lines with a documented schema. The pseudonymous key is an HMAC of the customer ID with a secret key that only the platform holds. The feed goes to the object store on a schedule. Decide the format and the receiver with Provital.

## 6. Next steps

1. TL reviews this list in sprint 1 and assigns an owner per item.
2. Write ADR-0001 (TD-01 to TD-03) and ADR-0002 (TD-04, TD-06) by 6 November, so the walking skeleton starts on accepted decisions.
3. Write the ADRs that architecture.md cites in the order of the "Needed by" column.
4. Add the items that need Provital or the NAV developer (TD-17, TD-20, TD-21, TD-23, TD-35) to the questions for the next session, through the Discovery issue list.
5. When an ADR is accepted, mark its TD items here as decided, with the ADR number.

## Change log

| Version | Date | Change |
|---|---|---|
| 0.3 | 2 November 2026 | Needed-by dates follow delivery plan v0.3 (UAT scope frozen on 8 Jan) and the build sprint of each item: TD-13, TD-14, TD-43, TD-45 to 8 Jan; TD-24, TD-26, TD-37, TD-38 to 18 Dec; TD-36 to 4 Dec. TD-15 and TD-17 owned by the TL |
| 0.2 | 2 November 2026 | Added TD-46 (language and country in the URL), TD-47 (hosts of the apps), TD-48 (product publication). TD-11 and TD-28 point to them |
| 0.1 | 2 November 2026 | First version |
