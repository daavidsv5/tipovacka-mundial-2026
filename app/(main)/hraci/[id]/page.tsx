import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlayerTabs } from "@/components/player/player-tabs";

async function getData(playerId: string) {
  try {
    const [player, matches, teams, matchPredictions, groupPredictions, tournamentPrediction, groupResults] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: playerId },
          select: { id: true, name: true, role: true, points: true, exactMatches: true },
        }),
        prisma.match.findMany({
          include: { homeTeam: true, awayTeam: true },
          orderBy: { matchNumber: "asc" },
        }),
        prisma.team.findMany({ orderBy: [{ group: "asc" }, { name: "asc" }] }),
        prisma.matchPrediction.findMany({ where: { userId: playerId } }),
        prisma.groupPrediction.findMany({ where: { userId: playerId } }),
        prisma.tournamentPrediction.findUnique({ where: { userId: playerId } }),
        prisma.groupResult.findMany(),
      ]);
    return { player, matches, teams, matchPredictions, groupPredictions, tournamentPrediction, groupResults };
  } catch {
    return null;
  }
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500",
  "bg-rose-500", "bg-amber-500", "bg-cyan-500",
];

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const data = await getData(id);
  if (!data || !data.player || data.player.role === "ADMIN") notFound();

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = session.user.id === id;
  const canEdit = isOwner || isAdmin;

  const now = new Date();
  const firstGroupMatch = data.matches
    .filter((m) => m.stage === "GROUP")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const tournamentStarted = firstGroupMatch ? now >= new Date(firstGroupMatch.date) : false;

  const canEditGroups = isAdmin || (isOwner && !tournamentStarted);
  const canEditTournament = isAdmin || (isOwner && !tournamentStarted);
  const avatarColor = AVATAR_COLORS[data.player.name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="space-y-6">
      {/* Player header */}
      <div className="bg-white border border-blue-900 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${avatarColor} flex items-center justify-center text-xl sm:text-2xl font-black text-white shrink-0 shadow-sm`}>
            {data.player.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{data.player.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-0.5">
                {data.player.points ?? 0} b.
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-2 py-0.5">
                {data.player.exactMatches ?? 0} přesných
              </span>
            </div>
          </div>
        </div>
      </div>

      <PlayerTabs
        player={data.player}
        matches={data.matches}
        teams={data.teams}
        matchPredictions={data.matchPredictions}
        groupPredictions={data.groupPredictions}
        groupResults={data.groupResults}
        tournamentPrediction={data.tournamentPrediction}
        canEdit={canEdit}
        canEditGroups={canEditGroups}
        canEditTournament={canEditTournament}
      />
    </div>
  );
}
