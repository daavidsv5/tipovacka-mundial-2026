"use client";

import { useState, useTransition } from "react";
import { saveMatchResult, assignPlayoffTeam, adminSaveMatchPrediction } from "@/lib/actions/admin";
import { Check, ChevronDown, ChevronUp, Users } from "lucide-react";

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

function FlagIcon({ code }: { code: string }) {
  return <span className={`fi fi-${code} rounded-sm`} style={{ fontSize: "1rem" }} />;
}

function PointsBadge({ pts }: { pts: number }) {
  if (pts === 5) return <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">+5</span>;
  if (pts === 3) return <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">+3</span>;
  if (pts === 2) return <span className="text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full px-2 py-0.5">+2</span>;
  return <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">+0</span>;
}

function PlayerPredictionRow({
  matchId, player, prediction, matchFinished,
}: {
  matchId: string;
  player: { id: string; name: string };
  prediction: { homeScore: number; awayScore: number; pointsAwarded: number } | null;
  matchFinished: boolean;
}) {
  const [home, setHome] = useState(prediction?.homeScore?.toString() ?? "");
  const [away, setAway] = useState(prediction?.awayScore?.toString() ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const h = parseInt(home);
    const a = parseInt(away);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;
    startTransition(async () => {
      await adminSaveMatchPrediction(matchId, player.id, h, a);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const initial = player.name[0].toUpperCase();

  return (
    <div className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-colors">
      {/* Avatar + name */}
      <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[11px] font-bold text-blue-700 shrink-0">
        {initial}
      </div>
      <span className="text-sm font-medium text-gray-700 flex-1 min-w-0 truncate">{player.name}</span>

      {/* Score inputs */}
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number" min={0} max={20} value={home}
          onChange={(e) => setHome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="—"
          className="w-12 bg-white border border-gray-300 rounded-lg text-center text-gray-900 font-bold py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tabular-nums"
        />
        <span className="text-gray-400 font-bold">:</span>
        <input
          type="number" min={0} max={20} value={away}
          onChange={(e) => setAway(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="—"
          className="w-12 bg-white border border-gray-300 rounded-lg text-center text-gray-900 font-bold py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tabular-nums"
        />
      </div>

      {/* Points (only if match finished) */}
      {matchFinished && prediction && (
        <div className="w-8 flex justify-center">
          <PointsBadge pts={prediction.pointsAwarded} />
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isPending}
        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs text-white font-semibold transition-colors"
      >
        {saved ? <Check size={12} /> : null}
        {saved ? "OK" : "Uložit"}
      </button>
    </div>
  );
}

function MatchRow({
  match, teams, players, predictionsByMatch,
}: {
  match: any;
  teams: any[];
  players: any[];
  predictionsByMatch: Map<string, Map<string, any>>;
}) {
  const [home, setHome] = useState(match.homeScore?.toString() ?? "");
  const [away, setAway] = useState(match.awayScore?.toString() ?? "");
  const [homeTeamId, setHomeTeamId] = useState(match.homeTeamId ?? "");
  const [awayTeamId, setAwayTeamId] = useState(match.awayTeamId ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [tipsOpen, setTipsOpen] = useState(false);

  const isPlayoff = match.stage !== "GROUP";
  const matchDate = new Date(match.date);
  const dateStr = matchDate.toLocaleDateString("cs-CZ", {
    day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Prague",
  });

  const matchPreds = predictionsByMatch.get(match.id) ?? new Map();
  const predCount = matchPreds.size;

  const handleSave = () => {
    startTransition(async () => {
      if (isPlayoff) {
        if (homeTeamId && homeTeamId !== match.homeTeamId) await assignPlayoffTeam(match.id, "home", homeTeamId);
        if (awayTeamId && awayTeamId !== match.awayTeamId) await assignPlayoffTeam(match.id, "away", awayTeamId);
      }
      const h = parseInt(home);
      const a = parseInt(away);
      if (!isNaN(h) && !isNaN(a) && home !== "" && away !== "") {
        await saveMatchResult(match.id, h, a);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const availableTeams = teams.filter((t) => match.stage === "GROUP" ? t.group === match.groupName : true);

  const TeamSelect = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer max-w-[160px]"
      >
        <option value="">{placeholder}</option>
        {availableTeams.map((t: any) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );

  return (
    <div className={`bg-white border rounded-2xl shadow-sm transition-colors overflow-hidden ${match.isFinished ? "border-green-200 bg-green-50/30" : "border-blue-900 hover:border-blue-700/50"}`}>
      {/* Main row */}
      <div className="flex items-center justify-between gap-4 flex-wrap px-5 py-4">
        <div className="text-xs text-gray-400 min-w-[110px] shrink-0">
          #{match.matchNumber} · {dateStr}
        </div>

        <div className="flex items-center gap-3 flex-1 flex-wrap justify-center">
          {/* Domácí */}
          {isPlayoff && !match.homeTeam ? (
            <TeamSelect value={homeTeamId} onChange={setHomeTeamId} placeholder="— domácí —" />
          ) : (
            <div className="flex items-center gap-2">
              {match.homeTeam && <FlagIcon code={match.homeTeam.flag} />}
              <span className="text-gray-900 font-semibold text-sm">{match.homeTeam?.name ?? "TBD"}</span>
            </div>
          )}

          {/* Skóre vstupy */}
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number" min={0} value={home}
              onChange={(e) => setHome(e.target.value)}
              placeholder="—"
              className="w-14 bg-white border border-gray-300 rounded-xl text-center text-gray-900 font-bold py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tabular-nums"
            />
            <span className="text-gray-400 font-bold text-lg">:</span>
            <input
              type="number" min={0} value={away}
              onChange={(e) => setAway(e.target.value)}
              placeholder="—"
              className="w-14 bg-white border border-gray-300 rounded-xl text-center text-gray-900 font-bold py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tabular-nums"
            />
          </div>

          {/* Hosté */}
          {isPlayoff && !match.awayTeam ? (
            <TeamSelect value={awayTeamId} onChange={setAwayTeamId} placeholder="— hosté —" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-semibold text-sm">{match.awayTeam?.name ?? "TBD"}</span>
              {match.awayTeam && <FlagIcon code={match.awayTeam.flag} />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {match.isFinished && (
            <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg font-semibold">
              ✓ Hotovo
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-sm text-white font-semibold transition-colors shadow-sm"
          >
            {saved ? <Check size={14} /> : null}
            {saved ? "OK" : "Uložit"}
          </button>
          {/* Toggle tips */}
          <button
            onClick={() => setTipsOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:border-blue-300 rounded-xl text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            <Users size={14} />
            <span>{predCount}</span>
            {tipsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Expandable player tips */}
      {tipsOpen && (
        <div className="border-t border-gray-100 px-2 py-2 bg-gray-50/60">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 pb-1.5">
            Tipy hráčů
          </div>
          {players.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-2">Žádní hráči.</p>
          ) : (
            players.map((player) => (
              <PlayerPredictionRow
                key={player.id}
                matchId={match.id}
                player={player}
                prediction={matchPreds.get(player.id) ?? null}
                matchFinished={match.isFinished}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function MatchResultsAdmin({
  matches, teams, players, matchPredictions,
}: {
  matches: any[];
  teams: any[];
  players: any[];
  matchPredictions: any[];
}) {
  const stageOrder = ["GROUP", "R32", "R16", "QF", "SF", "BRONZE", "FINAL"];

  const grouped = matches.reduce<Record<string, any[]>>((acc, m) => {
    if (!acc[m.stage]) acc[m.stage] = [];
    acc[m.stage].push(m);
    return acc;
  }, {});

  // Build a nested Map: matchId → userId → prediction
  const predictionsByMatch = new Map<string, Map<string, any>>();
  for (const pred of matchPredictions) {
    if (!predictionsByMatch.has(pred.matchId)) {
      predictionsByMatch.set(pred.matchId, new Map());
    }
    predictionsByMatch.get(pred.matchId)!.set(pred.userId, pred);
  }

  const totalFinished = matches.filter((m) => m.isFinished).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <p className="text-gray-500 text-sm">Zadej výsledky odehraných zápasů. Body se přepočítají automaticky.</p>
        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg shrink-0">
          {totalFinished} / {matches.length} hotovo
        </span>
      </div>

      {stageOrder.map((stage) => {
        const stageMatches = grouped[stage];
        if (!stageMatches?.length) return null;
        const finished = stageMatches.filter((m: any) => m.isFinished).length;
        const sortedMatches = stage === "GROUP"
          ? [...stageMatches].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          : stageMatches;

        return (
          <div key={stage}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">{STAGE_ICONS[stage]}</span>
              <h3 className="text-gray-900 font-bold text-base">{STAGE_LABELS[stage]}</h3>
              <span className="text-sm text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {finished}/{stageMatches.length}
              </span>
            </div>
            <div className="space-y-2">
              {sortedMatches.map((m: any) => (
                <MatchRow
                  key={m.id}
                  match={m}
                  teams={teams}
                  players={players}
                  predictionsByMatch={predictionsByMatch}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
