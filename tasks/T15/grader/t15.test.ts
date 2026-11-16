import { describe, expect, it } from "vitest";
import { createApp } from "../apps/worker/src/index";
import { fixedClock } from "../packages/core/src/kernel";

type Identity = { linkErpCustomer(personId: string, customerNumber: string): Promise<{ id: string; erpCustomerNumber: string | null }> };
const clock = fixedClock("2027-01-05T08:00:00Z");

async function setup() {
  const app = createApp({ clock });
  const a = await app.identity.registerPerson({ email: "a@example.test", givenName: "A", familyName: "One" });
  const b = await app.identity.registerPerson({ email: "b@example.test", givenName: "B", familyName: "Two" });
  return { app, a, b, identity: app.identity as unknown as Identity };
}

describe("hard", () => {
  it("stores the number and returns the person", async () => {
    const s = await setup();
    expect(await s.identity.linkErpCustomer(s.a.id, "K100001")).toMatchObject({ id: s.a.id, erpCustomerNumber: "K100001" });
    expect((await s.app.identity.getPerson(s.a.id))?.erpCustomerNumber).toBe("K100001");
  });

  it("fails for a number that is not K and 6 digits", async () => {
    const s = await setup();
    for (const n of ["100001", "K10000", "K1000011", "B20001"]) await expect(s.identity.linkErpCustomer(s.a.id, n)).rejects.toThrow();
    expect((await s.app.identity.getPerson(s.a.id))?.erpCustomerNumber).toBeNull();
  });

  it("fails for an unknown person", async () => {
    const s = await setup();
    await expect(s.identity.linkErpCustomer("00000000-0000-7000-8000-000000000000", "K100001")).rejects.toThrow();
  });

  it("fails for a person that already has a number, and keeps the first", async () => {
    const s = await setup();
    await s.identity.linkErpCustomer(s.a.id, "K100001");
    await expect(s.identity.linkErpCustomer(s.a.id, "K100002")).rejects.toThrow();
    expect((await s.app.identity.getPerson(s.a.id))?.erpCustomerNumber).toBe("K100001");
  });

  it("fails for a number that another person holds", async () => {
    const s = await setup();
    await s.identity.linkErpCustomer(s.a.id, "K100001");
    await expect(s.identity.linkErpCustomer(s.b.id, "K100001")).rejects.toThrow();
    expect((await s.app.identity.getPerson(s.b.id))?.erpCustomerNumber).toBeNull();
  });
});
