import { AuthForm } from "@/components/AuthForm";
import { WingedSunIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function SignupPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="sun-disc" />
      <div className="absolute end-6 top-6 z-10 flex items-center gap-2">
        <LanguageSwitcher align="end" />
        <ThemeToggle />
      </div>
      <div className="relative flex flex-col items-center">
        <WingedSunIcon className="mb-8 h-8 w-40 text-gold-dim" />
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
