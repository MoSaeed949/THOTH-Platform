"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/components/I18nProvider";
import { format } from "date-fns";

type Def = { key: string; check: (s: Stats) => boolean };
type Stats = {
  summaries: number;
  quizzes: number;
  perfectScores: number;
  pomodoros: number;
  streak: number;
  maxDeckSize: number;
  maxPlanTasks: number;
};

const DEFS: Def[] = [
  { key: "first_scroll", check: (s) => s.summaries >= 1 },
  { key: "trial_of_knowledge", check: (s) => s.quizzes >= 1 },
  { key: "perfect_papyrus", check: (s) => s.perfectScores >= 1 },
  { key: "keeper_of_flame", check: (s) => s.pomodoros >= 5 },
  { key: "three_suns", check: (s) => s.streak >= 3 },
  { key: "seven_suns", check: (s) => s.streak >= 7 },
  { key: "architect_of_deck", check: (s) => s.maxDeckSize >= 10 },
  { key: "master_planner", check: (s) => s.maxPlanTasks >= 5 },
];

export default function AchievementsPage() {
  const supabase = createClient();
  const { t, fmt } = useI18n();
  const [unlocked, setUnlocked] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ count: summaries }, { data: attempts }, { data: pomodoros }, { data: decks }, { data: plans }, { data: existing }] =
        await Promise.all([
          supabase.from("summaries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("quiz_attempts").select("score, total").eq("user_id", user.id),
          supabase.from("pomodoro_sessions").select("completed_at").eq("user_id", user.id),
          supabase.from("flashcard_decks").select("id"),
          supabase.from("study_plans").select("tasks").eq("user_id", user.id),
          supabase.from("achievements").select("key, unlocked_at").eq("user_id", user.id),
        ]);

      let maxDeckSize = 0;
      if (decks) {
        for (const d of decks) {
          const { count } = await supabase
            .from("flashcards")
            .select("id", { count: "exact", head: true })
            .eq("deck_id", (d as any).id);
          maxDeckSize = Math.max(maxDeckSize, count || 0);
        }
      }

      const maxPlanTasks = (plans || []).reduce(
        (max, p: any) => Math.max(max, (p.tasks || []).length),
        0
      );

      const days = new Set((pomodoros || []).map((p) => p.completed_at.slice(0, 10)));
      let streak = 0;
      let cursor = new Date();
      while (days.has(format(cursor, "yyyy-MM-dd"))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }

      const stats: Stats = {
        summaries: summaries || 0,
        quizzes: attempts?.length || 0,
        perfectScores: (attempts || []).filter((a) => a.score === a.total).length,
        pomodoros: pomodoros?.length || 0,
        streak,
        maxDeckSize,
        maxPlanTasks,
      };

      const existingMap: Record<string, string> = {};
      (existing || []).forEach((e) => (existingMap[e.key] = e.unlocked_at));

      const newlyUnlocked = DEFS.filter((d) => d.check(stats) && !existingMap[d.key]);
      if (newlyUnlocked.length > 0) {
        await supabase
          .from("achievements")
          .insert(newlyUnlocked.map((d) => ({ user_id: user.id, key: d.key })));
      }

      const { data: refreshed } = await supabase
        .from("achievements")
        .select("key, unlocked_at")
        .eq("user_id", user.id);
      const map: Record<string, string> = {};
      (refreshed || []).forEach((e) => (map[e.key] = e.unlocked_at));
      setUnlocked(map);
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-papyrus">{t.achievements.title}</h1>
      <p className="mt-1 text-dusty">{t.achievements.subtitle}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {DEFS.map((d) => {
          const isUnlocked = !!unlocked[d.key];
          return (
            <div
              key={d.key}
              className={`cartouche flex items-center gap-4 px-6 py-4 ${
                isUnlocked ? "" : "opacity-40 grayscale"
              }`}
            >
              <div>
                <h2 className="font-display text-lg text-gold">{t.achievements.defs[d.key as keyof typeof t.achievements.defs].title}</h2>
                <p className="text-sm text-dusty">{t.achievements.defs[d.key as keyof typeof t.achievements.defs].desc}</p>
                {isUnlocked && (
                  <p className="mt-1 text-xs text-gold-dim">
                    {fmt(t.achievements.unlockedOn, { date: format(new Date(unlocked[d.key]), "MMM d, yyyy") })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {loading && <p className="mt-6 text-sm text-dusty">{t.achievements.loading}</p>}
    </AppShell>
  );
}
