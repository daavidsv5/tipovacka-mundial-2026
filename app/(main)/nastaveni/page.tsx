"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, KeyRound, Check } from "lucide-react";
import { changePassword } from "@/lib/actions/user";

export default function NastaveniPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (next !== confirm) {
      setError("Nová hesla se neshodují.");
      return;
    }

    startTransition(async () => {
      const result = await changePassword(current, next);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setCurrent("");
        setNext("");
        setConfirm("");
      }
    });
  }

  const PasswordInput = ({
    id, label, value, onChange, show, onToggle, placeholder,
  }: {
    id: string; label: string; value: string; onChange: (v: string) => void;
    show: boolean; onToggle: () => void; placeholder: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-11 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <KeyRound size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Změna hesla</h1>
          <p className="text-gray-400 text-sm">Zadej současné a nové heslo</p>
        </div>
      </div>

      <div className="bg-white border border-blue-900 rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            id="current"
            label="Současné heslo"
            value={current}
            onChange={setCurrent}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
            placeholder="••••••••"
          />
          <PasswordInput
            id="next"
            label="Nové heslo"
            value={next}
            onChange={setNext}
            show={showNext}
            onToggle={() => setShowNext((v) => !v)}
            placeholder="min. 6 znaků"
          />
          <PasswordInput
            id="confirm"
            label="Nové heslo znovu"
            value={confirm}
            onChange={setConfirm}
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            placeholder="••••••••"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm flex items-center gap-2">
              <Check size={16} /> Heslo bylo úspěšně změněno.
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors shadow-sm mt-2"
          >
            {isPending ? "Ukládám..." : "Změnit heslo"}
          </button>
        </form>
      </div>
    </div>
  );
}
