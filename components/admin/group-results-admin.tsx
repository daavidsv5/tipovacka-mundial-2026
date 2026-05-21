"use client";

import { useState, useTransition } from "react";
import { saveGroupResult } from "@/lib/actions/admin";
import { Check, ChevronDown } from "lucide-react";

function FlagIcon({ code }: { code: string }) {
  return <span className={`fi fi-${code} rounded-sm`} style={{ fontSize: "1rem" }} />;
}

function GroupResultCard({
  group,
  teams,
  existing,
}: {
  group: string;
  teams: any[];
  existing: any | null;
}) {
  const [first, setFirst] = useState(existing?.firstPlaceTeamId ?? "");
  const [second, setSecond] = useState(existing?.secondPlaceTeamId ?? "");
  const [third, setThird] = useState(existing?.thirdPlaceTeamId ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await saveGroupResult(group, first || null, second || null, third || null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const usedIds = new Set([first, second, third].filter(Boolean));
  const optionsFor = (current: string) =>
    teams.filter((t) => t.id === current || !usedIds.has(t.id));

  const isComplete = first && second && third;

  const TeamSelect = ({
    value,
    onChange,
    rank,
  }: {
    value: string;
    onChange: (v: string) => void;
    rank: number;
  }) => {
    const selected = teams.find((t) => t.id === value);
    const rankCircle = ["border-green-800 text-green-800", "border-green-800 text-green-800", "border-green-800 text-green-800"];

    return (
      <div className="flex items-center gap-3 py-2">
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
        <div className="relative shrink-0 w-full max-w-[140px]">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="">— vybrat —</option>
            {optionsFor(value).map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${isComplete ? "border-green-200" : "border-blue-900"}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{group}</span>
          </div>
          <span className="font-semibold text-gray-800">Skupina {group}</span>
        </div>
        <div className="flex items-center gap-2">
          {isComplete && (
            <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg font-medium">
              ✓ Zapsáno
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs text-white font-semibold transition-colors shadow-sm"
          >
            {saved ? <Check size={13} /> : null}
            {saved ? "Uloženo" : "Uložit"}
          </button>
        </div>
      </div>

      <div className="px-5 py-2 space-y-1">
        <TeamSelect value={first} onChange={setFirst} rank={1} />
        <TeamSelect value={second} onChange={setSecond} rank={2} />
        <TeamSelect value={third} onChange={setThird} rank={3} />
      </div>
    </div>
  );
}

export function GroupResultsAdmin({
  teams,
  groupResults,
}: {
  teams: any[];
  groupResults: any[];
}) {
  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  const resultMap = new Map(groupResults.map((r) => [r.group, r]));

  const completedCount = groups.filter((g) => {
    const r = resultMap.get(g);
    return r?.firstPlaceTeamId && r?.secondPlaceTeamId && r?.thirdPlaceTeamId;
  }).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          Zapiš skutečné pořadí v každé skupině. Systém automaticky přepočítá body hráčů.
        </p>
        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
          {completedCount} / {groups.length} skupin
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {groups.map((g) => {
          const groupTeams = teams.filter((t) => t.group === g);
          return (
            <GroupResultCard
              key={g}
              group={g}
              teams={groupTeams}
              existing={resultMap.get(g) ?? null}
            />
          );
        })}
      </div>
    </div>
  );
}
