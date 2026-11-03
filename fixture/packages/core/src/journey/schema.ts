import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { notPersonal, withDataMeta } from "../kernel";

export const journeySchema = pgSchema("journey");

export const tasks = withDataMeta(
  journeySchema.table("task", {
    id: uuid("id").primaryKey(),
    personId: uuid("person_id").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    dueDate: text("due_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  }),
  {
    id: notPersonal,
    personId: notPersonal,
    kind: notPersonal,
    title: notPersonal,
    dueDate: notPersonal,
    createdAt: notPersonal,
  },
);
