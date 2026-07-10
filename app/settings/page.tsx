"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, CreditCard, LogOut, ChevronRight, Palette, Languages } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/components/I18nProvider";

export default function SettingsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-papyrus">{t.settings.title}</h1>
      <p className="mt-1 text-dusty">{t.settings.subtitle}</p>

      <div className="mt-8 max-w-2xl space-y-6">
        {/* Appearance */}
        <section className="papyrus-card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg text-gold">
            <Palette className="h-4 w-4" aria-hidden />
            {t.settings.appearance}
          </h2>
          <div className="mt-4 divide-y divide-obsidian-line">
            <Row title={t.settings.theme} hint={t.settings.themeHint}>
              <ThemeToggle />
            </Row>
            <Row title={t.settings.language} hint={t.settings.languageHint}>
              <span className="flex items-center gap-2 text-dusty">
                <Languages className="h-4 w-4" aria-hidden />
                <LanguageSwitcher align="end" />
              </span>
            </Row>
          </div>
        </section>

        {/* Account */}
        <section className="papyrus-card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg text-gold">
            <User className="h-4 w-4" aria-hidden />
            {t.settings.account}
          </h2>
          <div className="mt-4 divide-y divide-obsidian-line">
            <LinkRow
              href="/profile"
              icon={User}
              title={t.settings.profile}
              hint={t.settings.profileHint}
            />
            <LinkRow
              href="/settings/subscription"
              icon={CreditCard}
              title={t.settings.subscription}
              hint={t.settings.subscriptionHint}
            />
          </div>
        </section>

        {/* Danger zone */}
        <section className="papyrus-card p-6">
          <h2 className="font-display text-lg text-fail">{t.settings.dangerZone}</h2>
          <div className="mt-4">
            <Row title={t.settings.signOut} hint={t.settings.signOutHint}>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-fail px-4 py-2 text-sm text-fail transition hover:bg-fail/10"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                {t.nav.signOut}
              </button>
            </Row>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-papyrus">{title}</p>
        {hint && <p className="mt-0.5 text-xs text-dusty">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function LinkRow({
  href,
  icon: Icon,
  title,
  hint,
}: {
  href: string;
  icon: typeof User;
  title: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-papyrus">{title}</p>
          {hint && <p className="mt-0.5 text-xs text-dusty">{hint}</p>}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-dusty transition group-hover:text-gold rtl:rotate-180" aria-hidden />
    </Link>
  );
}
