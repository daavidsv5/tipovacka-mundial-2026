"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { addPlayer, resetPlayerPassword } from "@/lib/actions/admin";
import { Plus, RefreshCw, Check, ExternalLink, Trophy, Target } from "lucide-react";

function PlayerRow({ player }: { player: any }) {
  const [newPw, setNewPw] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    if (!newPw.trim()) return;
    startTransition(async () => {
      await resetPlayerPassword(player.id, newPw);
      setNewPw("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const AVATAR_COLORS = [
    "bg-blue-500", "bg-emerald-500", "bg-violet-500",
    "bg-rose-500", "bg-amber-500", "bg-cyan-500",
  ];
  const avatarColor = AVATAR_COLORS[player.name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Avatar + info */}
        <div className={`w-11 h-11 rounded-xl ${avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
          {player.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-[150px]">
          <div className="text-gray-900 font-semibold text-base">{player.name}</div>
          <div className="text-gray-400 text-sm mt-0.5">{player.email}</div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-1.5">
            <Trophy size={13} className="text-yellow-600" />
            <span className="font-bold text-yellow-700">{player.points}</span>
            <span className="text-yellow-600 text-xs">b.</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5">
            <Target size={13} className="text-blue-600" />
            <span className="font-bold text-blue-700">{player.exactMatches ?? 0}</span>
            <span className="text-blue-600 text-xs">přesných</span>
          </div>
        </div>

        {/* Tlačítko tipy */}
        <Link
          href={`/hraci/${player.id}`}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200 rounded-xl text-sm font-medium text-gray-600 transition-all"
        >
          <ExternalLink size={14} />
          Upravit tipy
        </Link>

        {/* Reset hesla */}
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="Nové heslo"
            className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-36"
          />
          <button
            onClick={handleReset}
            disabled={isPending || !newPw.trim()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-40 rounded-xl text-xs text-gray-600 font-medium transition-colors"
          >
            {saved ? <Check size={13} className="text-green-600" /> : <RefreshCw size={13} />}
            {saved ? "OK" : "Reset"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PlayersAdmin({ players }: { players: any[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setError("");
    startTransition(async () => {
      try {
        await addPlayer(name, email, password);
        setName("");
        setEmail("");
        setPassword("");
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
      } catch (e: any) {
        setError(e.message ?? "Chyba při přidávání hráče");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Přidat hráče */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Plus size={16} />
            Přidat nového hráče
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Přezdívka</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Např. Kraťas"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.cz"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Heslo</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Vstupní heslo"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {error && (
            <div className="mt-3 text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>
          )}
          <button
            onClick={handleAdd}
            disabled={isPending}
            className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-white font-semibold text-sm transition-colors shadow-sm"
          >
            {added ? <Check size={15} /> : <Plus size={15} />}
            {added ? "Hráč přidán!" : isPending ? "Přidávám..." : "Přidat hráče"}
          </button>
        </div>
      </div>

      {/* Seznam hráčů */}
      <div>
        <h3 className="text-gray-700 font-semibold mb-4 text-base">
          Registrovaní hráči
          <span className="ml-2 text-sm font-normal text-gray-400">({players.length})</span>
        </h3>
        {players.length === 0 ? (
          <div className="text-gray-400 text-center py-12 bg-white border border-gray-200 rounded-2xl">
            Žádní hráči zatím nejsou registrováni.
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((p) => <PlayerRow key={p.id} player={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
