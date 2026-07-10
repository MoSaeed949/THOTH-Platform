"use client";

import Link from "next/link";
import { IbisQuillIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { siteConfig } from "@/lib/config/site";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-obsidian-line bg-obsidian-soft/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2">
            <IbisQuillIcon className="h-5 w-5 text-gold" />
            <span className="font-display text-lg text-papyrus">{t.common.appName}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-dusty">{t.footer.tagline}</p>
        </div>

        <nav aria-label={t.footer.product}>
          <h2 className="font-display text-sm text-gold">{t.footer.product}</h2>
          <ul className="mt-3 space-y-2 text-sm text-dusty">
            <li>
              <Link href="/pricing" className="transition hover:text-papyrus">
                {t.footer.pricing}
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="transition hover:text-papyrus">
                {t.footer.dashboard}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t.footer.company}>
          <h2 className="font-display text-sm text-gold">{t.footer.company}</h2>
          <ul className="mt-3 space-y-2 text-sm text-dusty">
            <li>
              <Link href="/contact" className="transition hover:text-papyrus">
                {t.footer.contact}
              </Link>
            </li>
            <li>
              <a href={`mailto:${siteConfig.contact.email}`} className="transition hover:text-papyrus">
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label={t.footer.legal}>
          <h2 className="font-display text-sm text-gold">{t.footer.legal}</h2>
          <ul className="mt-3 space-y-2 text-sm text-dusty">
            <li>
              <span className="opacity-60">{t.footer.privacy}</span>
            </li>
            <li>
              <span className="opacity-60">{t.footer.terms}</span>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-obsidian-line px-6 py-6 text-center text-xs text-dusty">
        © {year} {t.common.appName}. {t.footer.rights}
      </div>
    </footer>
  );
}
