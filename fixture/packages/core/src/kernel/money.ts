export type Currency = "EUR";

/** An amount in minor units (cents). Never use a float for money. */
export interface Money {
  readonly amountMinor: number;
  readonly currency: Currency;
}

export function money(amountMinor: number, currency: Currency = "EUR"): Money {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new Error(`Money needs an integer amount in minor units, got ${amountMinor}`);
  }
  return { amountMinor, currency };
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amountMinor + b.amountMinor, a.currency);
}

/** Multiplies by a rate and rounds half away from zero. */
export function applyRate(amount: Money, rate: number): Money {
  const raw = amount.amountMinor * rate;
  const rounded = Math.sign(raw) * Math.round(Math.abs(raw));
  return money(rounded, amount.currency);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} and ${b.currency}`);
  }
}
