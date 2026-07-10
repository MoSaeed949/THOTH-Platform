"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/components/I18nProvider";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, subDays } from "date-fns";

export default function ProgressPage() {
  const supabase = createClient();
  const { t } = useI18n();
  const [quizData, setQuizData] = useState<{ date: string; pct: number }[]>([]);
  const [focusData, setFocusData] = useState<{ date: string; minutes: number }[]>([]);
  const [totals, setTotals] = useState({ quizzes: 0, avgScore: 0, focusMinutes: 0 });

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const since = subDays(new Date(), 13).toISOString();

      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("score, total, created_at")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      const { data: sessions } = await supabase
        .from("pomodoro_sessions")
        .select("duration_minutes, completed_at")
        .eq("user_id", user.id)
        .gte("completed_at", since);

      const days = Array.from({ length: 14 }).map((_, i) =>
        format(subDays(new Date(), 13 - i), "MMM d")
      );

      const quizByDay: Record<string, { sum: number; count: number }> = {};
      (attempts || []).forEach((a) => {
        const day = format(new Date(a.created_at), "MMM d");
        const pct = (a.score / a.total) * 100;
        if (!quizByDay[day]) quizByDay[day] = { sum: 0, count: 0 };
        quizByDay[day].sum += pct;
        quizByDay[day].count += 1;
      });
      setQuizData(
        days.map((d) => ({
          date: d,
          pct: quizByDay[d] ? Math.round(quizByDay[d].sum / quizByDay[d].count) : 0,
        }))
      );

      const focusByDay: Record<string, number> = {};
      (sessions || []).forEach((s) => {
        const day = format(new Date(s.completed_at), "MMM d");
        focusByDay[day] = (focusByDay[day] || 0) + s.duration_minutes;
      });
      setFocusData(days.map((d) => ({ date: d, minutes: focusByDay[d] || 0 })));

      const totalScore = (attempts || []).reduce((s, a) => s + a.score / a.total, 0);
      setTotals({
        quizzes: attempts?.length || 0,
        avgScore: attempts?.length ? Math.round((totalScore / attempts.length) * 100) : 0,
        focusMinutes: (sessions || []).reduce((s, x) => s + x.duration_minutes, 0),
      });
    })();
  }, []);

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-papyrus">{t.progress.title}</h1>
      <p className="mt-1 text-dusty">{t.progress.subtitle}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="papyrus-card p-6 text-center">
          <p className="font-display text-3xl text-gold">{totals.quizzes}</p>
          <p className="text-sm text-dusty">{t.progress.quizzes14d}</p>
        </div>
        <div className="papyrus-card p-6 text-center">
          <p className="font-display text-3xl text-gold">{totals.avgScore}%</p>
          <p className="text-sm text-dusty">{t.progress.avgScore}</p>
        </div>
        <div className="papyrus-card p-6 text-center">
          <p className="font-display text-3xl text-gold">{totals.focusMinutes}</p>
          <p className="text-sm text-dusty">{t.progress.focusMinutes}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="papyrus-card p-6">
          <h2 className="font-display text-lg text-gold">{t.progress.quizTrend}</h2>
          <div className="mt-4 h-64 chart-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizData}>
                <CartesianGrid stroke="rgb(var(--c-obsidian-line))" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="rgb(var(--c-dusty))" fontSize={11} />
                <YAxis stroke="rgb(var(--c-dusty))" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "rgb(var(--c-obsidian-soft))",
                    border: "1px solid rgb(var(--c-obsidian-line))",
                    color: "rgb(var(--c-papyrus))",
                  }}
                />
                <Line type="monotone" dataKey="pct" stroke="rgb(var(--c-gold))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="papyrus-card p-6">
          <h2 className="font-display text-lg text-gold">{t.progress.focusPerDay}</h2>
          <div className="mt-4 h-64 chart-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusData}>
                <CartesianGrid stroke="rgb(var(--c-obsidian-line))" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="rgb(var(--c-dusty))" fontSize={11} />
                <YAxis stroke="rgb(var(--c-dusty))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "rgb(var(--c-obsidian-soft))",
                    border: "1px solid rgb(var(--c-obsidian-line))",
                    color: "rgb(var(--c-papyrus))",
                  }}
                />
                <Bar dataKey="minutes" fill="rgb(var(--c-lapis))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
