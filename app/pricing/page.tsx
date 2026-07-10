"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useI18n } from "@/components/I18nProvider";
import {
  PLANS,
  annualDiscountPercent,
  annualSavings,
  cycleTotal,
  formatPrice,
  monthlyEquivalent,
  type BillingCycle,
  type Plan,
  type PlanId,
} from "@/lib/config/plans";
import { effectivePlan, loadSubscription } from "@/lib/subscription";

export default function PricingPage() {
  const { t, fmt } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const [signedIn, setSignedIn] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setSignedIn(true);
      const sub = await loadSubscription(supabase, user.id);
      setCurrentPlan(effectivePlan(sub));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Biggest available annual discount, for the toggle hint.
  const maxDiscount = Math.max(...PLANS.map(annualDiscountPercent));

  function ctaFor(plan: Plan) {
    const isCurrent = signedIn && plan.id === currentPlan;
    if (isCurrent) {
      return (
        <Button variant="secondary" fullWidth disabled>
          {t.pricing.currentPlan}
        </Button>
      );
    }
    if (!signedIn) {
      return (
        <ButtonLink
          href="/signup"
          fullWidth
          variant={plan.popular ? "primary" : "secondary"}
        >
          {plan.id === "free" ? t.pricing.getStarted : fmt(t.pricing.choosePlan, { plan: t.pricing.plans[plan.id].name })}
        </ButtonLink>
      );
    }
    return (
      <Button
        variant={plan.popular ? "primary" : "secondary"}
        fullWidth
        onClick={() => router.push("/settings/subscription")}
      >
        {t.pricing.manageSubscription}
      </Button>
    );
  }

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h1 className="font-display text-4xl text-papyrus md:text-5xl">{t.pricing.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-dusty">{t.pricing.subtitle}</p>
        </div>

        {/* Billing cycle toggle */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <div
            role="tablist"
            aria-label={t.pricing.monthly + " / " + t.pricing.annual}
            className="inline-flex rounded-full border border-obsidian-line bg-obsidian-soft p-1"
          >
            {(["monthly", "annual"] as BillingCycle[]).map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={cycle === c}
                onClick={() => setCycle(c)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                  cycle === c ? "bg-gold text-ink" : "text-dusty hover:text-papyrus"
                }`}
              >
                {c === "monthly" ? t.pricing.monthly : t.pricing.annual}
              </button>
            ))}
          </div>
          {cycle === "annual" && (
            <p className="text-sm text-gold">{fmt(t.pricing.saveBadge, { percent: maxDiscount })}</p>
          )}
        </div>

        {/* Plan cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const copy = t.pricing.plans[plan.id];
            const perMonth = monthlyEquivalent(plan, cycle);
            const isPaidAnnual = cycle === "annual" && plan.monthly > 0;
            return (
              <div
                key={plan.id}
                className={`papyrus-card relative flex flex-col p-8 ${
                  plan.popular ? "border-gold shadow-gold lg:-mt-4 lg:mb-4" : ""
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 start-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink rtl:translate-x-1/2">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    {t.pricing.mostPopular}
                  </span>
                )}

                <h2 className="font-display text-2xl text-gold">{copy.name}</h2>
                <p className="mt-1 min-h-[2.5rem] text-sm text-dusty">{copy.tagline}</p>

                <div className="mt-5">
                  <div className="flex items-end gap-1">
                    <span className="font-display text-4xl text-papyrus">{formatPrice(perMonth)}</span>
                    <span className="mb-1 text-sm text-dusty">{t.pricing.perMonth}</span>
                  </div>
                  <p className="mt-1 h-5 text-xs text-dusty">
                    {plan.monthly === 0
                      ? ""
                      : isPaidAnnual
                      ? fmt(t.pricing.billedAnnually, { amount: formatPrice(cycleTotal(plan, "annual")) })
                      : t.pricing.billedMonthly}
                  </p>
                  {isPaidAnnual && (
                    <p className="mt-1 text-xs font-medium text-gold">
                      {fmt(t.pricing.saveAmount, { amount: formatPrice(annualSavings(plan)) })}
                    </p>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {copy.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-papyrus">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">{ctaFor(plan)}</div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <section className="mx-auto mt-20 max-w-3xl">
          <h2 className="text-center font-display text-2xl text-papyrus">{t.pricing.faqTitle}</h2>
          <dl className="mt-8 space-y-4">
            {[
              { q: t.pricing.faq.q1, a: t.pricing.faq.a1 },
              { q: t.pricing.faq.q2, a: t.pricing.faq.a2 },
              { q: t.pricing.faq.q3, a: t.pricing.faq.a3 },
              { q: t.pricing.faq.q4, a: t.pricing.faq.a4 },
            ].map((item, i) => (
              <div key={i} className="papyrus-card p-6">
                <dt className="font-display text-lg text-gold">{item.q}</dt>
                <dd className="mt-2 text-sm text-dusty">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <Footer />
    </div>
  );
}
