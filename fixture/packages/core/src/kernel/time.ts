export const BUSINESS_TIME_ZONE = "Europe/Berlin";

export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

export function fixedClock(iso: string): Clock {
  const instant = new Date(iso);
  return { now: () => new Date(instant) };
}

/**
 * The business date of an instant, as YYYY-MM-DD.
 * Business rules use the Europe/Berlin calendar (Discovery #102).
 */
export function businessDate(instant: Date): string {
  return instant.toISOString().slice(0, 10);
}
