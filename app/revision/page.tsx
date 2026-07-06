"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { format, isBefore, startOfToday } from "date-fns";
import { Trash2 } from "lucide-react";

type Item = { id: string; title: string; due_date: string; status: "pending" | "done" };

export default function RevisionPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("revision_items")
      .select("id, title, due_date, status")
      .order("due_date", { ascending: true });
    if (error) {
      setError(error.message);
      return;
    }
    setItems(data || []);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be signed in to schedule a revision.");
      return;
    }
    const { error } = await supabase
      .from("revision_items")
      .insert({ user_id: user.id, title, due_date: dueDate });
    if (error) {
      setError(error.message);
      return;
    }
    setTitle("");
    load();
  }

  async function toggleDone(item: Item) {
    await supabase
      .from("revision_items")
      .update({ status: item.status === "done" ? "pending" : "done" })
      .eq("id", item.id);
    load();
  }

  async function remove(id: string) {
    await supabase.from("revision_items").delete().eq("id", id);
    load();
  }

  const today = startOfToday();

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-papyrus">Revision Schedule</h1>
      <p className="mt-1 text-dusty">Know exactly what's due for review, and when.</p>

      <form onSubmit={addItem} className="papyrus-card mt-8 flex flex-col gap-3 p-6 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What to revise, e.g. Chapter 4 formulas"
          className="flex-1 rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
        />
        <button className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-ink hover:bg-gold-soft">
          Schedule
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg border border-fail bg-fail/5 px-4 py-2.5 text-sm text-fail">
          Couldn&apos;t save that revision item: {error}
        </p>
      )}

      <div className="mt-6 space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-dusty">Nothing scheduled yet. Add your first revision item above.</p>
        )}
        {items.map((item) => {
          const overdue = item.status === "pending" && isBefore(new Date(item.due_date), today);
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-lg border px-5 py-3 ${
                overdue ? "border-fail bg-fail/5" : "border-obsidian-line"
              }`}
            >
              <label className="flex flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.status === "done"}
                  onChange={() => toggleDone(item)}
                  className="h-4 w-4"
                  style={{ accentColor: "rgb(var(--c-gold))" }}
                />
                <span className={item.status === "done" ? "text-dusty line-through" : "text-papyrus"}>
                  {item.title}
                </span>
              </label>
              <span className={`mr-4 text-xs ${overdue ? "text-fail" : "text-dusty"}`}>
                {format(new Date(item.due_date), "MMM d, yyyy")}
                {overdue && " · overdue"}
              </span>
              <button onClick={() => remove(item.id)} className="text-dusty hover:text-fail">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
