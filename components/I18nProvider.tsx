"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  dirFor,
  isLocale,
  type Locale,
} from "@/lib/i18n/config";
import { MESSAGES, type Messages } from "@/lib/i18n/locales";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "rtl" | "ltr";
  /** The full typed dictionary for the active locale — access as `t.nav.dashboard`. */
  t: Messages;
  /** Interpolate `{placeholder}` tokens in a template string. */
  fmt: (template: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Read the stored preference after mount (keeps SSR/first-paint deterministic
  // and avoids a hydration mismatch — mirrors the ThemeProvider pattern).
  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored) && stored !== locale) {
      setLocaleState(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep <html lang/dir> and storage in sync with the active locale.
  useEffect(() => {
    const dir = dirFor(locale);
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", dir);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);

  const fmt = useCallback(
    (template: string, vars?: Record<string, string | number>) => {
      if (!vars) return template;
      return template.replace(/\{(\w+)\}/g, (match, key) =>
        key in vars ? String(vars[key]) : match
      );
    },
    []
  );

  const value: I18nContextValue = {
    locale,
    setLocale,
    dir: dirFor(locale),
    t: MESSAGES[locale],
    fmt,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}

/** Inline script injected before hydration so the correct text direction and
 * language paint on the very first frame — no flash of the wrong layout
 * direction on load (critical for Arabic RTL). Mirrors themeInitScript. */
export const localeInitScript = `
(function() {
  try {
    var stored = window.localStorage.getItem('${LOCALE_STORAGE_KEY}');
    var rtl = ['ar'];
    var locale = ['en','ar','fr','de','es'].indexOf(stored) !== -1 ? stored : '${DEFAULT_LOCALE}';
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', rtl.indexOf(locale) !== -1 ? 'rtl' : 'ltr');
  } catch (e) {
    document.documentElement.setAttribute('lang', '${DEFAULT_LOCALE}');
    document.documentElement.setAttribute('dir', 'ltr');
  }
})();
`;
