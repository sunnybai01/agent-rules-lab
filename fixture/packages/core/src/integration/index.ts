import type { CustomerMasterData, ErpPort } from "@provital/erp-port";
import type { Clock } from "../kernel";
import { systemClock } from "../kernel";

/**
 * The only module that reaches the ERP (T3-D-005, T3-AC-001).
 * Other modules call this public API; they never import the port or an adapter.
 */

export interface ErpRead<T> {
  readonly data: T;
  /** Where the data comes from, its version and the read time (T2-D-009). */
  readonly source: "erp";
  readonly sourceVersion: string;
  readonly readAt: string;
}

export interface Integration {
  readCustomer(customerNumber: string): Promise<ErpRead<CustomerMasterData> | null>;
}

export interface IntegrationDeps {
  erp: ErpPort;
  clock?: Clock;
}

export function createIntegration({ erp, clock = systemClock }: IntegrationDeps): Integration {
  return {
    async readCustomer(customerNumber) {
      const data = await erp.readCustomer(customerNumber);
      if (!data) return null;
      return {
        data,
        source: "erp",
        sourceVersion: data.sourceVersion,
        readAt: clock.now().toISOString(),
      };
    },
  };
}
