import { prisma } from "@/lib/prisma";
import { VysledkyTabs } from "@/components/vysledky-tabs";

async function getData() {
  async function safe(fn: () => Promise<any>, fallback: any) {
    try { return await fn(); } catch { return fallback; }
  }

  const [matches, teams, groupResults, tournamentResult] = await Promise.all([
    safe(() => prisma.match.findMany({ include: { homeTeam: true, awayTeam: true }, orderBy: { matchNumber: "asc" } }), []),
    safe(() => prisma.team.findMany({ orderBy: [{ group: "asc" }, { name: "asc" }] }), []),
    safe(() => prisma.groupResult.findMany(), []),
    safe(() => prisma.tournamentResult.findUnique({ where: { id: "singleton" } }), null),
  ]);

  return { matches, teams, groupResults, tournamentResult };
}

export default async function VysledkyPage() {
  const { matches, teams, groupResults, tournamentResult } = await getData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Výsledky</h1>
        <p className="text-gray-500 mt-1">Zápasy, skupiny a turnajové výsledky</p>
      </div>

      <VysledkyTabs
        matches={matches}
        teams={teams}
        groupResults={groupResults}
        tournamentResult={tournamentResult}
      />
    </div>
  );
}
