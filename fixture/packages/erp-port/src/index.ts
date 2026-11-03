import { z } from "zod";

/**
 * The ERP port (ADR-0004, T3-D-005). Operations and payload contracts only, no I/O.
 * The NAV adapter and the fake adapter implement it. Only the `integration` module uses it.
 */

export const CustomerMasterData = z.object({
  customerNumber: z.string().regex(/^K\d{6}$/),
  givenName: z.string(),
  familyName: z.string(),
  email: z.string().email(),
  advisorNumber: z
    .string()
    .regex(/^B\d{5}$/)
    .nullable(),
  sourceVersion: z.string(),
});
export type CustomerMasterData = z.infer<typeof CustomerMasterData>;

export class ErpUnavailableError extends Error {
  constructor(operation: string) {
    super(`ERP unavailable: ${operation}`);
    this.name = "ErpUnavailableError";
  }
}

export interface ErpPort {
  /** Returns null when the ERP has no customer with this number. */
  readCustomer(customerNumber: string): Promise<CustomerMasterData | null>;
}
