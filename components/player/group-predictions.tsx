"use client";

import { useState, useTransition } from "react";
import { saveGroupPrediction } from "@/lib/actions/predictions";
import { Check, ChevronDown } from "lucide-react";

const MAX_THIRDS = 8;

function FlagIcon({ code }: { code: string }) {
  return <span className={`fi fi-${code} rounded-sm`} style={{ fontSize: "1rem" }} />;
}

function GroupCard({
  group, teams, prediction, playerId, canEdit,
  thirdValue, onThirdChange, thirdLimitReached,
}: {
  group: string; teams: any[]; prediction: any; playerId: string; canEdit: boolean;
  thirdValue: string; onThirdChange: (v: string) => void; thirdLimitReached: boolean;
}) {
  const [first, setFirst] = useState(prediction?.firstPlaceTeamId ?? "");
  const [second, setSecond] = useState(prediction?.secondPlaceTeamId ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const points = prediction?.pointsAwarded ?? 0;

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveGroupPrediction(group, first, second, thirdValue || null, playerId);
      if (!result.ok) {
        setError((result as any).error ?? "Chyba při ukládání.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  const usedIds = new Set([first, second, thirdValue].filter(Boolean));
  const optionsFor = (current: string) =>
    teams.filter((t) => t.id === current || !usedIds.has(t.id));

  const rankCircle = ["border-green-800 text-green-800", "border-green-800 text-green-800", "border-green-800 text-green-800"];

  const TeamRow = ({
    value, onChange, rank, disabled,
  }: {
    value: string; onChange: (v: string) => void; rank: number; disabled?: boolean;
  }) => {
    const selected = teams.find((t) => t.id === value);
    return (
      <div className="flex items-center gap-3 py-2.5">
        <div className={`w-6 h-6 rounded-full border-2 ${rankCircle[rank - 1]} flex items-center justify-center shrink-0`}>
          <span className="font-bold text-xs">{rank}</span>
        </div>
        {selected ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FlagIcon code={selected.flag} />
            <span className="text-gray-800 text-sm font-medium truncate">{selected.name}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm flex-1">nevybráno</span>
        )}
        <span className="text-xs text-emerald-600 font-semibold shrink-0">+5b</span>
        {canEdit && (
          disabled ? (
            <span className="text-xs text-orange-500 bg-orange-50 border border-orange-200 px-2 py-1 rounded-lg shrink-0">
              Limit 8 dosažen
            </span>
          ) : (
            <div className="relative shrink-0 w-full max-w-[140px]">
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full appearance-none bg-white border-2 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer ${
                  value ? "border-gray-200" : "border-blue-400"
                }`}
              >
                <option value="">— vybrat —</option>
                {optionsFor(value).map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )
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
        <TeamRow
          value={thirdValue}
          onChange={onThirdChange}
          rank={3}
          disabled={thirdLimitReached && !thirdValue}
        />
      </div>

      {error && (
        <div className="px-5 pb-3 text-xs text-orange-600 flex items-center gap-1.5">
          <span>⚠</span> {error}
        </div>
      )}
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

  const [thirds, setThirds] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    groups.forEach((g) => {
      init[g] = predMap.get(g)?.thirdPlaceTeamId ?? "";
    });
    return init;
  });

  const thirdsUsed = Object.values(thirds).filter(Boolean).length;
  const thirdLimitReached = thirdsUsed >= MAX_THIRDS;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-500 text-sm">
          Seřaď týmy podle očekávaného pořadí ve skupině. Za přesné umístění dostaneš 5 bodů.
        </p>
        <span className={`ml-4 shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
          thirdLimitReached
            ? "text-orange-600 bg-orange-50 border-orange-200"
            : "text-gray-500 bg-gray-50 border-gray-200"
        }`}>
          3. místo: {thirdsUsed}/{MAX_THIRDS}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {groups.map((g) => (
          <GroupCard
            key={g}
            group={g}
            teams={teams.filter((t) => t.group === g)}
            prediction={predMap.get(g)}
            playerId={playerId}
            canEdit={canEdit}
            thirdValue={thirds[g]}
            onThirdChange={(v) => setThirds((prev) => ({ ...prev, [g]: v }))}
            thirdLimitReached={thirdLimitReached}
          />
        ))}
      </div>
    </div>
  );
}
