"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  ListChecks,
  Layers,
  CalendarDays,
  MessageCircle,
  LineChart,
  Timer,
  Award,
  Repeat,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { IbisQuillIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/components/I18nProvider";
import type { Messages } from "@/lib/i18n/locales";

type NavItem = { href: string; key: keyof Messages["nav"]; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/dashboard", key: "dashboard", icon: LayoutGrid },
  { href: "/summary", key: "summaries", icon: FileText },
  { href: "/quiz", key: "quizzes", icon: ListChecks },
  { href: "/flashcards", key: "flashcards", icon: Layers },
  { href: "/study-plan", key: "studyPlan", icon: CalendarDays },
  { href: "/mentor", key: "mentor", icon: MessageCircle },
  { href: "/progress", key: "progress", icon: LineChart },
  { href: "/pomodoro", key: "pomodoro", icon: Timer },
  { href: "/achievements", key: "achievements", icon: Award },
  { href: "/revision", key: "revision", icon: Repeat },
  { href: "/settings", key: "settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-obsidian-line bg-obsidian-soft md:flex">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 border-b border-obsidian-line px-6 py-5"
        >
          <IbisQuillIcon className="h-5 w-5 text-gold" />
          <span className="font-display text-lg tracking-wide text-papyrus">{t.common.appName}</span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label={t.nav.menu}>
          {NAV.map(({ href, key, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-gold/10 text-gold border border-gold-dim"
                    : "text-dusty hover:bg-obsidian-softer hover:text-papyrus"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {t.nav[key]}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-obsidian-line px-3 py-3">
          <LanguageSwitcher className="w-full" />
          <ThemeToggle className="w-full justify-center" />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-dusty transition hover:bg-obsidian-softer hover:text-fail"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            {t.nav.signOut}
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-obsidian-line bg-obsidian-soft px-4 py-3 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <IbisQuillIcon className="h-5 w-5 text-gold" />
          <span className="font-display text-base text-papyrus">{t.common.appName}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher align="end" />
          <ThemeToggle />
          <button onClick={handleLogout} className="text-dusty" aria-label={t.nav.signOut}>
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 pb-24 pt-20 md:px-10 md:pb-10 md:pt-10">{children}</main>

      {/* Mobile bottom nav — all sections in a horizontally scrollable row so
          Progress, Pomodoro, Achievements, and Revision stay reachable. */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex gap-1 overflow-x-auto border-t border-obsidian-line bg-obsidian-soft px-2 py-2 md:hidden"
        aria-label={t.nav.menu}
      >
        {NAV.map(({ href, key, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={t.nav[key]}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 flex-col items-center gap-0.5 px-3 py-1 text-[10px] ${
                active ? "text-gold" : "text-dusty"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {t.nav[key]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
