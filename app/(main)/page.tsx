import { prisma } from "@/lib/prisma";
import { Trophy, Calendar, Users } from "lucide-react";

async function getData() {
  try {
    const [players, totalMatches, finishedMatches] = await Promise.all([
      prisma.user.findMany({
        where: { role: "PLAYER" },
        orderBy: [{ points: "desc" }, { exactMatches: "desc" }],
        select: { id: true, name: true, points: true, exactMatches: true, hasPaid: true },
      }),
      prisma.match.count(),
      prisma.match.count({ where: { isFinished: true } }),
    ]);
    return { players, totalMatches, finishedMatches };
  } catch {
    return { players: [], totalMatches: 0, finishedMatches: 0 };
  }
}

const ENTRY_FEE = 400;

const RANK_BAR_COLORS = [
  "bg-gradient-to-r from-yellow-400 to-amber-500",
  "bg-gradient-to-r from-gray-300 to-gray-400",
  "bg-gradient-to-r from-amber-600 to-amber-700",
];

const RANK_LABELS = ["🥇", "🥈", "🥉"];

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500",
  "bg-rose-500", "bg-amber-500", "bg-cyan-500",
];

function InitialAvatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
      {name[0].toUpperCase()}
    </div>
  );
}

export default async function DashboardPage() {
  const { players, totalMatches, finishedMatches } = await getData();
  const paidCount = players.filter(p => p.hasPaid).length;
  const prizePool = paidCount * ENTRY_FEE;
  const progressPct = totalMatches > 0 ? Math.round((finishedMatches / totalMatches) * 100) : 0;
  const maxPoints = players[0]?.points ?? 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Žebříček</h1>
          <p className="text-gray-500 mt-1">Mistrovství světa · USA, Kanada, Mexiko 2026</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-emerald-700 text-sm font-medium">Live</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Zápasy */}
        <div className="bg-white border border-blue-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Zápasy</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar size={15} className="text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {finishedMatches}
            <span className="text-gray-400 text-lg font-normal">/{totalMatches}</span>
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-gray-400 text-xs mt-1.5">{progressPct}% odehráno</div>
        </div>

        {/* Hráči */}
        <div className="bg-white border border-blue-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hráči</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users size={15} className="text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{players.length}</div>
          <div className="text-gray-400 text-xs mt-1">Aktivních účastníků</div>
        </div>

        {/* Prize pool */}
        <div className="bg-white border border-blue-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prize pool</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Trophy size={15} className="text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {prizePool.toLocaleString("cs-CZ")}
            <span className="text-gray-400 text-base font-normal"> Kč</span>
          </div>
          <div className="text-gray-400 text-xs mt-1">{paidCount} z {players.length} hráčů zaplatilo</div>
        </div>

      </div>

      {/* Leaderboard */}
      <div className="bg-white border border-blue-900 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Trophy size={18} className="text-yellow-500" />
            <h2 className="text-gray-900 font-bold text-lg">Pořadí hráčů</h2>
          </div>
          <span className="hidden sm:block text-gray-400 text-sm">Bodů celkem</span>
        </div>

        {players.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            Žádní hráči zatím nejsou registrováni.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {players.map((player, idx) => {
              const rank = idx + 1;
              const barWidth = maxPoints > 0 ? Math.round((player.points / maxPoints) * 100) : 0;
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors ${rank === 1 ? "bg-yellow-50/50" : ""}`}
                >
                  <div className="w-8 shrink-0 text-center">
                    {rank <= 3 ? (
                      <span className="text-2xl">{RANK_LABELS[rank - 1]}</span>
                    ) : (
                      <span className="text-gray-400 font-black text-lg">{rank}</span>
                    )}
                  </div>

                  <InitialAvatar name={player.name} />

                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-bold text-xl">{player.name}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[80px] sm:max-w-[140px]">
                        <div
                          className={`h-full rounded-full ${rank <= 3 ? RANK_BAR_COLORS[rank - 1] : "bg-blue-500"}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="hidden sm:block text-gray-400 text-xs shrink-0">
                        {player.exactMatches} přesných
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-2xl font-bold ${rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-500" : rank === 3 ? "text-amber-600" : "text-gray-900"}`}>
                      {player.points}
                    </div>
                    <div className="text-gray-400 text-xs">bodů</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prize pool breakdown */}
      <div className="bg-white border border-blue-900 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏆</span>
            <h2 className="text-gray-900 font-bold text-lg">Rozdělení výher</h2>
          </div>
          <span className="text-gray-500 text-sm">
            Pool: <span className="text-gray-900 font-bold">{prizePool.toLocaleString("cs-CZ")} Kč</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {[
            { place: "1. místo", pct: 40, icon: "🥇", textColor: "text-yellow-500", bgColor: "bg-yellow-50", player: players[0] },
            { place: "2. místo", pct: 25, icon: "🥈", textColor: "text-gray-500", bgColor: "bg-gray-50", player: players[1] },
            { place: "3. místo", pct: 20, icon: "🥉", textColor: "text-amber-600", bgColor: "bg-amber-50", player: players[2] },
            { place: "4. místo", pct: 10, icon: "4️⃣", textColor: "text-blue-500", bgColor: "bg-blue-50", player: players[3] },
            { place: "5. místo", pct: 5,  icon: "5️⃣", textColor: "text-indigo-500", bgColor: "bg-indigo-50", player: players[4] },
          ].map(({ place, pct, icon, textColor, bgColor, player }) => (
            <div key={place} className={`flex flex-col items-center py-6 px-3 gap-1.5 text-center ${bgColor}`}>
              <span className="text-2xl">{icon}</span>
              <div className={`text-xl font-bold ${textColor}`}>
                {Math.round(prizePool * pct / 100).toLocaleString("cs-CZ")} Kč
              </div>
              <div className="text-sm font-bold text-gray-700">{pct} %</div>
              {player && (
                <div className="text-gray-800 text-xl font-bold mt-0.5">{player.name}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
