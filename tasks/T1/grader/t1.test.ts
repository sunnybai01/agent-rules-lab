import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createApp } from "../apps/worker/src/index";
import { fixedClock } from "../packages/core/src/kernel";
import { dataMetaOf } from "../packages/core/src/kernel/data-meta";
import { persons } from "../packages/core/src/identity/schema";

const clock = fixedClock("2027-01-05T08:00:00Z");

describe("hard", () => {
  it("stores and returns the date of birth", async () => {
    const app = createApp({ clock });
    const p = await app.identity.registerPerson({
      email: "dob@example.test",
      givenName: "D",
      familyName: "B",
      dateOfBirth: "1990-04-12",
    } as never);
    expect((await app.identity.getPerson(p.id)) as unknown).toMatchObject({ dateOfBirth: "1990-04-12" });
  });

  it("returns null when no date of birth was given", async () => {
    const app = createApp({ clock });
    const p = await app.identity.registerPerson({ email: "n@example.test", givenName: "N", familyName: "B" });
    expect(((await app.identity.getPerson(p.id)) as unknown as { dateOfBirth: unknown }).dateOfBirth).toBeNull();
  });

  it("rejects a date of birth in the future", async () => {
    const app = createApp({ clock });
    await expect(
      app.identity.registerPerson({
        email: "f@example.test",
        givenName: "F",
        familyName: "B",
        dateOfBirth: "2030-01-01",
      } as never),
    ).rejects.toThrow();
  });

  it("the column date_of_birth exists and is personal data with purpose, owner and retention", () => {
    const column = Object.entries(getTableColumns(persons)).find(([, c]) => c.name === "date_of_birth");
    expect(column).toBeDefined();
    const meta = dataMetaOf(persons)?.[column?.[0] ?? ""];
    expect(meta).toMatchObject({ personal: true });
    if (meta?.personal) {
      expect(meta.purpose.trim()).not.toBe("");
      expect(meta.owner).toBe("identity");
      expect(meta.retention.trim()).not.toBe("");
    }
  });
});

describe("soft", () => {
  it("category is identity", () => {
    const key = Object.entries(getTableColumns(persons)).find(([, c]) => c.name === "date_of_birth")?.[0] ?? "";
    expect(dataMetaOf(persons)?.[key]).toMatchObject({ category: "identity" });
  });
});
