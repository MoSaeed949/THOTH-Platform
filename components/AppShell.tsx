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
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { IbisQuillIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/summary", label: "Summaries", icon: FileText },
  { href: "/quiz", label: "Quizzes", icon: ListChecks },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/study-plan", label: "Study Plan", icon: CalendarDays },
  { href: "/mentor", label: "AI Mentor", icon: MessageCircle },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/revision", label: "Revision", icon: Repeat },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-obsidian-line bg-obsidian-soft md:flex">
        <div className="flex items-center gap-2 border-b border-obsidian-line px-6 py-5">
          <IbisQuillIcon className="h-5 w-5 text-gold" />
          <span className="font-display text-lg tracking-wide text-papyrus">Thoth</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-gold/10 text-gold border border-gold-dim"
                    : "text-dusty hover:bg-obsidian-softer hover:text-papyrus"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mx-3 mb-3">
          <ThemeToggle className="w-full justify-center" />
        </div>
        <button
          onClick={handleLogout}
          className="mx-3 mb-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-dusty transition hover:bg-obsidian-softer hover:text-fail"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </aside>

      {/* Mobile top nav */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-obsidian-line bg-obsidian-soft px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <IbisQuillIcon className="h-5 w-5 text-gold" />
          <span className="font-display text-base text-papyrus">Thoth</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={handleLogout} className="text-dusty">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 pb-24 pt-20 md:px-10 md:pb-10 md:pt-10">{children}</main>

      {/* Mobile bottom nav — all sections in a horizontally scrollable row so
          Progress, Pomodoro, Achievements, and Revision stay reachable. */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex gap-1 overflow-x-auto border-t border-obsidian-line bg-obsidian-soft px-2 py-2 md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex shrink-0 flex-col items-center gap-0.5 px-3 py-1 text-[10px] ${
                active ? "text-gold" : "text-dusty"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
