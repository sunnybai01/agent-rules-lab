import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createApp } from "../apps/worker/src/index";
import { fixedClock } from "../packages/core/src/kernel";

type Api = { getPaymentOptions(n: string): Promise<Record<string, unknown> | null> };
const clock = fixedClock("2027-01-05T08:00:00Z");

function identitySources(): string {
  const dir = join(import.meta.dirname, "../packages/core/src/identity");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .join("\n");
}

describe("hard", () => {
  it("returns the payment options of K100001 with source version and read time", async () => {
    const app = createApp({ clock });
    const options = await (app.identity as unknown as Api).getPaymentOptions("K100001");
    expect(options).toMatchObject({ customerNumber: "K100001", sourceVersion: expect.any(String), readAt: "2027-01-05T08:00:00.000Z" });
    expect([...(options?.methods as string[])].sort()).toEqual(["card", "invoice"]);
  });

  it("returns null for an unknown customer", async () => {
    const app = createApp({ clock });
    expect(await (app.identity as unknown as Api).getPaymentOptions("K999999")).toBeNull();
  });

  it("identity does not import the ERP port or an adapter", () => {
    expect(identitySources()).not.toMatch(/@provital\/erp-(port|fake|nav)/);
  });
});

describe("soft", () => {
  it("the ERP outage surfaces as an error, not as null", async () => {
    const app = createApp({ clock, erp: { unavailable: true } });
    await expect((app.identity as unknown as Api).getPaymentOptions("K100001")).rejects.toThrow();
  });

  it("the payment options contract is a Zod schema in erp-port", () => {
    const src = readFileSync(join(import.meta.dirname, "../packages/erp-port/src/index.ts"), "utf8");
    expect(src).toMatch(/Payment\w*\s*=\s*z\.object/);
  });
});
