import { getTableColumns, is, Table } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createApp } from "../apps/worker/src/index";
import { fixedClock, InMemoryEventBus } from "../packages/core/src/kernel";
import { dataMetaOf } from "../packages/core/src/kernel/data-meta";
import * as identitySchema from "../packages/core/src/identity/schema";

type Rec = Record<string, unknown>;
type Api = {
  recordConsent(i: Rec): Promise<Rec>;
  currentConsent(p: string, purpose: string): Promise<Rec | null>;
  consentHistory(p: string): Promise<Rec[]>;
};

async function setup() {
  const app = createApp({ clock: fixedClock("2027-01-05T08:00:00Z") });
  const person = await app.identity.registerPerson({ email: "c@example.test", givenName: "C", familyName: "S" });
  return { app, api: app.identity as unknown as Api, personId: person.id };
}

const input = (personId: string, granted: boolean) => ({
  personId,
  purpose: "marketing-email",
  textVersion: "2027-01",
  channel: "web",
  granted,
});

function consentTable() {
  return Object.values(identitySchema).find(
    (v) => is(v, Table) && Object.values(getTableColumns(v as Table)).some((c) => /purpose/.test(c.name)),
  ) as Table | undefined;
}

describe("hard", () => {
  it("records all fields of T3-AC-004", async () => {
    const { api, personId } = await setup();
    const rec = await api.recordConsent(input(personId, true));
    expect(rec).toMatchObject({ personId, purpose: "marketing-email", textVersion: "2027-01", channel: "web", granted: true });
    expect(Object.values(rec).some((v) => typeof v === "string" && v.startsWith("2027-01-05T08:00"))).toBe(true);
  });

  it("the current consent is the latest decision; history keeps all, oldest first", async () => {
    const { api, personId } = await setup();
    await api.recordConsent(input(personId, true));
    await api.recordConsent(input(personId, false));
    expect(await api.currentConsent(personId, "marketing-email")).toMatchObject({ granted: false });
    const history = await api.consentHistory(personId);
    expect(history.map((r) => r.granted)).toEqual([true, false]);
    expect(await api.currentConsent(personId, "other")).toBeNull();
  });

  it("fails for an unknown person", async () => {
    const { api } = await setup();
    await expect(api.recordConsent(input("no-such-person", true))).rejects.toThrow();
  });

  it("publishes an event for each consent change", async () => {
    const { app, api, personId } = await setup();
    const before = (app.bus as InMemoryEventBus).published.length;
    await api.recordConsent(input(personId, true));
    const events = (app.bus as InMemoryEventBus).published.slice(before);
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toMatch(/^identity\.consent/);
    expect(events[0]?.payload).toMatchObject({ personId });
  });

  it("a consent table exists in the identity schema with data metadata", () => {
    const table = consentTable();
    expect(table).toBeDefined();
    expect(table && dataMetaOf(table)).toBeDefined();
  });
});

describe("soft", () => {
  it("rejects an unknown channel", async () => {
    const { api, personId } = await setup();
    await expect(api.recordConsent({ ...input(personId, true), channel: "fax" })).rejects.toThrow();
  });

  it("the decision column is personal data (consent choices are personal data)", () => {
    const table = consentTable();
    const meta = table ? dataMetaOf(table) : undefined;
    const cols = table ? getTableColumns(table) : {};
    const key = Object.entries(cols).find(([k, c]) => /grant|decision|given/i.test(`${k} ${c.name}`))?.[0];
    expect(key && meta?.[key]).toMatchObject({ personal: true });
  });

  it("the event payload holds no e-mail or name", async () => {
    const { app, api, personId } = await setup();
    await api.recordConsent(input(personId, true));
    const last = (app.bus as InMemoryEventBus).published.at(-1);
    expect(JSON.stringify(last?.payload)).not.toMatch(/example\.test|"C"|"S"/);
  });
});
