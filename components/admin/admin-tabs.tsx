"use client";

import { useState } from "react";
import { MatchResultsAdmin } from "./match-results-admin";
import { PlayersAdmin } from "./players-admin";
import { GroupResultsAdmin } from "./group-results-admin";
import { TournamentResultsAdmin } from "./tournament-results-admin";

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

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex bg-white border border-gray-200 rounded-2xl p-1.5 gap-1 shadow-sm w-fit flex-wrap">
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
    </div>
  );
}
