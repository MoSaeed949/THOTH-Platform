import Link from "next/link";
import Image from "next/image";
import { WingedSunIcon, IbisQuillIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";

const FEATURES: { title: string; desc: string }[] = [
  { title: "Summaries", desc: "Turn dense notes into clear, structured pages." },
  { title: "Quizzes", desc: "Test yourself with questions drawn from your own material." },
  { title: "Flashcards", desc: "Review what tends to slip, on a schedule that adapts." },
  { title: "Study Plan", desc: "Lay out what to study and when, subject by subject." },
  { title: "AI Mentor", desc: "Ask questions and think out loud with Thoth himself." },
  { title: "Progress", desc: "See your study time, scores, and streaks in one place." },
  { title: "Pomodoro", desc: "Focused sessions, timed and logged automatically." },
  { title: "Achievements", desc: "Unlock cartouches as your habits take hold." },
  { title: "Revision Schedule", desc: "Know exactly what's due for review, and when." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-obsidian-line">
        <div className="sun-disc" />
        <div className="absolute right-6 top-6 z-10">
          <ThemeToggle />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-16 md:flex-row md:py-24">
          <div className="flex-1 text-center md:text-left">
            <div className="mb-6 flex items-center justify-center gap-3 text-gold md:justify-start">
              <IbisQuillIcon className="h-6 w-6" />
              <span className="font-display text-sm uppercase tracking-[0.3em]">Thoth</span>
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-papyrus md:text-6xl">
              The god of wisdom,
              <br />
              <span className="text-gold">now guiding your studies.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-dusty md:mx-0">
              Thoth is a study platform built around one loop: read, be tested, correct
              what you missed, and return to it until it holds. Summaries, quizzes,
              flashcards, and a mentor that actually knows what you've studied.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:justify-start justify-center">
              <Link
                href="/signup"
                className="rounded-full bg-gold px-8 py-3 font-semibold text-ink shadow-gold transition hover:bg-gold-soft"
              >
                Begin your studies
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-gold-dim px-8 py-3 text-papyrus transition hover:border-gold"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div className="relative flex-1">
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-full border-2 border-gold shadow-gold">
              <Image
                src="/images/thoth-hero.png"
                alt="Thoth, ibis-headed god of wisdom, writing on a papyrus scroll"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Loop explainer */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <WingedSunIcon className="mx-auto mb-6 h-8 w-40 text-gold-dim" />
        <h2 className="font-display text-2xl text-papyrus md:text-3xl">The Loop</h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 font-mono text-sm text-dusty">
          <span className="rounded-full border border-obsidian-line px-4 py-2">Read</span>
          <span className="text-gold-dim">→</span>
          <span className="rounded-full border border-obsidian-line px-4 py-2">Quiz</span>
          <span className="text-gold-dim">→</span>
          <span className="rounded-full border border-obsidian-line px-4 py-2">Correct</span>
          <span className="text-gold-dim">→</span>
          <span className="rounded-full border border-obsidian-line px-4 py-2">Revisit</span>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="glyph-divider mb-12" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="papyrus-card p-6">
              <h3 className="font-display text-lg text-gold">{f.title}</h3>
              <p className="mt-2 text-sm text-dusty">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-obsidian-line py-8 text-center text-xs text-dusty">
        Thoth — built for TestSprite Hackathon Season 3
      </footer>
    </main>
  );
}
