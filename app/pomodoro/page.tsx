"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ProgressRing } from "@/components/ProgressRing";
import { EyeOfHorusIcon } from "@/components/icons";

const PRESETS = [
  { label: "Focus", minutes: 25 },
  { label: "Short break", minutes: 5 },
  { label: "Long break", minutes: 15 },
];

export default function PomodoroPage() {
  const supabase = createClient();
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadToday();
  }, []);

  async function loadToday() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("pomodoro_sessions")
      .select("id")
      .eq("user_id", user.id)
      .gte("completed_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());
    setSessionsToday(data?.length || 0);
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            handleComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  async function handleComplete() {
    setRunning(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("pomodoro_sessions").insert({
        user_id: user.id,
        duration_minutes: durationMinutes,
      });
      loadToday();
    }
  }

  function selectPreset(minutes: number) {
    setRunning(false);
    setDurationMinutes(minutes);
    setSecondsLeft(minutes * 60);
  }

  function toggle() {
    if (secondsLeft === 0) {
      setSecondsLeft(durationMinutes * 60);
    }
    setRunning(!running);
  }

  function reset() {
    setRunning(false);
    setSecondsLeft(durationMinutes * 60);
  }

  const progress = 1 - secondsLeft / (durationMinutes * 60);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-papyrus">Pomodoro</h1>
      <p className="mt-1 text-dusty">Focused sessions, timed and logged automatically.</p>

      <div className="mt-8 flex flex-col items-center">
        <EyeOfHorusIcon className="mb-6 h-10 w-16 text-gold-dim" />

        <ProgressRing progress={progress} size={260} strokeWidth={12} label={`${mm}:${ss}`} sublabel={`${durationMinutes} min`} />

        <div className="mt-8 flex gap-3">
          <button
            onClick={toggle}
            className="rounded-full bg-gold px-10 py-3 font-semibold text-ink hover:bg-gold-soft"
          >
            {running ? "Pause" : secondsLeft === 0 ? "Start again" : "Start"}
          </button>
          <button
            onClick={reset}
            className="rounded-full border border-gold-dim px-6 py-3 text-papyrus hover:border-gold"
          >
            Reset
          </button>
        </div>

        <div className="mt-8 flex gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => selectPreset(p.minutes)}
              className={`rounded-full border px-4 py-2 text-xs transition ${
                durationMinutes === p.minutes
                  ? "border-gold text-gold"
                  : "border-obsidian-line text-dusty hover:border-gold-dim"
              }`}
            >
              {p.label} · {p.minutes}m
            </button>
          ))}
        </div>

        <p className="mt-8 text-sm text-dusty">
          {sessionsToday} focus session{sessionsToday === 1 ? "" : "s"} completed today
        </p>
      </div>
    </AppShell>
  );
}
