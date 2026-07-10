"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingBlock, EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/components/I18nProvider";
import {
  PLANS,
  cycleTotal,
  formatPrice,
  getPlan,
  monthlyEquivalent,
  changeDirection,
  type BillingCycle,
  type PlanId,
} from "@/lib/config/plans";
import {
  activatePlan,
  cancelAtPeriodEnd,
  changeCycle,
  downgradeToFree,
  effectivePlan,
  loadBillingHistory,
  loadSubscription,
  resumeSubscription,
  type BillingRow,
  type SubscriptionRow,
} from "@/lib/subscription";

type Pending =
  | { type: "change"; planId: PlanId; cycle: BillingCycle }
  | { type: "cancel" }
  | { type: "resume" }
  | { type: "cycle"; cycle: BillingCycle }
  | null;

export default function SubscriptionPage() {
  const { t, fmt, locale } = useI18n();
  const toast = useToast();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [billing, setBilling] = useState<BillingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("annual");
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);

  const fmtDate = useCallback(
    (iso: string | null | undefined) =>
      iso ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso)) : "",
    [locale]
  );

  const refresh = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const [s, b] = await Promise.all([
      loadSubscription(supabase, user.id),
      loadBillingHistory(supabase, user.id),
    ]);
    setSub(s);
    setBilling(b);
    if (s) setSelectedCycle(s.billing_cycle);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const currentPlanId = effectivePlan(sub);
  const currentPlan = getPlan(currentPlanId);
  const isPaid = currentPlanId !== "free";
  const canceling = !!sub?.cancel_at_period_end;

  async function runPending() {
    if (!pending || !userId) return;
    setBusy(true);
    try {
      if (pending.type === "change") {
        if (pending.planId === "free") {
          await downgradeToFree(supabase, userId);
        } else {
          await activatePlan(supabase, userId, pending.planId, pending.cycle);
        }
        toast({
          title: fmt(t.subscription.notify.changed, { plan: t.pricing.plans[pending.planId].name }),
          variant: "success",
        });
      } else if (pending.type === "cancel") {
        await cancelAtPeriodEnd(supabase, userId);
        toast({
          title: fmt(t.subscription.notify.canceled, { date: fmtDate(sub?.current_period_end) }),
          variant: "info",
        });
      } else if (pending.type === "resume") {
        await resumeSubscription(supabase, userId);
        toast({ title: t.subscription.notify.resumed, variant: "success" });
      } else if (pending.type === "cycle") {
        await changeCycle(supabase, userId, currentPlanId, pending.cycle);
        toast({
          title: fmt(t.subscription.notify.cycleChanged, {
            cycle: pending.cycle === "annual" ? t.subscription.cycleAnnual : t.subscription.cycleMonthly,
          }),
          variant: "success",
        });
      }
      setPending(null);
      await refresh();
    } catch {
      toast({ title: t.subscription.notify.error, variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  // ---- Confirm dialog content derived from the pending action ----
  function dialogProps() {
    if (!pending) return null;
    if (pending.type === "cancel") {
      return {
        title: t.subscription.cancelTitle,
        body: fmt(t.subscription.cancelBody, {
          plan: t.pricing.plans[currentPlanId].name,
          date: fmtDate(sub?.current_period_end),
        }),
        confirmLabel: t.subscription.cancelConfirm,
        cancelLabel: t.subscription.cancelKeep,
        destructive: true,
      };
    }
    if (pending.type === "resume") {
      return {
        title: t.subscription.resumeTitle,
        body: fmt(t.subscription.resumeBody, {
          plan: t.pricing.plans[currentPlanId].name,
          date: fmtDate(sub?.current_period_end),
        }),
        confirmLabel: t.subscription.resumeConfirm,
        cancelLabel: t.common.cancel,
        destructive: false,
      };
    }
    if (pending.type === "cycle") {
      return {
        title: t.subscription.billingCycle,
        body: pending.cycle === "annual" ? t.subscription.switchToAnnual : t.subscription.switchToMonthly,
        confirmLabel: t.common.confirm,
        cancelLabel: t.common.cancel,
        destructive: false,
      };
    }
    // change plan
    const plan = getPlan(pending.planId);
    const priceLine =
      pending.planId === "free"
        ? t.subscription.onFreePlan
        : `${formatPrice(monthlyEquivalent(plan, pending.cycle))}${t.pricing.perMonth} · ${
            pending.cycle === "annual" ? t.subscription.cycleAnnual : t.subscription.cycleMonthly
          }`;
    return {
      title: fmt(t.pricing.choosePlan, { plan: t.pricing.plans[pending.planId].name }),
      body: priceLine,
      confirmLabel: t.common.confirm,
      cancelLabel: t.common.cancel,
      destructive: false,
    };
  }
  const dlg = dialogProps();

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-papyrus">{t.subscription.title}</h1>
      <p className="mt-1 text-dusty">{t.subscription.subtitle}</p>

      {loading ? (
        <LoadingBlock label={t.common.loading} />
      ) : (
        <div className="mt-8 space-y-8">
          {/* Current plan summary */}
          <section className="papyrus-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-dusty">{t.subscription.currentPlan}</p>
                <div className="mt-1 flex items-center gap-2">
                  <h2 className="font-display text-2xl text-gold">{t.pricing.plans[currentPlanId].name}</h2>
                  {currentPlan.popular && <Sparkles className="h-4 w-4 text-gold" aria-hidden />}
                </div>
              </div>
              <StatusBadge
                label={
                  !isPaid
                    ? t.subscription.freeForever
                    : canceling
                    ? t.subscription.statusCancelScheduled
                    : t.subscription.statusActive
                }
                tone={!isPaid ? "neutral" : canceling ? "warn" : "ok"}
              />
            </div>

            {isPaid && (
              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-dusty">{t.subscription.billingCycle}</dt>
                  <dd className="mt-1 text-papyrus">
                    {sub?.billing_cycle === "annual" ? t.subscription.cycleAnnual : t.subscription.cycleMonthly}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-dusty">{t.subscription.nextPayment}</dt>
                  <dd className="mt-1 text-papyrus">
                    {canceling
                      ? "—"
                      : fmt(t.subscription.nextPaymentAmount, {
                          amount: formatPrice(cycleTotal(currentPlan, sub?.billing_cycle ?? "monthly")),
                          date: fmtDate(sub?.current_period_end),
                        })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-dusty">{t.subscription.status}</dt>
                  <dd className="mt-1 text-papyrus">
                    {canceling
                      ? fmt(t.subscription.endsOn, { date: fmtDate(sub?.current_period_end) })
                      : fmt(t.subscription.renewsOn, { date: fmtDate(sub?.current_period_end) })}
                  </dd>
                </div>
              </dl>
            )}

            {/* Benefits */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-dusty">{t.subscription.yourBenefits}</p>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {t.pricing.plans[currentPlanId].features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-papyrus">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Primary actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {isPaid && !canceling && (
                <Button variant="danger" onClick={() => setPending({ type: "cancel" })}>
                  {t.subscription.cancelPlan}
                </Button>
              )}
              {isPaid && canceling && (
                <Button onClick={() => setPending({ type: "resume" })}>{t.subscription.resumePlan}</Button>
              )}
              {isPaid && !canceling && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    setPending({
                      type: "cycle",
                      cycle: sub?.billing_cycle === "annual" ? "monthly" : "annual",
                    })
                  }
                >
                  {sub?.billing_cycle === "annual"
                    ? t.subscription.switchToMonthly
                    : t.subscription.switchToAnnual}
                </Button>
              )}
            </div>
          </section>

          {/* Change plan */}
          <section className="papyrus-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg text-gold">{t.subscription.changePlan}</h2>
              <div
                role="tablist"
                aria-label={t.subscription.billingCycle}
                className="inline-flex rounded-full border border-obsidian-line p-1 text-xs"
              >
                {(["monthly", "annual"] as BillingCycle[]).map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={selectedCycle === c}
                    onClick={() => setSelectedCycle(c)}
                    className={`rounded-full px-4 py-1.5 transition ${
                      selectedCycle === c ? "bg-gold text-ink" : "text-dusty hover:text-papyrus"
                    }`}
                  >
                    {c === "monthly" ? t.subscription.cycleMonthly : t.subscription.cycleAnnual}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {PLANS.map((plan) => {
                const isCurrent =
                  plan.id === currentPlanId &&
                  (plan.id === "free" || sub?.billing_cycle === selectedCycle) &&
                  !canceling;
                const dir = changeDirection(currentPlanId, plan.id);
                const perMonth = monthlyEquivalent(plan, selectedCycle);
                const label =
                  isCurrent
                    ? t.subscription.currentPlan
                    : dir === "upgrade"
                    ? t.subscription.upgrade
                    : dir === "downgrade"
                    ? t.subscription.downgrade
                    : fmt(t.pricing.choosePlan, { plan: t.pricing.plans[plan.id].name });
                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl border p-5 ${
                      plan.id === currentPlanId ? "border-gold-dim bg-gold/5" : "border-obsidian-line"
                    }`}
                  >
                    <h3 className="font-display text-lg text-papyrus">{t.pricing.plans[plan.id].name}</h3>
                    <p className="mt-1 text-sm text-dusty">
                      <span className="text-papyrus">{formatPrice(perMonth)}</span>
                      {t.pricing.perMonth}
                    </p>
                    <Button
                      variant={isCurrent ? "secondary" : dir === "upgrade" ? "primary" : "secondary"}
                      size="sm"
                      fullWidth
                      disabled={isCurrent}
                      className="mt-4"
                      onClick={() => setPending({ type: "change", planId: plan.id, cycle: selectedCycle })}
                    >
                      {label}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Billing history */}
          <section className="papyrus-card p-6">
            <h2 className="font-display text-lg text-gold">{t.subscription.billingHistory}</h2>
            {billing.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title={t.subscription.noBilling}
                className="mt-4 border-none"
              />
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-start text-xs uppercase tracking-wide text-dusty">
                      <th className="pb-2 text-start font-medium">{t.subscription.invoiceDate}</th>
                      <th className="pb-2 text-start font-medium">{t.subscription.invoicePlan}</th>
                      <th className="pb-2 text-start font-medium">{t.subscription.invoiceAmount}</th>
                      <th className="pb-2 text-start font-medium">{t.subscription.invoiceStatus}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billing.map((row) => {
                      const statusLabel =
                        row.status === "refunded"
                          ? t.subscription.invoiceRefunded
                          : row.status === "failed"
                          ? t.subscription.invoiceFailed
                          : t.subscription.invoicePaid;
                      const statusClass =
                        row.status === "failed"
                          ? "bg-fail/10 text-fail"
                          : row.status === "refunded"
                          ? "bg-dusty/10 text-dusty"
                          : "bg-gold/10 text-gold";
                      return (
                        <tr key={row.id} className="border-t border-obsidian-line">
                          <td className="py-3 text-papyrus">{fmtDate(row.created_at)}</td>
                          <td className="py-3 text-papyrus">{t.pricing.plans[row.plan_id].name}</td>
                          <td className="py-3 text-papyrus">{formatPrice(row.amount)}</td>
                          <td className="py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs ${statusClass}`}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {dlg && (
        <ConfirmDialog
          open={!!pending}
          title={dlg.title}
          body={dlg.body}
          confirmLabel={dlg.confirmLabel}
          cancelLabel={dlg.cancelLabel}
          destructive={dlg.destructive}
          loading={busy}
          onConfirm={runPending}
          onCancel={() => !busy && setPending(null)}
        />
      )}
    </AppShell>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: "ok" | "warn" | "neutral" }) {
  const cls =
    tone === "ok"
      ? "border-gold-dim bg-gold/10 text-gold"
      : tone === "warn"
      ? "border-fail/40 bg-fail/10 text-fail"
      : "border-obsidian-line bg-obsidian-softer text-dusty";
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${cls}`}>{label}</span>
  );
}
