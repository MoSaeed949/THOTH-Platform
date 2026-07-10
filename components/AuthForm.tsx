"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/I18nProvider";
import { Button } from "@/components/ui/Button";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      setLoading(false);
      if (error) return setError(error.message);
      router.push("/dashboard");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setError(error.message);
      router.push("/dashboard");
      router.refresh();
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none transition focus:border-gold";

  return (
    <form onSubmit={handleSubmit} className="papyrus-card w-full max-w-sm p-8">
      <h1 className="font-display text-2xl text-gold">
        {mode === "login" ? t.auth.loginTitle : t.auth.signupTitle}
      </h1>
      <p className="mt-1 text-sm text-dusty">
        {mode === "login" ? t.auth.loginSubtitle : t.auth.signupSubtitle}
      </p>

      {mode === "signup" && (
        <label className="mt-6 block text-sm text-dusty">
          {t.auth.fullName}
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder={t.auth.fullNamePlaceholder}
          />
        </label>
      )}

      <label className="mt-4 block text-sm text-dusty">
        {t.auth.email}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder={t.auth.emailPlaceholder}
        />
      </label>

      <label className="mt-4 block text-sm text-dusty">
        {t.auth.password}
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder={t.auth.passwordPlaceholder}
        />
      </label>

      {error && (
        <p className="mt-4 text-sm text-fail" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} fullWidth className="mt-6">
        {loading ? t.auth.pleaseWait : mode === "login" ? t.auth.signIn : t.auth.createAccount}
      </Button>

      <p className="mt-4 text-center text-sm text-dusty">
        {mode === "login" ? (
          <>
            {t.auth.newHere}{" "}
            <Link href="/signup" className="text-gold hover:underline">
              {t.auth.createOne}
            </Link>
          </>
        ) : (
          <>
            {t.auth.alreadyHave}{" "}
            <Link href="/login" className="text-gold hover:underline">
              {t.auth.signInLink}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
