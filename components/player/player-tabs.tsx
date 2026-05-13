"use client";

import { useState } from "react";
import { MatchPredictions } from "./match-predictions";
import { GroupPredictions } from "./group-predictions";
import { TournamentPredictions } from "./tournament-predictions";

const TABS = [
  { id: "zapasy", label: "Zápasy", emoji: "⚽" },
  { id: "skupiny", label: "Skupiny", emoji: "🏟️" },
  { id: "turnaj", label: "Turnaj", emoji: "🏆" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function PlayerTabs({
  player, matches, teams, matchPredictions, groupPredictions, tournamentPrediction, canEdit,
}: {
  player: { id: string; name: string };
  matches: any[];
  teams: any[];
  matchPredictions: any[];
  groupPredictions: any[];
  tournamentPrediction: any;
  canEdit: boolean;
}) {
  const [active, setActive] = useState<Tab>("zapasy");

  return (
    <div>
      <div className="flex bg-white border border-gray-200 rounded-2xl p-1.5 gap-1 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              active === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {active === "zapasy" && (
          <MatchPredictions playerId={player.id} matches={matches} predictions={matchPredictions} canEdit={canEdit} />
        )}
        {active === "skupiny" && (
          <GroupPredictions playerId={player.id} teams={teams} predictions={groupPredictions} canEdit={canEdit} />
        )}
        {active === "turnaj" && (
          <TournamentPredictions playerId={player.id} teams={teams} prediction={tournamentPrediction} canEdit={canEdit} />
        )}
      </div>
    </div>
  );
}
