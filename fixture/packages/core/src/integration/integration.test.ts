import { createFakeErp } from "@provital/erp-fake";
import { describe, expect, it } from "vitest";
import { fixedClock } from "../kernel";
import { createIntegration } from "./index";

describe("integration", () => {
  it("T2-D-009: a read records its source, source version and read time", async () => {
    const integration = createIntegration({
      erp: createFakeErp(),
      clock: fixedClock("2027-01-05T08:00:00Z"),
    });
    const read = await integration.readCustomer("K100002");
    expect(read).toMatchObject({
      source: "erp",
      sourceVersion: "v3",
      readAt: "2027-01-05T08:00:00.000Z",
    });
  });
});
