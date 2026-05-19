"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const TABS = [
  { id: "zapasy", label: "Zápasy", emoji: "⚽" },
  { id: "skupiny", label: "Skupiny", emoji: "🏟️" },
  { id: "turnaj", label: "Turnaj", emoji: "🏆" },
] as const;

type Tab = (typeof TABS)[number]["id"];

const STAGE_LABELS: Record<string, string> = {
  GROUP: "Skupinová fáze",
  R32: "Šestnáctifinále",
  R16: "Osmifinále",
  QF: "Čtvrtfinále",
  SF: "Semifinále",
  BRONZE: "O bronz",
  FINAL: "Finále",
};

const STAGE_ICONS: Record<string, string> = {
  GROUP: "🏟️", R32: "⚡", R16: "🔥", QF: "💥", SF: "⭐", BRONZE: "🥉", FINAL: "🏆",
};

const CZECH_PLACEMENT_LABELS: Record<string, string> = {
  GROUP: "Základní skupina",
  R32: "Šestnáctifinále",
  R16: "Osmifinále",
  QF: "Čtvrtfinále",
  SF: "Semifinále",
  FINAL: "Finále",
};

function FlagIcon({ code }: { code: string }) {
  return <span className={`fi fi-${code} rounded-sm`} style={{ fontSize: "1.1rem" }} />;
}

// ─── Zápasy ──────────────────────────────────────────────────────────────────

