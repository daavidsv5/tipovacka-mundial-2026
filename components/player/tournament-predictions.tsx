"use client";

import { useState, useTransition } from "react";
import { saveTournamentPrediction } from "@/lib/actions/predictions";
import { Check, ChevronDown } from "lucide-react";

const CZECH_PLACEMENTS = [
  { value: "GROUP", label: "Základní skupina" },
  { value: "R32", label: "Šestnáctifinále / 1. kolo" },
  { value: "R16", label: "Osmifinále" },
  { value: "QF", label: "Čtvrtfinále" },
  { value: "SF", label: "Semifinále" },
  { value: "FINAL", label: "Finále" },
];

function FlagIcon({ code }: { code: string }) {
  return <span className={`fi fi-${code} rounded-sm`} style={{ fontSize: "1rem" }} />;
}

export function TournamentPredictions({
  playerId, teams, prediction, canEdit,
}: {
  playerId: string; teams: any[]; prediction: any; canEdit: boolean;
}) {
  const [czechPlacement, setCzechPlacement] = useState(prediction?.czechPlacement ?? "");
  const [topScorer, setTopScorer] = useState(prediction?.topScorer ?? "");
  const [gold, setGold] = useState(prediction?.goldTeamId ?? "");
  const [silver, setSilver] = useState(prediction?.silverTeamId ?? "");
  const [bronze, setBronze] = useState(prediction?.bronzeTeamId ?? "");
  const [totalGoals, setTotalGoals] = useState<string>(
    prediction?.totalGoals !== null && prediction?.totalGoals !== undefined
      ? String(prediction.totalGoals)
      : ""
  );
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await saveTournamentPrediction({
        czechPlacement,
        topScorer,
        goldTeamId: gold || undefined,
        silverTeamId: silver || undefined,
        bronzeTeamId: bronze || undefined,
        totalGoals: totalGoals !== "" ? parseInt(totalGoals, 10) : null,
        targetUserId: playerId,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  const usedPodium = new Set([gold, silver, bronze].filter(Boolean));
  const podiumOptions = (current: string) =>
    teams.filter((t) => t.id === current || !usedPodium.has(t.id));

  const TeamSelect = ({
    value, onChange, icon, label, pts,
  }: {
    value: string; onChange: (v: string) => void; icon: string; label: string; pts: number;
  }) => {
    const selected = teams.find((t) => t.id === value);
    return (
      <div className="flex items-center gap-3 py-3">
        <span className="text-2xl shrink-0">{icon}</span>
        {selected ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FlagIcon code={selected.flag} />
            <span className="text-gray-800 text-sm font-medium truncate">{selected.name}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm flex-1">nevybráno</span>
        )}
        {pts > 0 && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
            +{pts}b
          </span>
        )}
        {canEdit && (
          <div className="relative shrink-0 w-full max-w-[160px]">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full appearance-none bg-white border-2 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer ${
                value ? "border-gray-200" : "border-blue-400"
              }`}
            >
              <option value="">— vybrat —</option>
              {podiumOptions(value).map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Česko */}
      <div className="bg-white border border-blue-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2.5">
            <span className="fi fi-cz rounded-sm text-xl" />
            <h3 className="text-gray-800 font-bold">Umístění českého týmu</h3>
          </div>
          <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold">+10 b.</span>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-sm mb-4">Tipni, kam se Česko dostane na turnaji.</p>
          {canEdit ? (
            <div className="relative">
              <select
                value={czechPlacement}
                onChange={(e) => setCzechPlacement(e.target.value)}
                className={`w-full appearance-none bg-white border-2 rounded-xl px-4 py-3.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer ${
                  czechPlacement ? "border-gray-200" : "border-blue-400"
                }`}
              >
                <option value="">— vybrat umístění —</option>
                {CZECH_PLACEMENTS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          ) : (
            <div className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm font-medium">
              {CZECH_PLACEMENTS.find((p) => p.value === czechPlacement)?.label ?? "— nezadáno —"}
            </div>
          )}
          {prediction?.czechPointsAwarded > 0 && (
            <div className="mt-3 text-emerald-700 text-sm font-semibold">
              ✓ +{prediction.czechPointsAwarded} bodů!
            </div>
          )}
        </div>
      </div>

      {/* Pódium */}
      <div className="bg-white border border-blue-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-gray-800 font-bold">🏆 Celkové pódium turnaje</h3>
          <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold">+10 b. / správný</span>
        </div>
        <div className="px-6 py-2 divide-y divide-gray-50">
          <TeamSelect value={gold} onChange={setGold} icon="🥇" label="Zlato" pts={prediction?.overallPointsAwarded ?? 0} />
          <TeamSelect value={silver} onChange={setSilver} icon="🥈" label="Stříbro" pts={0} />
          <TeamSelect value={bronze} onChange={setBronze} icon="🥉" label="Bronz" pts={0} />
        </div>
        {prediction?.overallPointsAwarded > 0 && (
          <div className="px-6 pb-4 text-emerald-700 text-sm font-semibold">
            ✓ Celkem: +{prediction.overallPointsAwarded} bodů
          </div>
        )}
      </div>

      {/* Nejlepší střelec */}
      <div className="bg-white border border-blue-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-gray-800 font-bold">⚽ Nejlepší střelec</h3>
          <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold">+10 b.</span>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-sm mb-4">Zadej jméno hráče, který dá nejvíce gólů na turnaji.</p>
          {canEdit ? (
            <input
              type="text"
              value={topScorer}
              onChange={(e) => setTopScorer(e.target.value)}
              placeholder="Např. Kylian Mbappé"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <div className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm font-medium">
              {topScorer || "— nezadáno —"}
            </div>
          )}
          {prediction?.topScorerPointsAwarded > 0 && (
            <div className="mt-3 text-emerald-700 text-sm font-semibold">
              ✓ +{prediction.topScorerPointsAwarded} bodů!
            </div>
          )}
        </div>
      </div>

      {/* Počet gólů */}
      <div className="bg-white border border-blue-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-gray-800 font-bold">🎯 Počet gólů v turnaji</h3>
          <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold">+10 b. (tolerance ±10)</span>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-sm mb-4">Tipni celkový počet gólů vstřelených na celém turnaji.</p>
          {canEdit ? (
            <input
              type="number"
              min={0}
              value={totalGoals}
              onChange={(e) => setTotalGoals(e.target.value)}
              placeholder="Např. 180"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <div className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm font-medium">
              {totalGoals !== "" ? `${totalGoals} gólů` : "— nezadáno —"}
            </div>
          )}
          {prediction?.totalGoalsPointsAwarded > 0 && (
            <div className="mt-3 text-emerald-700 text-sm font-semibold">
              ✓ +{prediction.totalGoalsPointsAwarded} bodů!
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      {canEdit && (
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-2xl text-white font-bold text-base transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          {saved && <Check size={18} />}
          {saved ? "Uloženo!" : isPending ? "Ukládám..." : "Uložit vše"}
        </button>
      )}
    </div>
  );
}
