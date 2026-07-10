"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ProgressRing } from "@/components/ProgressRing";
import { AnkhIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { format } from "date-fns";

type RevisionItem = { id: string; title: string; due_date: string; status: string };
type QuizAttempt = { id: string; score: number; total: number; created_at: string };
type StudyPlan = { id: string; subject: string; tasks: { title: string; done: boolean }[] };

export default function DashboardPage() {
  const supabase = createClient();
  const { t, fmt } = useI18n();
  const [name, setName] = useState<string>("");
  const [streak, setStreak] = useState(0);
  const [dueToday, setDueToday] = useState<RevisionItem[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      setName(profile?.full_name?.split(" ")[0] || "");

      const today = format(new Date(), "yyyy-MM-dd");

      const [{ data: due }, { data: attempts }, { data: studyPlans }, { data: pomodoros }] =
        await Promise.all([
          supabase
            .from("revision_items")
            .select("id, title, due_date, status")
            .eq("user_id", user.id)
            .eq("status", "pending")
            .lte("due_date", today)
            .order("due_date", { ascending: true }),
          supabase
            .from("quiz_attempts")
            .select("id, score, total, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase.from("study_plans").select("id, subject, tasks").eq("user_id", user.id),
          supabase
            .from("pomodoro_sessions")
            .select("id, completed_at")
            .eq("user_id", user.id)
            .gte("completed_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
        ]);

      setDueToday(due || []);
      setRecentAttempts(attempts || []);
      setPlans(studyPlans || []);
      setPomodoroCount(pomodoros?.length || 0);

      // Simple streak: count distinct recent days with any pomodoro session
      const { data: allSessions } = await supabase
        .from("pomodoro_sessions")
        .select("completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(60);

      if (allSessions) {
        const days = new Set(allSessions.map((s) => s.completed_at.slice(0, 10)));
        let count = 0;
        let cursor = new Date();
        while (days.has(format(cursor, "yyyy-MM-dd"))) {
          count++;
          cursor.setDate(cursor.getDate() - 1);
        }
        setStreak(count);
      }

      setLoading(false);
    })();
  }, []);

  const totalTasks = plans.reduce((sum, p) => sum + p.tasks.length, 0);
  const doneTasks = plans.reduce((sum, p) => sum + p.tasks.filter((t) => t.done).length, 0);
  const planProgress = totalTasks > 0 ? doneTasks / totalTasks : 0;

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-papyrus">
        {name ? fmt(t.dashboard.welcomeName, { name }) : t.dashboard.welcome}
      </h1>
      <p className="mt-1 text-dusty">{t.dashboard.subtitle}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="papyrus-card flex items-center gap-4 p-6">
          <AnkhIcon className="h-10 w-10 text-gold" />
          <div>
            <p className="text-2xl font-semibold text-papyrus">
              {fmt(streak === 1 ? t.dashboard.streakDay : t.dashboard.streakDays, { count: streak })}
            </p>
            <p className="text-sm text-dusty">{t.dashboard.streak}</p>
          </div>
        </div>

        <div className="papyrus-card flex items-center gap-4 p-6">
          <ProgressRing progress={planProgress} size={64} strokeWidth={6} />
          <div>
            <p className="text-2xl font-semibold text-papyrus">
              {doneTasks}/{totalTasks || 0}
            </p>
            <p className="text-sm text-dusty">{t.dashboard.planTasksDone}</p>
          </div>
        </div>

        <div className="papyrus-card flex items-center gap-4 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold font-display text-gold">
            {pomodoroCount}
          </div>
          <div>
            <p className="text-2xl font-semibold text-papyrus">{t.dashboard.focusSessions}</p>
            <p className="text-sm text-dusty">{t.dashboard.completedToday}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="papyrus-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-gold">{t.dashboard.dueForRevision}</h2>
            <Link href="/revision" className="text-xs text-dusty hover:text-gold">
              {t.common.viewAll}
            </Link>
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-dusty">{t.dashboard.loadingScrolls}</p>
          ) : dueToday.length === 0 ? (
            <p className="mt-4 text-sm text-dusty">{t.dashboard.nothingDue}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {dueToday.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-obsidian-line px-4 py-2 text-sm"
                >
                  <span className="text-papyrus">{item.title}</span>
                  <span className="text-dusty">{item.due_date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="papyrus-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-gold">{t.dashboard.recentQuizScores}</h2>
            <Link href="/quiz" className="text-xs text-dusty hover:text-gold">
              {t.common.viewAll}
            </Link>
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-dusty">{t.dashboard.loadingScrolls}</p>
          ) : recentAttempts.length === 0 ? (
            <p className="mt-4 text-sm text-dusty">{t.dashboard.noQuizzes}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentAttempts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-obsidian-line px-4 py-2 text-sm"
                >
                  <span className="text-papyrus">
                    {a.score}/{a.total}
                  </span>
                  <span className="text-dusty">{format(new Date(a.created_at), "MMM d")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { href: "/summary", label: t.dashboard.quickActions.newSummary },
          { href: "/quiz", label: t.dashboard.quickActions.takeQuiz },
          { href: "/flashcards", label: t.dashboard.quickActions.reviewCards },
          { href: "/pomodoro", label: t.dashboard.quickActions.startFocus },
          { href: "/mentor", label: t.dashboard.quickActions.askThoth },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="cartouche px-6 py-3 text-center text-sm text-papyrus transition hover:bg-gold/10"
          >
            {a.label}
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