function MatchCard({ match }: { match: any }) {
  const date = new Date(match.date);
  const dateStr = date.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", timeZone: "Europe/Prague" });
  const timeStr = date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Prague" });

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${match.isFinished ? "border-blue-900" : "border-blue-900 hover:border-blue-700/50 hover:shadow-md"}`}>
      <div className="flex items-center justify-between px-5 pt-3.5 pb-2">
        {match.groupName ? (
          <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">Skupina {match.groupName}</span>
        ) : (
          <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">{STAGE_LABELS[match.stage]}</span>
        )}
        <span className="text-xs text-gray-900 font-bold tabular-nums shrink-0">{dateStr} • {timeStr}</span>
      </div>
      <div className="flex items-center px-5 pb-3.5 gap-3">
        <div className="flex-1 flex items-center gap-2.5 justify-end min-w-0">
          <span className="text-gray-900 font-semibold text-sm truncate text-right leading-tight">{match.homeTeam?.name ?? "TBD"}</span>
          {match.homeTeam ? <FlagIcon code={match.homeTeam.flag} /> : <span className="w-5 h-4 bg-gray-100 rounded shrink-0" />}
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          {match.isFinished ? (
            <>
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-900 text-white font-bold text-sm tabular-nums">{match.homeScore}</span>
              <span className="text-gray-400 font-light text-lg">:</span>
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-900 text-white font-bold text-sm tabular-nums">{match.awayScore}</span>
            </>
          ) : (
            <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 text-gray-400 font-medium text-sm">vs</div>
          )}
        </div>
        <div className="flex-1 flex items-center gap-2.5 min-w-0">
          {match.awayTeam ? <FlagIcon code={match.awayTeam.flag} /> : <span className="w-5 h-4 bg-gray-100 rounded shrink-0" />}
          <span className="text-gray-900 font-semibold text-sm truncate leading-tight">{match.awayTeam?.name ?? "TBD"}</span>
        </div>
      </div>
      {match.isFinished && (
        <div className="flex items-center justify-center gap-2 px-5 py-2 bg-gray-50 border-t border-gray-100">
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><Check size={11} /> Hotovo</span>
          {match.location && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-[180px]">{match.location}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MatchesTab({ matches }: { matches: any[] }) {
  const stageOrder = ["GROUP", "R32", "R16", "QF", "SF", "BRONZE", "FINAL"];
  const grouped = matches.reduce<Record<string, any[]>>((acc, m) => {
    if (!acc[m.stage]) acc[m.stage] = [];
    acc[m.stage].push(m);
    return acc;
  }, {});
  const totalFinished = matches.filter((m) => m.isFinished).length;

  return (
    <div className="space-y-8">
      <p className="text-gray-500 text-sm">{totalFinished} z {matches.length} zápasů odehráno</p>
      {stageOrder.map((stage) => {
        const stageMatches = grouped[stage];
        if (!stageMatches?.length) return null;
        const sortedMatches = stage === "GROUP"
          ? [...stageMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          : stageMatches;
        const finished = stageMatches.filter((m) => m.isFinished).length;
        return (
          <div key={stage}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">{STAGE_ICONS[stage]}</span>
              <h2 className="text-gray-900 font-bold text-lg">{STAGE_LABELS[stage]}</h2>
              <span className="text-sm text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{finished}/{stageMatches.length}</span>
            </div>
            <div className="space-y-2">
              {sortedMatches.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Skupiny ─────────────────────────────────────────────────────────────────

const RANK_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600"];
const RANK_CIRCLE = ["border-yellow-400 text-yellow-500", "border-gray-300 text-gray-400", "border-amber-400 text-amber-600"];
const RANK_TEXT = ["1. místo", "2. místo", "3. místo"];

function GroupResultCard({ group, teams, result }: { group: string; teams: any[]; result: any | null }) {
  const places = [result?.firstPlaceTeamId, result?.secondPlaceTeamId, result?.thirdPlaceTeamId];
  const isComplete = places.every(Boolean);

  return (
    <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${isComplete ? "border-blue-900" : "border-blue-900"}`}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">{group}</span>
        </div>
        <span className="font-semibold text-gray-800">Skupina {group}</span>
        {isComplete && (
          <span className="ml-auto text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg font-medium">✓ Zapsáno</span>
        )}
      </div>
      <div className="px-5 py-2 space-y-1">
        {[0, 1, 2].map((i) => {
          const teamId = places[i];
          const team = teams.find((t: any) => t.id === teamId);
          return (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <div className={`w-6 h-6 rounded-full border-2 ${RANK_CIRCLE[i]} flex items-center justify-center shrink-0`}>
                <span className="font-bold text-xs">{i + 1}</span>
              </div>
              <span className={`text-sm font-semibold w-16 shrink-0 ${RANK_COLORS[i]}`}>{RANK_TEXT[i]}</span>
              {team ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FlagIcon code={team.flag} />
                  <span className="text-gray-800 text-sm font-medium truncate">{team.name}</span>
                </div>
              ) : (
                <span className="text-gray-400 text-sm flex-1">nevybráno</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GroupsTab({ teams, groupResults }: { teams: any[]; groupResults: any[] }) {
  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  const resultMap = new Map(groupResults.map((r) => [r.group, r]));
  const completedCount = groups.filter((g) => {
    const r = resultMap.get(g);
    return r?.firstPlaceTeamId && r?.secondPlaceTeamId && r?.thirdPlaceTeamId;
  }).length;

  return (
    <div className="space-y-5">
      <p className="text-gray-500 text-sm">{completedCount} z {groups.length} skupin zapsáno</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {groups.map((g) => (
          <GroupResultCard
            key={g}
            group={g}
            teams={teams.filter((t: any) => t.group === g)}
            result={resultMap.get(g) ?? null}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Turnaj ──────────────────────────────────────────────────────────────────

function TournamentTab({ teams, tournamentResult }: { teams: any[]; tournamentResult: any | null }) {
  const r = tournamentResult;

  const podium = [
    { icon: "🥇", label: "Zlato", color: "text-yellow-500", teamId: r?.goldTeamId },
    { icon: "🥈", label: "Stříbro", color: "text-gray-500", teamId: r?.silverTeamId },
    { icon: "🥉", label: "Bronz", color: "text-amber-600", teamId: r?.bronzeTeamId },
  ];

  return (
    <div className="space-y-5">
      {/* Pódium */}
      <div className="bg-white border border-blue-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800">🏆 Celkové pódium turnaje</h3>
        </div>
        <div className="px-6 py-2 space-y-1">
          {podium.map(({ icon, label, color, teamId }) => {
            const team = teams.find((t: any) => t.id === teamId);
            return (
              <div key={label} className="flex items-center gap-3 py-3">
                <span className="text-2xl shrink-0">{icon}</span>
                <span className={`text-sm font-semibold w-16 shrink-0 ${color}`}>{label}</span>
                {team ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FlagIcon code={team.flag} />
                    <span className="text-gray-800 text-sm font-medium truncate">{team.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm flex-1">nevybráno</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Česko + Střelec */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white border border-blue-900 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800">🇨🇿 Umístění českého týmu</h3>
          </div>
          <div className="px-6 py-4">
            {r?.czechPlacement ? (
              <span className="text-gray-800 font-semibold text-sm">{CZECH_PLACEMENT_LABELS[r.czechPlacement] ?? r.czechPlacement}</span>
            ) : (
              <span className="text-gray-400 text-sm">Zatím nezapsáno</span>
            )}
          </div>
        </div>

        <div className="bg-white border border-blue-900 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800">⚽ Nejlepší střelec</h3>
          </div>
          <div className="px-6 py-4">
            {r?.topScorer ? (
              <span className="text-gray-800 font-semibold text-sm">{r.topScorer}</span>
            ) : (
              <span className="text-gray-400 text-sm">Zatím nezapsáno</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hlavní komponenta ────────────────────────────────────────────────────────

export function VysledkyTabs({
  matches, teams, groupResults, tournamentResult,
}: {
  matches: any[];
  teams: any[];
  groupResults: any[];
  tournamentResult: any | null;
}) {
  const [active, setActive] = useState<Tab>("zapasy");

  return (
    <div>
      <div className="flex bg-white border border-blue-900 rounded-2xl p-1.5 gap-1 shadow-sm mb-6">
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

      {active === "zapasy" && <MatchesTab matches={matches} />}
      {active === "skupiny" && <GroupsTab teams={teams} groupResults={groupResults} />}
      {active === "turnaj" && <TournamentTab teams={teams} tournamentResult={tournamentResult} />}
    </div>
  );
}
