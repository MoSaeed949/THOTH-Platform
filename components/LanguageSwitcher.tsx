"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { LOCALES, LOCALE_LABELS, LOCALE_TAGS, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/I18nProvider";

export function LanguageSwitcher({
  className = "",
  align = "start",
}: {
  className?: string;
  align?: "start" | "end";
}) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.language.change}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-obsidian-line px-3 py-2 text-xs text-dusty transition hover:border-gold hover:text-gold"
      >
        <Globe className="h-4 w-4" />
        <span>{LOCALE_TAGS[locale]}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t.language.label}
          className={`absolute z-30 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-obsidian-line bg-obsidian-soft p-1 shadow-gold ${
            align === "end" ? "end-0" : "start-0"
          } bottom-full mb-2 sm:bottom-auto sm:mb-0`}
        >
          {LOCALES.map((code) => {
            const active = code === locale;
            return (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(code)}
                  dir={code === "ar" ? "rtl" : "ltr"}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-gold/10 text-gold"
                      : "text-papyrus hover:bg-obsidian-softer"
                  }`}
                >
                  <span>{LOCALE_LABELS[code]}</span>
                  {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
