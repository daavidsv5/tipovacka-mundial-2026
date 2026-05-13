"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
      {/* Left panel – hero */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-[#0a1628]">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-700/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/15 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/[0.04]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-white/[0.04]" />

        <div className="relative z-10 flex flex-col flex-1 p-14 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <span className="text-xl leading-none">⚽</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Tipovačka Mundial</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-slate-400 mb-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Turnaj začíná 11. června 2026
            </div>
            <h1 className="text-6xl font-black text-white leading-none mb-5 tracking-tight">
              Tipovačka<br />
              <span className="text-blue-400">Mundial 2026</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-sm leading-relaxed">
              Mistrovství světa ve fotbale · USA, Kanada, Mexiko
            </p>

            <div className="mt-14 grid grid-cols-3 gap-4 max-w-sm">
              {[
                { label: "Týmů", value: "48" },
                { label: "Zápasů", value: "104" },
                { label: "Skupin", value: "12" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
                  <div className="text-3xl font-black text-white">{value}</div>
                  <div className="text-slate-500 text-sm mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-slate-700 text-sm">© 2026 Tipovačka Mundial · Soukromá soutěž</div>
        </div>
      </div>

      {/* Right panel – form (bílé) */}
      <div className="flex-1 lg:max-w-[460px] flex flex-col items-center justify-center bg-white p-8 border-l border-gray-200">
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/25">
            <span className="text-3xl">⚽</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tipovačka Mundial 2026</h1>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900">Přihlásit se</h2>
            <p className="text-gray-500 mt-2">Zadej svůj email a heslo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tvuj@email.cz"
                className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Heslo
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-colors shadow-sm mt-2"
            >
              {isPending ? "Přihlašuji..." : "Přihlásit se"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
            Přihlašovací údaje získáš od administrátora.
          </p>
        </div>
      </div>
    </div>
  );
}
