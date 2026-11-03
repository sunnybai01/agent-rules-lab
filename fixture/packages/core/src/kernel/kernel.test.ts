import { describe, expect, it } from "vitest";
import { add, applyRate, businessDate, InMemoryEventBus, money, newId } from "./index";

describe("money", () => {
  it("adds amounts in minor units", () => {
    expect(add(money(150), money(275))).toEqual(money(425));
  });

  it("rounds half away from zero", () => {
    expect(applyRate(money(5), 0.5)).toEqual(money(3));
    expect(applyRate(money(-5), 0.5)).toEqual(money(-3));
  });

  it("rejects a float amount", () => {
    expect(() => money(1.5)).toThrow();
  });
});

describe("businessDate", () => {
  it("returns the Berlin date at midday", () => {
    expect(businessDate(new Date("2027-03-01T11:00:00Z"))).toBe("2027-03-01");
  });
});

describe("ids", () => {
  it("creates time-ordered UUIDv7 values", () => {
    const a = newId(new Date("2027-01-01T00:00:00Z"));
    const b = newId(new Date("2027-01-02T00:00:00Z"));
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(a < b).toBe(true);
  });
});

describe("InMemoryEventBus", () => {
  it("delivers an event to each subscriber", async () => {
    const bus = new InMemoryEventBus();
    const seen: string[] = [];
    bus.subscribe("x.happened", (e) => {
      seen.push(e.id);
    });
    await bus.publish({ type: "x.happened", id: "1", occurredAt: "", payload: {} });
    expect(seen).toEqual(["1"]);
  });
});
