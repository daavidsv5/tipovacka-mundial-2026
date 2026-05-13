import { prisma } from "@/lib/prisma";

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

async function getMatches() {
  try {
    return await prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true },
      orderBy: { matchNumber: "asc" },
    });
  } catch {
    return [];
  }
}

function FlagIcon({ code }: { code: string }) {
  return <span className={`fi fi-${code} rounded-sm`} style={{ fontSize: "1.1rem" }} />;
}

export default async function VysledkyPage() {
  const matches = await getMatches();
  const stageOrder = ["GROUP", "R32", "R16", "QF", "SF", "BRONZE", "FINAL"];

  const grouped = matches.reduce<Record<string, typeof matches>>((acc, m) => {
    if (!acc[m.stage]) acc[m.stage] = [];
    acc[m.stage].push(m);
    return acc;
  }, {});

  const totalFinished = matches.filter((m) => m.isFinished).length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Výsledky</h1>
          <p className="text-gray-500 mt-1">
            {totalFinished} z {matches.length} zápasů odehráno
          </p>
        </div>
      </div>

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
              <span className="text-sm text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {finished}/{stageMatches.length}
              </span>
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

function MatchCard({ match }: { match: any }) {
  const date = new Date(match.date);
  const dateStr = date.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
  const timeStr = date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${match.isFinished ? "border-gray-200" : "border-gray-200 hover:border-blue-300 hover:shadow-md"}`}>
      {/* Top row: group + date */}
      <div className="flex items-center justify-between px-5 pt-3.5 pb-2">
        {match.groupName ? (
          <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">Skupina {match.groupName}</span>
        ) : (
          <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">{STAGE_LABELS[match.stage]}</span>
        )}
        <span className="text-xs text-gray-400 font-medium tabular-nums">{dateStr} • {timeStr}</span>
      </div>

      {/* Main row: home | score | away */}
      <div className="flex items-center px-5 pb-3.5 gap-3">
        {/* Home team */}
        <div className="flex-1 flex items-center gap-2.5 justify-end min-w-0">
          <span className="text-gray-900 font-semibold text-sm truncate text-right leading-tight">
            {match.homeTeam?.name ?? "TBD"}
          </span>
          {match.homeTeam
            ? <FlagIcon code={match.homeTeam.flag} />
            : <span className="w-5 h-4 bg-gray-100 rounded shrink-0" />}
        </div>

        {/* Score */}
        <div className="shrink-0 flex items-center gap-1.5">
          {match.isFinished ? (
            <>
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-900 text-white font-bold text-sm tabular-nums">
                {match.homeScore}
              </span>
              <span className="text-gray-400 font-light text-lg">:</span>
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-900 text-white font-bold text-sm tabular-nums">
                {match.awayScore}
              </span>
            </>
          ) : (
            <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 text-gray-400 font-medium text-sm">
              vs
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex items-center gap-2.5 min-w-0">
          {match.awayTeam
            ? <FlagIcon code={match.awayTeam.flag} />
            : <span className="w-5 h-4 bg-gray-100 rounded shrink-0" />}
          <span className="text-gray-900 font-semibold text-sm truncate leading-tight">
            {match.awayTeam?.name ?? "TBD"}
          </span>
        </div>
      </div>

      {/* Bottom row: status */}
      {match.isFinished && (
        <div className="flex items-center justify-center gap-2 px-5 py-2 bg-gray-50 border-t border-gray-100">
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            ✓ Hotovo
          </span>
          {match.location && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400 truncate max-w-[180px]">{match.location}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
