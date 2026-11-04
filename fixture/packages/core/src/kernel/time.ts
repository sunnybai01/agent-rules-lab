export const BUSINESS_TIME_ZONE = "Europe/Berlin";

export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

export function fixedClock(iso: string): Clock {
  const instant = new Date(iso);
  return { now: () => new Date(instant) };
}

// The en-CA locale formats a date as YYYY-MM-DD.
const businessDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * The business date of an instant, as YYYY-MM-DD.
 * Business rules use the Europe/Berlin calendar (Discovery #102).
 */
export function businessDate(instant: Date): string {
  return businessDateFormat.format(instant);
}
