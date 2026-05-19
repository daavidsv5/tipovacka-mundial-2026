"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Nesprávný email nebo heslo.");
      } else {
        router.push("/");
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen flex">

      {/* Levý panel – formulář */}
      <div className="flex flex-col w-full lg:w-[480px] shrink-0 bg-white px-10 py-10">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fifa-logo.webp" alt="FIFA WC 2026" width={48} height={48} className="object-contain" />
          <span className="text-gray-900 font-bold text-base">Tipovačka Mundial 2026</span>
        </div>

        {/* Formulář */}
        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Přihlásit se</h1>
          <p className="text-gray-400 text-sm mb-8">Zadej svůj email a heslo pro vstup</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tvuj@email.cz"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Heslo
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors shadow-sm mt-2"
            >
              {isPending ? "Přihlašuji..." : "Přihlásit se"}
            </button>
          </form>

          <p className="text-gray-400 text-xs mt-8">
            Přihlašovací údaje získáš od administrátora.
          </p>
        </div>
      </div>

      {/* Pravý panel – hero foto */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero.jpg"
          alt="FIFA World Cup 2026"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {/* Text dole */}
        <div className="absolute bottom-0 left-0 right-0 p-12 pb-14">
          <h2 className="text-white text-3xl font-black leading-snug mb-1 drop-shadow-lg">
            Mistrovství světa 2026
          </h2>
          <p className="text-white/70 text-sm">USA · Kanada · Mexiko</p>
        </div>
      </div>
    </div>
  );
}
