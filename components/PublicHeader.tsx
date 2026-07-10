"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IbisQuillIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ButtonLink } from "@/components/ui/Button";
import { useI18n } from "@/components/I18nProvider";

/** Slim header for public marketing pages (pricing, contact). The landing page
 * keeps its own bespoke hero header. */
export function PublicHeader() {
  const { t } = useI18n();
  const supabase = createClient();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, [supabase]);

  return (
    <header className="sticky top-0 z-30 border-b border-obsidian-line bg-obsidian/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <IbisQuillIcon className="h-5 w-5 text-gold" />
          <span className="font-display text-lg text-papyrus">{t.common.appName}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-dusty sm:flex" aria-label={t.nav.menu}>
          <Link href="/pricing" className="transition hover:text-gold">
            {t.nav.pricing}
          </Link>
          <Link href="/contact" className="transition hover:text-gold">
            {t.nav.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher align="end" />
          <ThemeToggle />
          {signedIn ? (
            <ButtonLink href="/dashboard" size="sm">
              {t.nav.dashboard}
            </ButtonLink>
          ) : (
            signedIn === false && (
              <ButtonLink href="/login" size="sm" variant="secondary">
                {t.auth.signIn}
              </ButtonLink>
            )
          )}
        </div>
      </div>
    </header>
  );
}
