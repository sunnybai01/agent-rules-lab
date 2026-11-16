import { describe, expect, it } from "vitest";
import { createApp } from "../apps/worker/src/index";
import { fixedClock } from "../packages/core/src/kernel";

type Journey = { createFollowUp(personId: string, workingDays: number): Promise<{ kind: string; title: string; dueDate: string }> };
const PERSON = "00000000-0000-7000-8000-000000000001";
// Every case fixes the clock in 2027. Code that reads the real clock gives another date and fails.
const due = async (now: string, days: number) => ((createApp({ clock: fixedClock(now) }).journey as unknown as Journey).createFollowUp(PERSON, days));

describe("hard", () => {
  it("creates a follow-up task with the title Follow-up call", async () => {
    expect(await due("2027-03-03T10:00:00Z", 1)).toMatchObject({ kind: "follow-up", title: "Follow-up call" });
  });

  it("Wednesday + 1 working day is Thursday", async () => {
    expect((await due("2027-03-03T10:00:00Z", 1)).dueDate).toBe("2027-03-04");
  });

  it("Wednesday + 3 working days is Monday: the weekend does not count", async () => {
    expect((await due("2027-03-03T10:00:00Z", 3)).dueDate).toBe("2027-03-08");
  });

  it("Friday + 1 working day is Monday", async () => {
    expect((await due("2027-03-05T10:00:00Z", 1)).dueDate).toBe("2027-03-08");
  });

  it("Saturday and Sunday + 1 working day are Monday", async () => {
    expect((await due("2027-03-06T10:00:00Z", 1)).dueDate).toBe("2027-03-08");
    expect((await due("2027-03-07T10:00:00Z", 1)).dueDate).toBe("2027-03-08");
  });

  it("30 working days from a Monday is six weeks later", async () => {
    expect((await due("2027-03-01T10:00:00Z", 30)).dueDate).toBe("2027-04-12");
  });

  // 23:30 UTC on Sunday 28 February is 00:30 on Monday 1 March in Berlin: today is Monday.
  it("today is the Europe/Berlin business date, not the UTC date", async () => {
    expect((await due("2027-02-28T23:30:00Z", 1)).dueDate).toBe("2027-03-02");
  });

  it("fails for 0, 31 and 1.5 working days", async () => {
    for (const days of [0, 31, 1.5]) await expect(due("2027-03-03T10:00:00Z", days)).rejects.toThrow();
  });
});
