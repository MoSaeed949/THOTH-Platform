"use client";

import { WingedSunIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { useI18n } from "@/components/I18nProvider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="sun-disc" />
      <div className="relative">
        <WingedSunIcon className="mx-auto mb-8 h-10 w-48 text-gold-dim" />
        <p className="font-display text-6xl text-gold">404</p>
        <h1 className="mt-4 font-display text-2xl text-papyrus">{t.errors.notFoundTitle}</h1>
        <p className="mx-auto mt-2 max-w-sm text-dusty">{t.errors.notFoundBody}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/">{t.errors.goHome}</ButtonLink>
          <ButtonLink href="/dashboard" variant="secondary">
            {t.errors.goDashboard}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
