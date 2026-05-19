"use client";

import { useState, useTransition } from "react";
import { MatchResultsAdmin } from "./match-results-admin";
import { PlayersAdmin } from "./players-admin";
import { GroupResultsAdmin } from "./group-results-admin";
import { TournamentResultsAdmin } from "./tournament-results-admin";
import { resetAllPredictionsAndResults } from "@/lib/actions/admin";
import { Trash2 } from "lucide-react";

const TABS = [
  { id: "zapasy", label: "Výsledky zápasů", icon: "⚽" },
  { id: "skupiny", label: "Skupiny", icon: "🏟️" },
  { id: "turnaj", label: "Turnaj", icon: "🏆" },
  { id: "hraci", label: "Hráči", icon: "👥" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function AdminTabs({
  matches,
  teams,
  players,
  groupResults,
  tournamentResult,
  matchPredictions,
}: {
  matches: any[];
  teams: any[];
  players: any[];
  groupResults: any[];
  tournamentResult: any;
  matchPredictions: any[];
}) {
  const [active, setActive] = useState<Tab>("zapasy");
  const [isPendingReset, startResetTransition] = useTransition();

  const handleResetAll = () => {
    if (!window.confirm("Opravdu smazat VŠECHNY tipy, výsledky a body? Tato akce je nevratná!")) return;
    if (!window.confirm("Jsi si úplně jistý? Data nelze obnovit.")) return;
    startResetTransition(async () => {
      await resetAllPredictionsAndResults();
    });
  };

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex bg-white border border-blue-900 rounded-2xl p-1.5 gap-1 shadow-sm w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              active === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {active === "zapasy" && <MatchResultsAdmin matches={matches} teams={teams} players={players} matchPredictions={matchPredictions} />}
        {active === "skupiny" && <GroupResultsAdmin teams={teams} groupResults={groupResults} />}
        {active === "turnaj" && <TournamentResultsAdmin teams={teams} existing={tournamentResult} />}
        {active === "hraci" && <PlayersAdmin players={players} />}
      </div>

      {/* Nebezpečná zóna */}
      <div className="mt-10 border border-red-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-red-50 border-b border-red-200 flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <h3 className="font-bold text-red-700">Nebezpečná zóna</h3>
        </div>
        <div className="px-6 py-5 bg-white flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-gray-800 font-semibold text-sm">Smazat všechny tipy a výsledky</div>
            <div className="text-gray-400 text-xs mt-0.5">Vymaže tipy hráčů, výsledky zápasů, skupin a turnaje. Body se vynulují. Hráči zůstanou.</div>
          </div>
          <button
            onClick={handleResetAll}
            disabled={isPendingReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors shrink-0"
          >
            <Trash2 size={15} />
            {isPendingReset ? "Mažu..." : "Smazat vše"}
          </button>
        </div>
      </div>
    </div>
  );
}
