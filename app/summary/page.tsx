"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { format } from "date-fns";
import Link from "next/link";
import { AttachmentButton, AttachmentThumbnails, type AttachedImage } from "@/components/AttachmentButton";
import { useI18n } from "@/components/I18nProvider";

type Summary = {
  id: string;
  title: string;
  summary_text: string;
  source_text: string;
  created_at: string;
};

export default function SummaryPage() {
  const supabase = createClient();
  const { t, fmt } = useI18n();
  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [selected, setSelected] = useState<Summary | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  async function loadSummaries() {
    const { data } = await supabase
      .from("summaries")
      .select("id, title, summary_text, source_text, created_at")
      .order("created_at", { ascending: false });
    setSummaries(data || []);
    setLoadingList(false);
  }

  useEffect(() => {
    loadSummaries();
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!sourceText.trim() && images.length === 0) {
      setError(t.summary.errorEmpty);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          sourceText,
          images: images.map(({ mediaType, data }) => ({ mediaType, data })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.summary.errorGenerate);
      setSelected(data.summary);
      setTitle("");
      setSourceText("");
      setImages([]);
      loadSummaries();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-papyrus">{t.summary.title}</h1>
      <p className="mt-1 text-dusty">{t.summary.subtitle}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <form onSubmit={handleGenerate} className="papyrus-card p-6 lg:col-span-2">
          <label className="block text-sm text-dusty">
            {t.summary.titleLabel}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.summary.titlePlaceholder}
              className="mt-1 w-full rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
            />
          </label>
          <label className="mt-4 block text-sm text-dusty">
            {t.summary.materialLabel}
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={10}
              placeholder={t.summary.materialPlaceholder}
              className="mt-1 w-full rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
            />
          </label>

          <div className="mt-3">
            <AttachmentThumbnails images={images} onRemove={(id) => setImages((imgs) => imgs.filter((i) => i.id !== id))} />
            <div className="flex items-center gap-2">
              <AttachmentButton
                onImageAdd={(img) => setImages((imgs) => [...imgs, img])}
                onTextExtracted={(text, filename) =>
                  setSourceText((prev) => (prev ? `${prev}\n\n--- ${filename} ---\n${text}` : text))
                }
              />
              <span className="text-xs text-dusty">{t.summary.attachHint}</span>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-fail">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-full bg-gold py-2.5 font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-50"
          >
            {loading ? t.summary.generating : t.summary.generate}
          </button>
        </form>

        <div className="lg:col-span-3">
          {selected ? (
            <div className="papyrus-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-gold">{selected.title}</h2>
                <button onClick={() => setSelected(null)} className="text-xs text-dusty hover:text-gold">
                  {t.common.close}
                </button>
              </div>
              <div className="prose prose-invert mt-4 max-w-none whitespace-pre-wrap text-sm text-papyrus">
                {selected.summary_text}
              </div>
              <Link
                href={{ pathname: "/quiz", query: { summaryId: selected.id } }}
                className="mt-6 inline-block rounded-full border border-gold-dim px-6 py-2 text-sm text-papyrus hover:border-gold"
              >
                {t.summary.turnIntoQuiz}
              </Link>
            </div>
          ) : (
            <div className="papyrus-card p-6">
              <h2 className="font-display text-lg text-gold">{t.summary.yourSummaries}</h2>
              {loadingList ? (
                <p className="mt-4 text-sm text-dusty">{t.summary.loadingScrolls}</p>
              ) : summaries.length === 0 ? (
                <p className="mt-4 text-sm text-dusty">{t.summary.noSummaries}</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {summaries.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => setSelected(s)}
                        className="flex w-full items-center justify-between rounded-lg border border-obsidian-line px-4 py-3 text-left text-sm transition hover:border-gold"
                      >
                        <span className="text-papyrus">{s.title}</span>
                        <span className="text-dusty">{format(new Date(s.created_at), "MMM d")}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
