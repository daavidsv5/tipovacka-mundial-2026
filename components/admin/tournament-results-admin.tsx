"use client";

import { useState, useTransition } from "react";
import { saveTournamentResult } from "@/lib/actions/admin";
import { Check, ChevronDown } from "lucide-react";

const CZECH_PLACEMENTS = [
  { value: "GROUP", label: "Základní skupina" },
  { value: "R32", label: "Šestnáctifinále" },
  { value: "R16", label: "Osmifinále" },
  { value: "QF", label: "Čtvrtfinále" },
  { value: "SF", label: "Semifinále" },
  { value: "FINAL", label: "Finále" },
];

function FlagIcon({ code }: { code: string }) {
  return <span className={`fi fi-${code} rounded-sm`} style={{ fontSize: "1rem" }} />;
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none bg-white border-2 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer ${
            value ? "border-gray-200" : "border-blue-400"
          }`}
        >
          <option value="">— nevybráno —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

export function TournamentResultsAdmin({
  teams,
  existing,
}: {
  teams: any[];
  existing: any | null;
}) {
  const [czechPlacement, setCzechPlacement] = useState(existing?.czechPlacement ?? "");
  const [topScorer, setTopScorer] = useState(existing?.topScorer ?? "");
  const [gold, setGold] = useState(existing?.goldTeamId ?? "");
  const [silver, setSilver] = useState(existing?.silverTeamId ?? "");
  const [bronze, setBronze] = useState(existing?.bronzeTeamId ?? "");
  const [totalGoals, setTotalGoals] = useState<string>(
    existing?.totalGoals !== null && existing?.totalGoals !== undefined ? String(existing.totalGoals) : ""
  );
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await saveTournamentResult({
        czechPlacement: czechPlacement || null,
        topScorer: topScorer.trim() || null,
        goldTeamId: gold || null,
        silverTeamId: silver || null,
        bronzeTeamId: bronze || null,
        totalGoals: totalGoals !== "" ? parseInt(totalGoals, 10) : null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  const usedPodium = new Set([gold, silver, bronze].filter(Boolean));
  const podiumOptions = (current: string) =>
    teams
      .filter((t) => t.id === current || !usedPodium.has(t.id))
      .map((t) => ({ value: t.id, label: t.name }));

  const podiumRows = [
    { label: "🥇 Zlato (vítěz turnaje)", value: gold, onChange: setGold },
    { label: "🥈 Stříbro (finalista)", value: silver, onChange: setSilver },
    { label: "🥉 Bronz (3. místo)", value: bronze, onChange: setBronze },
  ];

  return (
    <div className="space-y-5">
      <p className="text-gray-500 text-sm">
        Zapiš skutečné výsledky turnaje. Body se automaticky přepočítají pro všechny hráče.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pódium */}
        <div className="bg-white border border-blue-900 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">🏆 Pódium turnaje</h3>
            <p className="text-xs text-gray-500 mt-0.5">Za každý správný tip hráč dostane 10 bodů</p>
          </div>
          <div className="p-6 space-y-4">
            {podiumRows.map(({ label, value, onChange }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
                <div className="relative">
                  <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full appearance-none bg-white border-2 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer ${
                      value ? "border-gray-200" : "border-blue-400"
                    }`}
                  >
                    <option value="">— nevybráno —</option>
                    {podiumOptions(value).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Česko + Střelec */}
        <div className="space-y-4">
          <div className="bg-white border border-blue-900 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800">🇨🇿 Umístění českého týmu</h3>
              <p className="text-xs text-gray-500 mt-0.5">Za správný tip hráč dostane 10 bodů</p>
            </div>
            <div className="p-6">
              <SelectField
                label="Skutečné umístění Česka"
                value={czechPlacement}
                onChange={setCzechPlacement}
                options={CZECH_PLACEMENTS}
              />
            </div>
          </div>

          <div className="bg-white border border-blue-900 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800">⚽ Nejlepší střelec</h3>
              <p className="text-xs text-gray-500 mt-0.5">Za správný tip hráč dostane 10 bodů</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Jméno nejlepšího střelce
              </label>
              <input
                type="text"
                value={topScorer}
                onChange={(e) => setTopScorer(e.target.value)}
                placeholder="Např. Kylian Mbappé"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-white border border-blue-900 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800">🎯 Počet gólů v turnaji</h3>
              <p className="text-xs text-gray-500 mt-0.5">Hráč dostane 10 bodů při odchylce max. ±10 gólů</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Celkový počet gólů
              </label>
              <input
                type="number"
                min={0}
                value={totalGoals}
                onChange={(e) => setTotalGoals(e.target.value)}
                placeholder="Např. 180"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-white font-semibold text-sm transition-colors shadow-sm"
      >
        {saved ? <Check size={16} /> : null}
        {saved ? "Uloženo a přepočítáno!" : isPending ? "Ukládám..." : "Uložit a přepočítat body"}
      </button>
    </div>
  );
}
