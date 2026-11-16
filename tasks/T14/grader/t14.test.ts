import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createApp } from "../apps/worker/src/index";
import { tasks } from "../packages/core/src/journey/schema";

type Callback = { id: string; kind: string; title: string; dueDate: string };
type Journey = { requestCallback(input: { requestId: string; personId: string; date: string }): Promise<Callback> };
const PERSON = "00000000-0000-7000-8000-000000000001";

function setup(start: string) {
  let now = start;
  const app = createApp({ clock: { now: () => new Date(now) } });
  let n = 0;
  const journey = app.journey as unknown as Journey;
  // Each call is a new request unless a requestId is given.
  const ask = (date: string, requestId = `r-${++n}`) => journey.requestCallback({ requestId, personId: PERSON, date });
  return { app, ask, at: (iso: string) => void (now = iso) };
}
const MONDAY = "2027-03-01T10:00:00Z";

describe("hard", () => {
  it("creates a callback task with the title Call back, due on the date", async () => {
    const s = setup(MONDAY);
    expect(await s.ask("2027-03-05")).toMatchObject({ kind: "callback", title: "Call back", dueDate: "2027-03-05" });
    expect(await s.app.journey.listTasks(PERSON)).toHaveLength(1);
  });

  it("accepts tomorrow and the day 14 days after today", async () => {
    const s = setup(MONDAY);
    await expect(s.ask("2027-03-02")).resolves.toBeDefined();
    await expect(s.ask("2027-03-15")).resolves.toBeDefined();
  });

  it("fails with CallbackDateError for today, the past, day 15 and a malformed date", async () => {
    const s = setup(MONDAY);
    for (const date of ["2027-03-01", "2027-02-20", "2027-03-16", "next week"]) {
      await expect(s.ask(date)).rejects.toMatchObject({ name: "CallbackDateError" });
    }
    expect(await s.app.journey.listTasks(PERSON)).toHaveLength(0);
  });

  // 23:30 UTC on 28 February is 00:30 on 1 March in Berlin: today is 1 March.
  it("today is the Europe/Berlin business date", async () => {
    const s = setup("2027-02-28T23:30:00Z");
    await expect(s.ask("2027-03-01")).rejects.toMatchObject({ name: "CallbackDateError" });
    await expect(s.ask("2027-03-15")).resolves.toBeDefined();
    await expect(s.ask("2027-03-16")).rejects.toMatchObject({ name: "CallbackDateError" });
  });

  it("the same requestId again returns the first task and creates nothing", async () => {
    const s = setup(MONDAY);
    const first = await s.ask("2027-03-05", "same");
    const again = await s.ask("2027-03-05", "same");
    expect(again.id).toBe(first.id);
    expect(await s.app.journey.listTasks(PERSON)).toHaveLength(1);
  });

  it("another requestId creates another task", async () => {
    const s = setup(MONDAY);
    await s.ask("2027-03-05", "a");
    await s.ask("2027-03-05", "b");
    expect(await s.app.journey.listTasks(PERSON)).toHaveLength(2);
  });

  // The rule under test. Twenty days later the date is in the past. The repeat is still the same request:
  // it returns the first task. It fails when the code checks the date before it looks for the first task.
  it("the same requestId still returns the first task after the date window has moved", async () => {
    const s = setup(MONDAY);
    const first = await s.ask("2027-03-05", "late");
    s.at("2027-03-21T10:00:00Z");
    const again = await s.ask("2027-03-05", "late");
    expect(again.id).toBe(first.id);
    expect(await s.app.journey.listTasks(PERSON)).toHaveLength(1);
  });
});

describe("soft", () => {
  it("the schema has task.request_id", () => {
    expect(Object.values(getTableColumns(tasks)).map((c) => c.name)).toContain("request_id");
  });
});
