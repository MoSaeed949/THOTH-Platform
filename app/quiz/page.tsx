"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { format } from "date-fns";
import { AttachmentButton, AttachmentThumbnails, type AttachedImage } from "@/components/AttachmentButton";
import { useI18n } from "@/components/I18nProvider";

type Question = {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};
type Quiz = { id: string; title: string; questions: Question[]; created_at: string };

function QuizInner() {
  const supabase = createClient();
  const { t, fmt } = useI18n();
  const searchParams = useSearchParams();
  const summaryId = searchParams.get("summaryId");

  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      if (summaryId) {
        const { data } = await supabase
          .from("summaries")
          .select("title, summary_text")
          .eq("id", summaryId)
          .single();
        if (data) {
          setTitle(fmt(t.quiz.quizForSummary, { title: data.title }));
          setSourceText(data.summary_text);
        }
      }
      loadQuizzes();
    })();
  }, [summaryId]);

  async function loadQuizzes() {
    const { data } = await supabase
      .from("quizzes")
      .select("id, title, questions, created_at")
      .order("created_at", { ascending: false });
    setQuizzes(data || []);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!sourceText.trim() && images.length === 0) {
      setError(t.quiz.errorEmpty);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          sourceText,
          summaryId,
          numQuestions,
          images: images.map(({ mediaType, data }) => ({ mediaType, data })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.quiz.errorGenerate);
      startQuiz(data.quiz);
      setImages([]);
      loadQuizzes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startQuiz(quiz: Quiz) {
    setActiveQuiz(quiz);
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setSubmitted(false);
  }

  async function handleSubmitQuiz() {
    if (!activeQuiz) return;
    const score = answers.reduce(
      (sum, a, i) => sum + (a === activeQuiz.questions[i].correct_index ? 1 : 0),
      0
    );
    setSubmitted(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        quiz_id: activeQuiz.id,
        score,
        total: activeQuiz.questions.length,
        answers,
      });
    }
  }

  const score = activeQuiz
    ? answers.reduce((s, a, i) => s + (a === activeQuiz.questions[i].correct_index ? 1 : 0), 0)
    : 0;

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-papyrus">{t.quiz.title}</h1>
      <p className="mt-1 text-dusty">{t.quiz.subtitle}</p>

      {activeQuiz ? (
        <div className="mt-8 papyrus-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-gold">{activeQuiz.title}</h2>
            <button onClick={() => setActiveQuiz(null)} className="text-xs text-dusty hover:text-gold">
              {t.quiz.backToQuizzes}
            </button>
          </div>

          <div className="mt-6 space-y-8">
            {activeQuiz.questions.map((q, qi) => (
              <div key={qi}>
                <p className="font-medium text-papyrus">
                  {qi + 1}. {q.question}
                </p>
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = answers[qi] === oi;
                    const isCorrect = submitted && oi === q.correct_index;
                    const isWrongSelected = submitted && isSelected && oi !== q.correct_index;
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() => {
                          const next = [...answers];
                          next[qi] = oi;
                          setAnswers(next);
                        }}
                        className={`block w-full rounded-lg border px-4 py-2.5 text-left text-sm transition ${
                          isCorrect
                            ? "border-lapis-soft bg-lapis/10 text-papyrus"
                            : isWrongSelected
                            ? "border-fail bg-fail/10 text-papyrus"
                            : isSelected
                            ? "border-gold bg-gold/10 text-papyrus"
                            : "border-obsidian-line text-dusty hover:border-gold-dim"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="mt-2 text-xs text-dusty">{q.explanation}</p>
                )}
              </div>
            ))}
          </div>

          {submitted ? (
            <div className="mt-8 rounded-lg border border-gold-dim bg-gold/5 p-4 text-center">
              <p className="font-display text-2xl text-gold">
                {score}/{activeQuiz.questions.length}
              </p>
              <p className="text-sm text-dusty">{t.quiz.scoreRecorded}</p>
            </div>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={answers.includes(-1)}
              className="mt-8 w-full rounded-full bg-gold py-2.5 font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-40"
            >
              {t.quiz.submitAnswers}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <form onSubmit={handleGenerate} className="papyrus-card p-6 lg:col-span-2">
            <label className="block text-sm text-dusty">
              {t.quiz.titleLabel}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.quiz.titlePlaceholder}
                className="mt-1 w-full rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
              />
            </label>
            <label className="mt-4 block text-sm text-dusty">
              {t.quiz.materialLabel}
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={8}
                placeholder={t.quiz.materialPlaceholder}
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
                <span className="text-xs text-dusty">{t.quiz.attachHint}</span>
              </div>
            </div>

            <label className="mt-4 block text-sm text-dusty">
              {t.quiz.numQuestions}
              <input
                type="number"
                min={3}
                max={15}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
              />
            </label>
            {error && <p className="mt-3 text-sm text-fail">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-full bg-gold py-2.5 font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-50"
            >
              {loading ? t.quiz.generating : t.quiz.generate}
            </button>
          </form>

          <div className="papyrus-card p-6 lg:col-span-3">
            <h2 className="font-display text-lg text-gold">{t.quiz.yourQuizzes}</h2>
            {quizzes.length === 0 ? (
              <p className="mt-4 text-sm text-dusty">{t.quiz.noQuizzes}</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {quizzes.map((q) => (
                  <li key={q.id}>
                    <button
                      onClick={() => startQuiz(q)}
                      className="flex w-full items-center justify-between rounded-lg border border-obsidian-line px-4 py-3 text-left text-sm transition hover:border-gold"
                    >
                      <span className="text-papyrus">{q.title}</span>
                      <span className="text-dusty">{format(new Date(q.created_at), "MMM d")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={null}>
      <QuizInner />
    </Suspense>
  );
}
