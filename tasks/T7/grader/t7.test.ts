import { readdirSync } from "node:fs";
import { join } from "node:path";
import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createApp } from "../apps/worker/src/index";
import { persons } from "../packages/core/src/identity/schema";
import { tasks } from "../packages/core/src/journey/schema";

const T0 = "2027-01-05T08:00:00.000Z";
const T1 = "2027-01-06T09:30:00.000Z";
const T2 = "2027-01-09T11:00:00.000Z";

// The prompt fixes these names; the types of the untouched fixture do not have them yet.
type Journey = { completeTask(taskId: string): Promise<{ id: string; completedAt: string | null }> };
type Welcomed = { welcomedAt: string | null | undefined };

async function setup() {
  let now = T0;
  const app = createApp({ clock: { now: () => new Date(now) } });
  const person = await app.identity.registerPerson({ email: "w@example.test", givenName: "Wilma", familyName: "Welcome" });
  const journey = app.journey as unknown as Journey;
  const welcomedAt = async () => ((await app.identity.getPerson(person.id)) as unknown as Welcomed).welcomedAt;
  const task = (kind: string) => app.journey.createTask({ personId: person.id, kind, title: "t" });
  return { app, person, journey, welcomedAt, task, at: (iso: string) => void (now = iso) };
}
const iso = (value: string | null | undefined) => (value ? new Date(value).toISOString() : value);

describe("hard", () => {
  it("completeTask sets completedAt and returns the task", async () => {
    const s = await setup();
    const task = await s.task("follow-up");
    s.at(T1);
    const done = await s.journey.completeTask(task.id);
    expect(done.id).toBe(task.id);
    expect(iso(done.completedAt)).toBe(T1);
  });

  it("completeTask fails for an unknown task", async () => {
    const s = await setup();
    await expect(s.journey.completeTask("00000000-0000-7000-8000-000000000000")).rejects.toThrow();
  });

  it("welcomedAt is null at first", async () => {
    const s = await setup();
    expect(await s.welcomedAt()).toBeNull();
  });

  it("a completed welcome-call task sets welcomedAt to the time of the completion", async () => {
    const s = await setup();
    const task = await s.task("welcome-call");
    s.at(T1);
    await s.journey.completeTask(task.id);
    expect(iso(await s.welcomedAt())).toBe(T1);
  });

  it("a task of another kind does not change the person", async () => {
    const s = await setup();
    const task = await s.task("follow-up");
    s.at(T1);
    await s.journey.completeTask(task.id);
    expect(await s.welcomedAt()).toBeNull();
  });

  // The rule under test. With a bus that delivers nothing, a reaction through an event cannot reach
  // the person. If the person changes all the same, journey (or the composition root) called identity to write.
  it("the person changes through an event on the bus: with a silent bus the person stays as it was", async () => {
    const s = await setup();
    const task = await s.task("welcome-call");
    s.app.bus.publish = async () => {};
    s.at(T1);
    await s.journey.completeTask(task.id);
    expect(await s.welcomedAt()).toBeNull();
  });
});

describe("soft", () => {
  async function completed() {
    const s = await setup();
    const before = s.app.bus.published.length;
    const task = await s.task("welcome-call");
    s.at(T1);
    await s.journey.completeTask(task.id);
    return { s, events: s.app.bus.published.slice(before) };
  }

  it("the event is named journey.<past-tense>", async () => {
    const { events } = await completed();
    expect(events.some((e) => /^journey\.[a-z]+(-[a-z]+)*$/.test(e.type))).toBe(true);
  });

  it("the event holds IDs, not personal data", async () => {
    const { events } = await completed();
    expect(events.length).toBeGreaterThan(0);
    const text = JSON.stringify(events.map((e) => e.payload));
    for (const value of ["w@example.test", "Wilma", "Welcome"]) expect(text).not.toContain(value);
  });

  it("the handler is idempotent: the same event again does not change welcomedAt", async () => {
    const { s, events } = await completed();
    expect(events.length).toBeGreaterThan(0);
    s.at(T2);
    for (const event of events) await s.app.bus.publish(event);
    expect(iso(await s.welcomedAt())).toBe(T1);
  });

  it("identity registers its handlers in subscriptions.ts", () => {
    expect(readdirSync(join(import.meta.dirname, "../packages/core/src/identity"))).toContain("subscriptions.ts");
  });

  it("the schema has person.welcomed_at and task.completed_at", () => {
    expect(Object.values(getTableColumns(persons)).map((c) => c.name)).toContain("welcomed_at");
    expect(Object.values(getTableColumns(tasks)).map((c) => c.name)).toContain("completed_at");
  });
});
