import { addMonths, addYears } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  cycleTotal,
  getPlan,
  type BillingCycle,
  type PlanId,
} from "@/lib/config/plans";

export type SubStatus = "active" | "canceled";

export type SubscriptionRow = {
  user_id: string;
  plan_id: PlanId;
  status: SubStatus;
  billing_cycle: BillingCycle;
  cancel_at_period_end: boolean;
  current_period_start: string;
  current_period_end: string | null;
};

export type BillingRow = {
  id: string;
  plan_id: PlanId;
  billing_cycle: BillingCycle;
  amount: number;
  currency: string;
  status: string;
  period_start: string;
  period_end: string | null;
  created_at: string;
};

/** The plan the user effectively has right now (no row ⇒ Free). */
export function effectivePlan(sub: SubscriptionRow | null): PlanId {
  if (!sub || sub.plan_id === "free") return "free";
  return sub.plan_id;
}

/** End of the current period given a start and a cycle. */
export function periodEnd(cycle: BillingCycle, from = new Date()): Date {
  return cycle === "annual" ? addYears(from, 1) : addMonths(from, 1);
}

export async function loadSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionRow | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "user_id, plan_id, status, billing_cycle, cancel_at_period_end, current_period_start, current_period_end"
    )
    .eq("user_id", userId)
    .maybeSingle();
  return (data as SubscriptionRow | null) ?? null;
}

export async function loadBillingHistory(
  supabase: SupabaseClient,
  userId: string
): Promise<BillingRow[]> {
  const { data } = await supabase
    .from("billing_history")
    .select("id, plan_id, billing_cycle, amount, currency, status, period_start, period_end, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as BillingRow[]) ?? [];
}

/**
 * Start or change a paid plan (simulated billing — no real charge). Upserts the
 * subscription and records a billing_history entry for the charged amount.
 */
export async function activatePlan(
  supabase: SupabaseClient,
  userId: string,
  planId: PlanId,
  cycle: BillingCycle
): Promise<void> {
  const now = new Date();
  const end = periodEnd(cycle, now);

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: planId,
      status: "active",
      billing_cycle: cycle,
      cancel_at_period_end: false,
      current_period_start: now.toISOString(),
      current_period_end: end.toISOString(),
      updated_at: now.toISOString(),
    },
    { onConflict: "user_id" }
  );

  const plan = getPlan(planId);
  const amount = cycleTotal(plan, cycle);
  if (amount > 0) {
    await supabase.from("billing_history").insert({
      user_id: userId,
      plan_id: planId,
      billing_cycle: cycle,
      amount,
      currency: "USD",
      status: "paid",
      period_start: now.toISOString(),
      period_end: end.toISOString(),
    });
  }
}

/** Switch the billing cycle for the current plan (re-bills for the new cycle). */
export async function changeCycle(
  supabase: SupabaseClient,
  userId: string,
  planId: PlanId,
  cycle: BillingCycle
): Promise<void> {
  await activatePlan(supabase, userId, planId, cycle);
}

/** Schedule cancellation at period end (keeps access until then). */
export async function cancelAtPeriodEnd(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await supabase
    .from("subscriptions")
    .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}

/** Undo a scheduled cancellation. */
export async function resumeSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await supabase
    .from("subscriptions")
    .update({ cancel_at_period_end: false, status: "active", updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}

/** Immediately move the user back to the Free plan. */
export async function downgradeToFree(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const now = new Date();
  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: "free",
      status: "active",
      billing_cycle: "monthly",
      cancel_at_period_end: false,
      current_period_start: now.toISOString(),
      current_period_end: null,
      updated_at: now.toISOString(),
    },
    { onConflict: "user_id" }
  );
}
