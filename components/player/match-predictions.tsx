"use client";

import { useState, useTransition } from "react";
import { saveMatchPrediction } from "@/lib/actions/predictions";
import { Check, Lock } from "lucide-react";

const STAGE_LABELS: Record<string, string> = {
  GROUP: "Skupinová fáze",
  R32: "Šestnáctifinále",
  R16: "Osmifinále",
  QF: "Čtvrtfinále",
  SF: "Semifinále",
  BRONZE: "O bronz",
  FINAL: "Finále",
};

function FlagIcon({ code, size = "md" }: { code: string; size?: "sm" | "md" }) {
  const s = size === "sm" ? "1rem" : "1.2rem";
  return <span className={`fi fi-${code} rounded`} style={{ fontSize: s }} />;
}

function PointsBadge({ pts }: { pts: number }) {
  if (pts === 5) return <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">+5 b.</span>;
  if (pts === 3) return <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">+3 b.</span>;
  if (pts === 2) return <span className="text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full px-2.5 py-0.5">+2 b.</span>;
  return <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">+0 b.</span>;
}

function ScoreInputCard({
  matchId, playerId, homeTeam, awayTeam,
  initHome, initAway, locked, realHome, realAway,
  isFinished, pointsAwarded, canEdit, groupName, date,
}: {
  matchId: string; playerId: string;
  homeTeam: { name: string; flag: string } | null;
  awayTeam: { name: string; flag: string } | null;
  initHome: number | null; initAway: number | null;
  locked: boolean; realHome: number | null; realAway: number | null;
  isFinished: boolean; pointsAwarded: number; canEdit: boolean;
  groupName?: string | null; date: Date;
}) {
  const [home, setHome] = useState(initHome?.toString() ?? "");
  const [away, setAway] = useState(initAway?.toString() ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const h = parseInt(home);
    const a = parseInt(away);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;
    startTransition(async () => {
      await saveMatchPrediction(matchId, h, a, playerId);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const isLocked = locked && !canEdit;
  const hasPrediction = initHome !== null && initAway !== null;

  const dateStr = date.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", timeZone: "Europe/Prague" });
  const timeStr = date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Prague" });

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isFinished ? "border-gray-200" : "border-gray-200 hover:border-blue-300 hover:shadow-md"}`}>
      {/* Top row: group + date */}
      <div className="flex items-center justify-between px-5 pt-3.5 pb-2">
        {groupName ? (
          <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">Skupina {groupName}</span>
        ) : (
          <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">{STAGE_LABELS["GROUP"]}</span>
        )}
        <span className="text-xs text-gray-400 font-medium tabular-nums">{dateStr} • {timeStr}</span>
      </div>

      {/* Main row: teams + score */}
      <div className="flex items-center px-5 pb-3.5 gap-3">
        {/* Home team */}
        <div className="flex-1 flex items-center gap-2.5 justify-end min-w-0">
          <span className="text-gray-900 font-semibold text-sm truncate text-right leading-tight">
            {homeTeam?.name ?? "TBD"}
          </span>
          {homeTeam ? <FlagIcon code={homeTeam.flag} /> : <span className="w-5 h-4 bg-gray-100 rounded shrink-0" />}
        </div>

        {/* Score / inputs */}
        <div className="shrink-0 flex items-center gap-2">
          {isFinished ? (
            // Finished: show real score as dark pill
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-900 text-white font-bold text-sm tabular-nums">
                {realHome}
              </span>
              <span className="text-gray-400 font-light text-lg">:</span>
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-900 text-white font-bold text-sm tabular-nums">
                {realAway}
              </span>
            </div>
          ) : isLocked ? (
            // Locked: show tip or lock icon
            <div className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2">
              <Lock size={12} className="text-gray-400 shrink-0" />
              {hasPrediction ? (
                <span className="text-gray-600 text-sm font-semibold tabular-nums">{initHome}:{initAway}</span>
              ) : (
                <span className="text-gray-400 text-xs">—</span>
              )}
            </div>
          ) : (
            // Editable inputs
            <div className="flex items-center gap-1.5">
              <input
                type="number" min={0} max={20} value={home}
                onChange={(e) => setHome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="w-12 h-10 bg-white border-2 border-gray-200 rounded-xl text-center text-gray-900 font-bold text-sm focus:outline-none focus:border-blue-500 tabular-nums transition-colors"
              />
              <span className="text-gray-300 font-light text-lg">:</span>
              <input
                type="number" min={0} max={20} value={away}
                onChange={(e) => setAway(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="w-12 h-10 bg-white border-2 border-gray-200 rounded-xl text-center text-gray-900 font-bold text-sm focus:outline-none focus:border-blue-500 tabular-nums transition-colors"
              />
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex items-center gap-2.5 min-w-0">
          {awayTeam ? <FlagIcon code={awayTeam.flag} /> : <span className="w-5 h-4 bg-gray-100 rounded shrink-0" />}
          <span className="text-gray-900 font-semibold text-sm truncate leading-tight">
            {awayTeam?.name ?? "TBD"}
          </span>
        </div>

        {/* Save button (only when editable) */}
        {!isFinished && !isLocked && canEdit && (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="shrink-0 w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors shadow-sm"
          >
            <Check size={15} className="text-white" />
          </button>
        )}
      </div>

      {/* Bottom row: status + points (only when finished or locked) */}
      {(isFinished || (isLocked && hasPrediction)) && (
        <div className="flex items-center justify-center gap-2 px-5 py-2 bg-gray-50 border-t border-gray-100">
          {isFinished && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check size={11} /> Uzavřeno
            </span>
          )}
          {isFinished && hasPrediction && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">
                tip: <span className="font-semibold text-gray-600 tabular-nums">{initHome}:{initAway}</span>
              </span>
              <span className="text-gray-300">·</span>
              <PointsBadge pts={pointsAwarded} />
            </>
          )}
          {!isFinished && isLocked && hasPrediction && (
            <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
              <Lock size={11} /> Uzamčeno · tip: <span className="tabular-nums">{initHome}:{initAway}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function MatchPredictions({
  playerId, matches, predictions, canEdit,
}: {
  playerId: string; matches: any[]; predictions: any[]; canEdit: boolean;
}) {
  const predMap = new Map(predictions.map((p) => [p.matchId, p]));
  const now = new Date();

  const grouped = matches.reduce<Record<string, any[]>>((acc, m) => {
    if (!acc[m.stage]) acc[m.stage] = [];
    acc[m.stage].push(m);
    return acc;
  }, {});

  const stageOrder = ["GROUP", "R32", "R16", "QF", "SF", "BRONZE", "FINAL"];

  const stageIcons: Record<string, string> = {
    GROUP: "🏟️", R32: "⚡", R16: "🔥", QF: "💥", SF: "⭐", BRONZE: "🥉", FINAL: "🏆",
  };

  return (
    <div className="space-y-10">
      {stageOrder.map((stage) => {
        const stageMatches = grouped[stage];
        if (!stageMatches?.length) return null;

        const sortedMatches = stage === "GROUP"
          ? [...stageMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          : stageMatches;

        return (
          <div key={stage}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{stageIcons[stage]}</span>
              <h3 className="text-gray-900 font-bold text-base tracking-tight">{STAGE_LABELS[stage]}</h3>
            </div>

            <div className="space-y-2">
              {sortedMatches.map((m: any) => {
                const pred = predMap.get(m.id);
                return (
                  <ScoreInputCard
                    key={m.id}
                    matchId={m.id} playerId={playerId}
                    homeTeam={m.homeTeam} awayTeam={m.awayTeam}
                    initHome={pred?.homeScore ?? null} initAway={pred?.awayScore ?? null}
                    locked={now >= new Date(m.date)}
                    realHome={m.homeScore} realAway={m.awayScore}
                    isFinished={m.isFinished} pointsAwarded={pred?.pointsAwarded ?? 0}
                    canEdit={canEdit}
                    groupName={m.groupName} date={new Date(m.date)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
