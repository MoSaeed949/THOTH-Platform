import { AuthForm } from "@/components/AuthForm";
import { WingedSunIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="sun-disc" />
      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle />
      </div>
      <div className="relative flex flex-col items-center">
        <WingedSunIcon className="mb-8 h-8 w-40 text-gold-dim" />
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
