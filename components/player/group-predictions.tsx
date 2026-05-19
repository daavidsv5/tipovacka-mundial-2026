"use client";

import { useState, useTransition } from "react";
import { saveGroupPrediction } from "@/lib/actions/predictions";
import { Check, ChevronDown } from "lucide-react";

function FlagIcon({ code }: { code: string }) {
  return <span className={`fi fi-${code} rounded-sm`} style={{ fontSize: "1rem" }} />;
}

function GroupCard({
  group, teams, prediction, playerId, canEdit,
}: {
  group: string; teams: any[]; prediction: any; playerId: string; canEdit: boolean;
}) {
  const [first, setFirst] = useState(prediction?.firstPlaceTeamId ?? "");
  const [second, setSecond] = useState(prediction?.secondPlaceTeamId ?? "");
  const [third, setThird] = useState(prediction?.thirdPlaceTeamId ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const points = prediction?.pointsAwarded ?? 0;

  const handleSave = () => {
    startTransition(async () => {
      await saveGroupPrediction(group, first, second, third || null, playerId);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const usedIds = new Set([first, second, third].filter(Boolean));
  const optionsFor = (current: string) =>
    teams.filter((t) => t.id === current || !usedIds.has(t.id));

  const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];
  const rankCircle = ["border-yellow-400 text-yellow-500", "border-gray-300 text-gray-400", "border-amber-400 text-amber-600"];
  const rankText = ["1. místo", "2. místo", "3. místo"];

  const TeamRow = ({
    value, onChange, rank,
  }: {
    value: string; onChange: (v: string) => void; rank: number;
  }) => {
    const selected = teams.find((t) => t.id === value);
    return (
      <div className="flex items-center gap-3 py-2.5">
        <div className={`w-6 h-6 rounded-full border-2 ${rankCircle[rank - 1]} flex items-center justify-center shrink-0`}>
          <span className="font-bold text-xs">{rank}</span>
        </div>
        <span className={`text-sm font-semibold w-16 shrink-0 ${rankColors[rank - 1]}`}>
          {rankText[rank - 1]}
        </span>
        {selected ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FlagIcon code={selected.flag} />
            <span className="text-gray-800 text-sm font-medium truncate">{selected.name}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm flex-1">nevybráno</span>
        )}
        {canEdit && (
          <div className="relative shrink-0">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer max-w-[140px]"
            >
              <option value="">— vybrat —</option>
              {optionsFor(value).map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-blue-900 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{group}</span>
          </div>
          <span className="font-semibold text-gray-800">Skupina {group}</span>
        </div>
        <div className="flex items-center gap-2">
          {points > 0 && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
              +{points}b
            </span>
          )}
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={isPending || !first || !second}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs text-white font-semibold transition-colors shadow-sm"
            >
              {saved ? <Check size={12} /> : null}
              {saved ? "Uloženo" : "Uložit"}
            </button>
          )}
        </div>
      </div>

      <div className="px-5 py-2 space-y-1">
        <TeamRow value={first} onChange={setFirst} rank={1} />
        <TeamRow value={second} onChange={setSecond} rank={2} />
        <TeamRow value={third} onChange={setThird} rank={3} />
      </div>
    </div>
  );
}

export function GroupPredictions({
  playerId, teams, predictions, canEdit,
}: {
  playerId: string; teams: any[]; predictions: any[]; canEdit: boolean;
}) {
  const predMap = new Map(predictions.map((p) => [p.group, p]));
  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  return (
    <div>
      <p className="text-gray-500 text-sm mb-5">
        Seřaď týmy podle očekávaného pořadí ve skupině. Za přesné umístění dostaneš 5 bodů.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {groups.map((g) => (
          <GroupCard
            key={g}
            group={g}
            teams={teams.filter((t) => t.group === g)}
            prediction={predMap.get(g)}
            playerId={playerId}
            canEdit={canEdit}
          />
        ))}
      </div>
    </div>
  );
}
