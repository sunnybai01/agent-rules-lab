import { type CustomerMasterData, type ErpPort, ErpUnavailableError } from "@provital/erp-port";

/** Synthetic data only. No personal data of real customers or advisors. */
export const fakeCustomers: CustomerMasterData[] = [
  {
    customerNumber: "K100001",
    givenName: "Erika",
    familyName: "Muster",
    email: "erika.muster@example.test",
    advisorNumber: "B20001",
    sourceVersion: "v1",
  },
  {
    customerNumber: "K100002",
    givenName: "Max",
    familyName: "Beispiel",
    email: "max.beispiel@example.test",
    advisorNumber: null,
    sourceVersion: "v3",
  },
];

export interface FakeErpOptions {
  /** When true, every operation throws ErpUnavailableError. */
  unavailable?: boolean;
}

export function createFakeErp(options: FakeErpOptions = {}): ErpPort {
  return {
    async readCustomer(customerNumber) {
      if (options.unavailable) throw new ErpUnavailableError("readCustomer");
      const found = fakeCustomers.find((c) => c.customerNumber === customerNumber);
      return found ? structuredClone(found) : null;
    },
  };
}
