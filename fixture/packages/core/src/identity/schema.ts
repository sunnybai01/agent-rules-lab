import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { notPersonal, withDataMeta } from "../kernel";

export const identitySchema = pgSchema("identity");

export const persons = withDataMeta(
  identitySchema.table("person", {
    id: uuid("id").primaryKey(),
    email: text("email").notNull().unique(),
    givenName: text("given_name").notNull(),
    familyName: text("family_name").notNull(),
    erpCustomerNumber: text("erp_customer_number").unique(),
    brand: text("brand").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  }),
  {
    id: notPersonal,
    email: {
      personal: true,
      category: "contact",
      purpose: "Sign-in and account e-mails",
      owner: "identity",
      retention: "account lifetime + 3 years",
    },
    givenName: {
      personal: true,
      category: "identity",
      purpose: "Address the person and fulfil orders",
      owner: "identity",
      retention: "account lifetime + 3 years",
    },
    familyName: {
      personal: true,
      category: "identity",
      purpose: "Address the person and fulfil orders",
      owner: "identity",
      retention: "account lifetime + 3 years",
    },
    erpCustomerNumber: notPersonal,
    brand: notPersonal,
    createdAt: notPersonal,
  },
);
