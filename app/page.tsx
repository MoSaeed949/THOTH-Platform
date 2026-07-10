"use client";

import Image from "next/image";
import { WingedSunIcon, IbisQuillIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ButtonLink } from "@/components/ui/Button";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/components/I18nProvider";
import type { Messages } from "@/lib/i18n/locales";

const FEATURE_KEYS: (keyof Messages["home"]["features"])[] = [
  "summaries",
  "quizzes",
  "flashcards",
  "studyPlan",
  "mentor",
  "progress",
  "pomodoro",
  "achievements",
  "revision",
];

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-obsidian-line">
        <div className="sun-disc" />
        <div className="absolute end-6 top-6 z-10 flex items-center gap-2">
          <LanguageSwitcher align="end" />
          <ThemeToggle />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-16 md:flex-row md:py-24">
          <div className="flex-1 text-center md:text-start">
            <div className="mb-6 flex items-center justify-center gap-3 text-gold md:justify-start">
              <IbisQuillIcon className="h-6 w-6" />
              <span className="font-display text-sm uppercase tracking-[0.3em]">{t.home.badge}</span>
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-papyrus md:text-6xl">
              {t.home.heroTitleLine1}
              <br />
              <span className="text-gold">{t.home.heroTitleAccent}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-dusty md:mx-0">{t.home.heroDescription}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start">
              <ButtonLink href="/signup" size="lg">
                {t.home.ctaPrimary}
              </ButtonLink>
              <ButtonLink href="/login" size="lg" variant="secondary">
                {t.home.ctaSecondary}
              </ButtonLink>
            </div>
          </div>

          <div className="relative flex-1">
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-full border-2 border-gold shadow-gold">
              <Image
                src="/images/thoth-hero.png"
                alt={t.home.heroImageAlt}
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
        <h2 className="font-display text-2xl text-papyrus md:text-3xl">{t.home.loopTitle}</h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 font-mono text-sm text-dusty">
          <span className="rounded-full border border-obsidian-line px-4 py-2">{t.home.loopRead}</span>
          <span className="text-gold-dim dir-flip">→</span>
          <span className="rounded-full border border-obsidian-line px-4 py-2">{t.home.loopQuiz}</span>
          <span className="text-gold-dim dir-flip">→</span>
          <span className="rounded-full border border-obsidian-line px-4 py-2">{t.home.loopCorrect}</span>
          <span className="text-gold-dim dir-flip">→</span>
          <span className="rounded-full border border-obsidian-line px-4 py-2">{t.home.loopRevisit}</span>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="glyph-divider mb-12" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_KEYS.map((key) => (
            <div key={key} className="papyrus-card p-6 transition hover:border-gold-dim">
              <h3 className="font-display text-lg text-gold">{t.home.features[key].title}</h3>
              <p className="mt-2 text-sm text-dusty">{t.home.features[key].desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
