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
    <div className="py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-colors">
      {/* Řádek 1: avatar + jméno */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0">
          {initial}
        </div>
        <span className="text-sm font-medium text-gray-700 flex-1 min-w-0 truncate">{player.name}</span>
        {matchFinished && prediction && (
          <PointsBadge pts={prediction.pointsAwarded} />
        )}
      </div>
      {/* Řádek 2: inputy + uložit */}
      <div className="flex items-center gap-2 ml-8">
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
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs text-white font-semibold transition-colors"
        >
          {saved ? <Check size={12} /> : null}
          {saved ? "OK" : "Uložit"}
        </button>
      </div>
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
    day: "numeric", month: "numeric", year: "numeric", timeZone: "Europe/Prague",
  });
  const timeStr = matchDate.toLocaleTimeString("cs-CZ", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Prague",
  });

  const matchPreds = predictionsByMatch.get(match.id) ?? new Map();
  const predCount = matchPreds.size;

  const handleSave = () => {
    startTransition(async () => {
      if (isPlayoff) {
        await assignPlayoffTeam(match.id, "home", homeTeamId || null);
        await assignPlayoffTeam(match.id, "away", awayTeamId || null);
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
    <div className="relative w-full max-w-[140px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-7 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {availableTeams.map((t: any) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-blue-900 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Top row: skupina/fáze + číslo zápasu + datum */}
      <div className="flex items-center justify-between px-3 sm:px-5 pt-3 pb-1.5">
        {match.groupName ? (
          <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">Sk. {match.groupName}</span>
        ) : (
          <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">{STAGE_LABELS[match.stage]}</span>
        )}
        <span className="text-xs text-gray-900 font-bold tabular-nums shrink-0">
          #{match.matchNumber} · {dateStr} · {timeStr}
        </span>
      </div>

      {/* Střed: domácí | skóre | hosté */}
      <div className="flex items-center px-3 sm:px-5 pb-3 gap-2 sm:gap-3">
        {/* Domácí */}
        <div className="flex-1 flex items-center gap-1.5 sm:gap-2.5 justify-end min-w-0">
          {isPlayoff ? (
            <TeamSelect value={homeTeamId} onChange={setHomeTeamId} placeholder="— domácí —" />
          ) : (
            <>
              <span className="text-gray-900 font-semibold text-xs sm:text-sm truncate text-right leading-tight">
                {match.homeTeam?.name ?? "TBD"}
              </span>
              {match.homeTeam
                ? <FlagIcon code={match.homeTeam.flag} />
                : <span className="w-4 h-3 bg-gray-100 rounded shrink-0" />}
            </>
          )}
        </div>

        {/* Skóre vstupy */}
        <div className="shrink-0 flex items-center gap-1">
          <input
            type="number" min={0} value={home}
            onChange={(e) => setHome(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="—"
            className="w-10 h-9 sm:w-12 sm:h-10 bg-white border-2 border-gray-200 rounded-xl text-center text-gray-900 font-bold text-sm focus:outline-none focus:border-blue-500 tabular-nums transition-colors"
          />
          <span className="text-gray-300 font-light text-base">:</span>
          <input
            type="number" min={0} value={away}
            onChange={(e) => setAway(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="—"
            className="w-10 h-9 sm:w-12 sm:h-10 bg-white border-2 border-gray-200 rounded-xl text-center text-gray-900 font-bold text-sm focus:outline-none focus:border-blue-500 tabular-nums transition-colors"
          />
        </div>

        {/* Hosté */}
        <div className="flex-1 flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {isPlayoff ? (
            <TeamSelect value={awayTeamId} onChange={setAwayTeamId} placeholder="— hosté —" />
          ) : (
            <>
              {match.awayTeam
                ? <FlagIcon code={match.awayTeam.flag} />
                : <span className="w-4 h-3 bg-gray-100 rounded shrink-0" />}
              <span className="text-gray-900 font-semibold text-xs sm:text-sm truncate leading-tight">
                {match.awayTeam?.name ?? "TBD"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Spodní lišta: stav + akce */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50 border-t border-gray-100">
        <div>
          {match.isFinished && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check size={11} /> Uzavřeno
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTipsOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-blue-300 rounded-xl text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            <Users size={13} />
            <span>{predCount}</span>
            {tipsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-sm text-white font-semibold transition-colors shadow-sm"
          >
            {saved ? <Check size={13} /> : null}
            {saved ? "OK" : "Uložit"}
          </button>
        </div>
      </div>

      {/* Rozkládací tipy hráčů */}
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
