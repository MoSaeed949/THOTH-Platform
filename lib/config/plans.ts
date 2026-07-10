// ============================================================================
// Subscription plan configuration.
//
// This file holds only the *structural / numeric* data (ids, tiers, prices,
// discounts). Human-readable names, taglines, and feature lists are localized
// and live in the i18n dictionaries under `pricing.plans.<id>` so they can be
// translated. Keep the `id`s here in sync with the keys there.
// ============================================================================

export type PlanId = "free" | "basic" | "premium";
export type BillingCycle = "monthly" | "annual";

export interface Plan {
  id: PlanId;
  /** Ordering / comparison level. Higher = more capable. */
  tier: number;
  /** Price per month on the monthly plan (in `currency`). */
  monthly: number;
  /** Effective price per month when billed annually. */
  annualMonthly: number;
  /** Marketing highlight — renders the "Most popular" ribbon. */
  popular?: boolean;
}

export const CURRENCY = {
  code: "USD",
  symbol: "$",
  /** Intl locale used only for number grouping (not UI language). */
  numberLocale: "en-US",
} as const;

// Pricing chosen for a broad international audience. Annual billing uses clean
// round monthly-equivalents so totals and savings display neatly:
//   Basic:   $9.99/mo  → $7.99/mo billed annually  (~20% off, save $24/yr)
//   Premium: $19.99/mo → $14.99/mo billed annually  (25% off, save $60/yr)
export const PLANS: Plan[] = [
  { id: "free", tier: 0, monthly: 0, annualMonthly: 0 },
  { id: "basic", tier: 1, monthly: 9.99, annualMonthly: 7.99 },
  { id: "premium", tier: 2, monthly: 19.99, annualMonthly: 14.99, popular: true },
];

export const FREE_PLAN_ID: PlanId = "free";

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

/** Total charged per billing cycle. */
export function cycleTotal(plan: Plan, cycle: BillingCycle): number {
  return cycle === "annual" ? plan.annualMonthly * 12 : plan.monthly;
}

/** Effective monthly cost for a given cycle. */
export function monthlyEquivalent(plan: Plan, cycle: BillingCycle): number {
  return cycle === "annual" ? plan.annualMonthly : plan.monthly;
}

/** Amount saved per year by choosing annual over monthly. */
export function annualSavings(plan: Plan): number {
  return (plan.monthly - plan.annualMonthly) * 12;
}

/** Whole-number discount percentage for annual billing (0 for free). */
export function annualDiscountPercent(plan: Plan): number {
  if (plan.monthly === 0) return 0;
  return Math.round((1 - plan.annualMonthly / plan.monthly) * 100);
}

/** Format a number as a currency string, e.g. 9.99 → "$9.99", 24 → "$24". */
export function formatPrice(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const hasCents = rounded % 1 !== 0;
  const body = rounded.toLocaleString(CURRENCY.numberLocale, {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY.symbol}${body}`;
}

/** "upgrade" | "downgrade" | "same" relative to the current plan. */
export function changeDirection(from: PlanId, to: PlanId): "upgrade" | "downgrade" | "same" {
  const a = getPlan(from).tier;
  const b = getPlan(to).tier;
  if (b > a) return "upgrade";
  if (b < a) return "downgrade";
  return "same";
}
