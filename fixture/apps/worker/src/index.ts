import { identity, integration, journey, kernel } from "@provital/core";
import { createFakeErp, type FakeErpOptions } from "@provital/erp-fake";

export interface AppOptions {
  clock?: kernel.Clock;
  erp?: FakeErpOptions;
}

/**
 * The composition root. The worker is one of two runtime units that load an ERP adapter
 * (architecture rule 2). In this fixture it wires the fake adapter.
 */
export function createApp(options: AppOptions = {}) {
  const clock = options.clock ?? kernel.systemClock;
  const bus = new kernel.InMemoryEventBus();
  const erp = createFakeErp(options.erp);
  const integrationApi = integration.createIntegration({ erp, clock });
  const identityApi = identity.createIdentity({
    repo: new identity.InMemoryPersonRepository(),
    bus,
    clock,
  });
  const journeyApi = journey.createJourney({
    repo: new journey.InMemoryTaskRepository(),
    bus,
    clock,
  });
  return { bus, clock, integration: integrationApi, identity: identityApi, journey: journeyApi };
}

export type App = ReturnType<typeof createApp>;
