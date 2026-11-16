import { vi } from "vitest";

// The repository's own tests run as if today were Saturday 14 June 2031, late evening UTC
// (Sunday in Berlin). A test that depends on the day it was written fails here.
vi.useFakeTimers({ toFake: ["Date"], now: new Date("2031-06-14T22:30:00Z") });
