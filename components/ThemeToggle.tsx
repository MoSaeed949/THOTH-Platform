"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useI18n } from "@/components/I18nProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? t.theme.switchToLight : t.theme.switchToDark}
      className={`flex items-center gap-2 rounded-full border border-obsidian-line px-3 py-2 text-xs text-dusty transition hover:border-gold hover:text-gold ${className}`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{theme === "dark" ? t.theme.light : t.theme.dark}</span>
    </button>
  );
}
