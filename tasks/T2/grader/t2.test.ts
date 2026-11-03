import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createApp } from "../apps/worker/src/index";
import { fixedClock } from "../packages/core/src/kernel";

type Api = { getAdvisor(n: string): Promise<Record<string, unknown> | null> };
const clock = fixedClock("2027-01-05T08:00:00Z");

function identitySources(): string {
  const dir = join(import.meta.dirname, "../packages/core/src/identity");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .join("\n");
}

describe("hard", () => {
  it("returns the advisor B20001 with source version and read time", async () => {
    const app = createApp({ clock });
    const advisor = await (app.identity as unknown as Api).getAdvisor("B20001");
    expect(advisor).toMatchObject({
      advisorNumber: "B20001",
      active: expect.any(Boolean),
      sourceVersion: expect.any(String),
      readAt: "2027-01-05T08:00:00.000Z",
    });
    expect(String(advisor?.email)).toMatch(/@example\.test$/);
  });

  it("returns null for an unknown advisor", async () => {
    const app = createApp({ clock });
    expect(await (app.identity as unknown as Api).getAdvisor("B99999")).toBeNull();
  });

  it("identity does not import the ERP port or an adapter", () => {
    expect(identitySources()).not.toMatch(/@provital\/erp-(port|fake|nav)/);
  });
});

describe("soft", () => {
  it("the ERP outage surfaces as an error, not as null", async () => {
    const app = createApp({ clock, erp: { unavailable: true } });
    await expect((app.identity as unknown as Api).getAdvisor("B20001")).rejects.toThrow();
  });

  it("the advisor contract is a Zod schema in erp-port", () => {
    const src = readFileSync(join(import.meta.dirname, "../packages/erp-port/src/index.ts"), "utf8");
    expect(src).toMatch(/Advisor\w*\s*=\s*z\.object/);
  });
});
