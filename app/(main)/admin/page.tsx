import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminTabs } from "@/components/admin/admin-tabs";

async function getData() {
  async function safe(fn: () => Promise<any>, fallback: any) {
    try { return await fn(); } catch { return fallback; }
  }

  const [matches, teams, players, groupResults, tournamentResult, matchPredictions] = await Promise.all([
    safe(() => prisma.match.findMany({ include: { homeTeam: true, awayTeam: true }, orderBy: { matchNumber: "asc" } }), []),
    safe(() => prisma.team.findMany({ orderBy: [{ group: "asc" }, { name: "asc" }] }), []),
    safe(() => prisma.user.findMany({ where: { role: "PLAYER" }, select: { id: true, name: true, email: true, points: true, exactMatches: true, hasPaid: true, createdAt: true }, orderBy: { name: "asc" } }), []),
    safe(() => prisma.groupResult.findMany(), []),
    safe(() => prisma.tournamentResult.findUnique({ where: { id: "singleton" } }), null),
    safe(() => prisma.matchPrediction.findMany(), []),
  ]);

  return { matches, teams, players, groupResults, tournamentResult, matchPredictions };
}

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { matches, teams, players, groupResults, tournamentResult, matchPredictions } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
          <span className="text-xl">🛡️</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin panel</h1>
          <p className="text-gray-500 mt-0.5">Správa zápasů, výsledků a hráčů</p>
        </div>
      </div>
      <AdminTabs
        matches={matches}
        teams={teams}
        players={players}
        groupResults={groupResults}
        tournamentResult={tournamentResult}
        matchPredictions={matchPredictions}
      />
    </div>
  );
}
