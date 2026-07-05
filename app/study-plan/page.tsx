"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Trash2, Plus } from "lucide-react";

type Task = { title: string; done: boolean };
type Plan = { id: string; subject: string; tasks: Task[] };

export default function StudyPlanPage() {
  const supabase = createClient();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subject, setSubject] = useState("");
  const [taskDrafts, setTaskDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("study_plans")
      .select("id, subject, tasks")
      .order("created_at", { ascending: false });
    setPlans(data || []);
  }

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("study_plans").insert({ user_id: user.id, subject, tasks: [] });
    setSubject("");
    load();
  }

  async function addTask(plan: Plan) {
    const draft = taskDrafts[plan.id];
    if (!draft?.trim()) return;
    const tasks = [...plan.tasks, { title: draft, done: false }];
    await supabase.from("study_plans").update({ tasks }).eq("id", plan.id);
    setTaskDrafts({ ...taskDrafts, [plan.id]: "" });
    load();
  }

  async function toggleTask(plan: Plan, index: number) {
    const tasks = plan.tasks.map((t, i) => (i === index ? { ...t, done: !t.done } : t));
    await supabase.from("study_plans").update({ tasks }).eq("id", plan.id);
    load();
  }

  async function removeTask(plan: Plan, index: number) {
    const tasks = plan.tasks.filter((_, i) => i !== index);
    await supabase.from("study_plans").update({ tasks }).eq("id", plan.id);
    load();
  }

  async function deletePlan(id: string) {
    await supabase.from("study_plans").delete().eq("id", id);
    load();
  }

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-papyrus">Study Plan</h1>
      <p className="mt-1 text-dusty">Lay out what to study and when, subject by subject.</p>

      <form onSubmit={createPlan} className="papyrus-card mt-8 flex flex-col gap-3 p-6 sm:flex-row">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="New subject, e.g. Linear Algebra"
          className="flex-1 rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
        />
        <button className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-ink hover:bg-gold-soft">
          Add subject
        </button>
      </form>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {plans.map((plan) => {
          const done = plan.tasks.filter((t) => t.done).length;
          return (
            <div key={plan.id} className="papyrus-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg text-gold">{plan.subject}</h2>
                <button onClick={() => deletePlan(plan.id)} className="text-dusty hover:text-fail">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-dusty">
                {done}/{plan.tasks.length} tasks complete
              </p>

              <ul className="mt-4 space-y-2">
                {plan.tasks.map((t, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-sm">
                    <label className="flex flex-1 items-center gap-2 text-papyrus">
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => toggleTask(plan, i)}
                        className="h-4 w-4"
                        style={{ accentColor: "rgb(var(--c-gold))" }}
                      />
                      <span className={t.done ? "text-dusty line-through" : ""}>{t.title}</span>
                    </label>
                    <button onClick={() => removeTask(plan, i)} className="text-dusty hover:text-fail">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex gap-2">
                <input
                  value={taskDrafts[plan.id] || ""}
                  onChange={(e) => setTaskDrafts({ ...taskDrafts, [plan.id]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addTask(plan)}
                  placeholder="Add a task…"
                  className="flex-1 rounded-lg border border-obsidian-line bg-obsidian px-3 py-2 text-sm text-papyrus outline-none focus:border-gold"
                />
                <button
                  onClick={() => addTask(plan)}
                  className="rounded-lg border border-gold-dim px-3 text-papyrus hover:border-gold"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
