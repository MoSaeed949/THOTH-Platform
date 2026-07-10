// Central i18n configuration. Adding a language is a two-step change:
//   1. create lib/i18n/locales/<code>.ts (typed against ./locales/en)
//   2. register it in LOCALES below and in ./locales/index.ts

export const LOCALES = ["en", "ar", "fr", "de", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

// Right-to-left languages. Everything else is treated as LTR.
export const RTL_LOCALES: readonly Locale[] = ["ar"];

// localStorage key (mirrors the theme provider's convention).
export const LOCALE_STORAGE_KEY = "thoth-locale";

// Endonyms (each language named in its own script) for the switcher.
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
};

// Short flags/tags shown in the compact switcher control.
export const LOCALE_TAGS: Record<Locale, string> = {
  en: "EN",
  ar: "AR",
  fr: "FR",
  de: "DE",
  es: "ES",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function dirFor(locale: Locale): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}
