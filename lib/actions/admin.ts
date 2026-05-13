"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Přístup odepřen");
  return session;
}

// ─── Match výsledky ──────────────────────────────────────────────────────────

export async function saveMatchResult(matchId: string, homeScore: number, awayScore: number) {
  await requireAdmin();

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore, isFinished: true },
  });

  await recalculateMatchPoints(matchId, homeScore, awayScore);

  revalidatePath("/");
  revalidatePath("/vysledky");
  return { ok: true };
}

export async function assignPlayoffTeam(matchId: string, side: "home" | "away", teamId: string) {
  await requireAdmin();

  await prisma.match.update({
    where: { id: matchId },
    data: side === "home" ? { homeTeamId: teamId } : { awayTeamId: teamId },
  });

  revalidatePath("/vysledky");
  return { ok: true };
}

async function recalculateMatchPoints(matchId: string, realHome: number, realAway: number) {
  const predictions = await prisma.matchPrediction.findMany({ where: { matchId } });

  const realDiff = realHome - realAway;
  const realOutcome = realDiff > 0 ? "H" : realDiff < 0 ? "A" : "D";

  for (const pred of predictions) {
    const predDiff = pred.homeScore - pred.awayScore;
    const predOutcome = predDiff > 0 ? "H" : predDiff < 0 ? "A" : "D";

    let points = 0;
    if (pred.homeScore === realHome && pred.awayScore === realAway) {
      points = 5;
    } else if (predDiff === realDiff) {
      points = 3;
    } else if (predOutcome === realOutcome) {
      points = 2;
    }

    await prisma.matchPrediction.update({
      where: { id: pred.id },
      data: { pointsAwarded: points },
    });
  }

  await recalculateUserTotals();
}

// ─── Výsledky skupin ─────────────────────────────────────────────────────────

export async function saveGroupResult(
  group: string,
  firstPlaceTeamId: string | null,
  secondPlaceTeamId: string | null,
  thirdPlaceTeamId: string | null
) {
  await requireAdmin();

  await prisma.groupResult.upsert({
    where: { group },
    create: { group, firstPlaceTeamId, secondPlaceTeamId, thirdPlaceTeamId },
    update: { firstPlaceTeamId, secondPlaceTeamId, thirdPlaceTeamId },
  });

  await recalculateGroupPoints(group);

  revalidatePath("/");
  return { ok: true };
}

async function recalculateGroupPoints(group: string) {
  const result = await prisma.groupResult.findUnique({ where: { group } });
  if (!result) return;

  const predictions = await prisma.groupPrediction.findMany({ where: { group } });

  for (const pred of predictions) {
    let points = 0;
    if (result.firstPlaceTeamId && pred.firstPlaceTeamId === result.firstPlaceTeamId) points += 5;
    if (result.secondPlaceTeamId && pred.secondPlaceTeamId === result.secondPlaceTeamId) points += 5;
    if (result.thirdPlaceTeamId && pred.thirdPlaceTeamId === result.thirdPlaceTeamId) points += 5;

    await prisma.groupPrediction.update({
      where: { id: pred.id },
      data: { pointsAwarded: points },
    });
  }

  await recalculateUserTotals();
}

// ─── Výsledky turnaje ─────────────────────────────────────────────────────────

export async function saveTournamentResult(data: {
  czechPlacement: string | null;
  topScorer: string | null;
  goldTeamId: string | null;
  silverTeamId: string | null;
  bronzeTeamId: string | null;
}) {
  await requireAdmin();

  await prisma.tournamentResult.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data } as any,
    update: data as any,
  });

  await recalculateTournamentPoints();

  revalidatePath("/");
  return { ok: true };
}

async function recalculateTournamentPoints() {
  const result = await prisma.tournamentResult.findUnique({ where: { id: "singleton" } });
  if (!result) return;

  const predictions = await prisma.tournamentPrediction.findMany();

  for (const pred of predictions) {
    const czechPts = result.czechPlacement && pred.czechPlacement === result.czechPlacement ? 10 : 0;

    const topScorerPts =
      result.topScorer &&
      pred.topScorer &&
      pred.topScorer.trim().toLowerCase() === result.topScorer.trim().toLowerCase()
        ? 10
        : 0;

    let overallPts = 0;
    if (result.goldTeamId && pred.goldTeamId === result.goldTeamId) overallPts += 10;
    if (result.silverTeamId && pred.silverTeamId === result.silverTeamId) overallPts += 10;
    if (result.bronzeTeamId && pred.bronzeTeamId === result.bronzeTeamId) overallPts += 10;

    await prisma.tournamentPrediction.update({
      where: { id: pred.id },
      data: {
        czechPointsAwarded: czechPts,
        topScorerPointsAwarded: topScorerPts,
        overallPointsAwarded: overallPts,
      },
    });
  }

  await recalculateUserTotals();
}

// ─── Celkové body hráčů ───────────────────────────────────────────────────────

export async function recalculateUserTotals() {
  const users = await prisma.user.findMany({ where: { role: "PLAYER" } });

  for (const user of users) {
    const matchPts = await prisma.matchPrediction.aggregate({
      where: { userId: user.id },
      _sum: { pointsAwarded: true },
    });
    const exactMatches = await prisma.matchPrediction.count({
      where: { userId: user.id, pointsAwarded: 5 },
    });
    const groupPts = await prisma.groupPrediction.aggregate({
      where: { userId: user.id },
      _sum: { pointsAwarded: true },
    });
    const tournPts = await prisma.tournamentPrediction.findUnique({
      where: { userId: user.id },
      select: { czechPointsAwarded: true, topScorerPointsAwarded: true, overallPointsAwarded: true },
    });

    const total =
      (matchPts._sum.pointsAwarded ?? 0) +
      (groupPts._sum.pointsAwarded ?? 0) +
      (tournPts?.czechPointsAwarded ?? 0) +
      (tournPts?.topScorerPointsAwarded ?? 0) +
      (tournPts?.overallPointsAwarded ?? 0);

    await prisma.user.update({
      where: { id: user.id },
      data: { points: total, exactMatches },
    });
  }
}

// ─── Admin úprava tipů hráčů ─────────────────────────────────────────────────

export async function adminSaveMatchPrediction(
  matchId: string,
  userId: string,
  homeScore: number,
  awayScore: number
) {
  await requireAdmin();

  await prisma.matchPrediction.upsert({
    where: { userId_matchId: { userId, matchId } },
    create: { userId, matchId, homeScore, awayScore, pointsAwarded: 0 },
    update: { homeScore, awayScore },
  });

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (match?.isFinished && match.homeScore !== null && match.awayScore !== null) {
    await recalculateMatchPoints(matchId, match.homeScore, match.awayScore);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

// ─── Správa hráčů ─────────────────────────────────────────────────────────────

export async function addPlayer(name: string, email: string, password: string) {
  await requireAdmin();

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash: hash, role: "PLAYER" },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, id: user.id };
}

export async function resetPlayerPassword(userId: string, newPassword: string) {
  await requireAdmin();

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash },
  });

  return { ok: true };
}
