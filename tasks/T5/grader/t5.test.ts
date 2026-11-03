import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { businessDate } from "../packages/core/src/kernel";

describe("hard", () => {
  it("winter time: 00:30 Berlin on 1 March is 1 March", () => {
    expect(businessDate(new Date("2027-02-28T23:30:00Z"))).toBe("2027-03-01");
  });
  it("summer time: 00:30 Berlin on 1 July is 1 July", () => {
    expect(businessDate(new Date("2027-06-30T22:30:00Z"))).toBe("2027-07-01");
  });
  it("23:59 Berlin stays on the same day", () => {
    expect(businessDate(new Date("2027-03-01T22:59:00Z"))).toBe("2027-03-01");
    expect(businessDate(new Date("2027-07-01T21:59:00Z"))).toBe("2027-07-01");
  });
  it("daylight saving change days", () => {
    expect(businessDate(new Date("2027-03-28T00:30:00Z"))).toBe("2027-03-28");
    expect(businessDate(new Date("2027-10-30T22:30:00Z"))).toBe("2027-10-31");
  });
});

describe("soft", () => {
  it("a regression test near midnight was added to kernel tests", () => {
    const src = readFileSync(join(import.meta.dirname, "../packages/core/src/kernel/kernel.test.ts"), "utf8");
    expect(src).toMatch(/T2[23]:\d\d:00(\.000)?Z/);
  });
});
