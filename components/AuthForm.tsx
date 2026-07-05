"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const supabase = createClient();
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

  return (
    <form onSubmit={handleSubmit} className="papyrus-card w-full max-w-sm p-8">
      <h1 className="font-display text-2xl text-gold">
        {mode === "login" ? "Enter the Hall" : "Begin Your Studies"}
      </h1>
      <p className="mt-1 text-sm text-dusty">
        {mode === "login"
          ? "Sign in to return to your path."
          : "Create an account to start with Thoth."}
      </p>

      {mode === "signup" && (
        <label className="mt-6 block text-sm text-dusty">
          Full name
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
            placeholder="Your name"
          />
        </label>
      )}

      <label className="mt-4 block text-sm text-dusty">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
          placeholder="you@example.com"
        />
      </label>

      <label className="mt-4 block text-sm text-dusty">
        Password
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
          placeholder="••••••••"
        />
      </label>

      {error && <p className="mt-4 text-sm text-fail">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-gold py-2.5 font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-50"
      >
        {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </button>

      <p className="mt-4 text-center text-sm text-dusty">
        {mode === "login" ? (
          <>
            New here?{" "}
            <a href="/signup" className="text-gold hover:underline">
              Create an account
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a href="/login" className="text-gold hover:underline">
              Sign in
            </a>
          </>
        )}
      </p>
    </form>
  );
}
