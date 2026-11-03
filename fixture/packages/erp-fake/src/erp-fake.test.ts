import { CustomerMasterData } from "@provital/erp-port";
import { describe, expect, it } from "vitest";
import { createFakeErp, fakeCustomers } from "./index";

describe("fake ERP", () => {
  it("returns seeded customers that satisfy the contract", async () => {
    const erp = createFakeErp();
    const customer = await erp.readCustomer("K100001");
    expect(CustomerMasterData.parse(customer)).toEqual(fakeCustomers[0]);
  });

  it("returns null for an unknown customer", async () => {
    expect(await createFakeErp().readCustomer("K999999")).toBeNull();
  });

  it("can simulate an outage", async () => {
    await expect(createFakeErp({ unavailable: true }).readCustomer("K100001")).rejects.toThrow(
      "ERP unavailable",
    );
  });
});
