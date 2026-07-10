"use client";

import { useEffect } from "react";
import { WingedSunIcon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useI18n } from "@/components/I18nProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="sun-disc" />
      <div className="relative">
        <WingedSunIcon className="mx-auto mb-8 h-10 w-48 text-gold-dim" />
        <h1 className="font-display text-2xl text-papyrus">{t.errors.genericTitle}</h1>
        <p className="mx-auto mt-2 max-w-sm text-dusty">{t.errors.genericBody}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>{t.errors.tryAgain}</Button>
          <ButtonLink href="/dashboard" variant="secondary">
            {t.errors.goDashboard}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
