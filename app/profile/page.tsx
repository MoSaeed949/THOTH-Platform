"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button, ButtonLink } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/ui/states";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/components/I18nProvider";
import { effectivePlan, loadSubscription } from "@/lib/subscription";
import type { PlanId } from "@/lib/config/plans";

export default function ProfilePage() {
  const { t, locale } = useI18n();
  const toast = useToast();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanId>("free");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, created_at")
        .eq("id", user.id)
        .single();
      setFullName(profile?.full_name ?? "");
      setCreatedAt(profile?.created_at ?? user.created_at ?? null);

      const sub = await loadSubscription(supabase, user.id);
      setPlan(effectivePlan(sub));
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      toast({ title: t.profile.saveError, variant: "error" });
    } else {
      toast({ title: t.profile.saved, variant: "success" });
    }
  }

  const memberSince = createdAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(createdAt))
    : "";

  const inputClass =
    "mt-1 w-full rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none transition focus:border-gold";

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-papyrus">{t.profile.title}</h1>
      <p className="mt-1 text-dusty">{t.profile.subtitle}</p>

      {loading ? (
        <LoadingBlock label={t.common.loading} />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form onSubmit={handleSave} className="papyrus-card p-6 lg:col-span-2">
            <label className="block text-sm text-dusty">
              {t.profile.fullName}
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder={t.auth.fullNamePlaceholder}
              />
            </label>

            <label className="mt-4 block text-sm text-dusty">
              {t.profile.email}
              <input value={email} readOnly disabled className={`${inputClass} opacity-70`} />
            </label>
            <p className="mt-1 text-xs text-dusty">{t.profile.emailReadonly}</p>

            <Button type="submit" loading={saving} className="mt-6">
              {t.profile.save}
            </Button>
          </form>

          <div className="papyrus-card flex flex-col gap-5 p-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-dusty">{t.profile.memberSince}</p>
              <p className="mt-1 text-papyrus">{memberSince}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-dusty">{t.profile.plan}</p>
              <p className="mt-1 font-display text-lg text-gold">{t.pricing.plans[plan].name}</p>
            </div>
            <ButtonLink href="/settings/subscription" variant="secondary" size="sm">
              {t.settings.manage}
            </ButtonLink>
          </div>
        </div>
      )}
    </AppShell>
  );
}
