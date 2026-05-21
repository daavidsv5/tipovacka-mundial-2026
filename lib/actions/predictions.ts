"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function saveMatchPrediction(
  matchId: string,
  homeScore: number,
  awayScore: number,
  targetUserId: string
) {
  const session = await auth();
  if (!session) throw new Error("Nepřihlášen");

  const canEdit =
    session.user.id === targetUserId || session.user.role === "ADMIN";
  if (!canEdit) throw new Error("Nemáš oprávnění");

  // Zkontroluj, zda zápas ještě nezačal
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error("Zápas nenalezen");

  if (session.user.role !== "ADMIN" && new Date() >= match.date) {
    throw new Error("Zápas již začal — tip nelze změnit");
  }

  await prisma.matchPrediction.upsert({
    where: { userId_matchId: { userId: targetUserId, matchId } },
    create: { userId: targetUserId, matchId, homeScore, awayScore },
    update: { homeScore, awayScore },
  });

  revalidatePath(`/hraci/${targetUserId}`);
  return { ok: true };
}

export async function saveGroupPrediction(
  group: string,
  firstPlaceTeamId: string,
  secondPlaceTeamId: string,
  thirdPlaceTeamId: string | null,
  targetUserId: string
) {
  const session = await auth();
  if (!session) throw new Error("Nepřihlášen");

  const canEdit =
    session.user.id === targetUserId || session.user.role === "ADMIN";
  if (!canEdit) throw new Error("Nemáš oprávnění");

  if (thirdPlaceTeamId && session.user.role !== "ADMIN") {
    const thirdsUsed = await prisma.groupPrediction.count({
      where: { userId: targetUserId, thirdPlaceTeamId: { not: null }, group: { not: group } },
    });
    if (thirdsUsed >= 8) return { ok: false, error: "Maximálně 8 skupin může mít tip na 3. místo." };
  }

  await prisma.groupPrediction.upsert({
    where: { userId_group: { userId: targetUserId, group } },
    create: {
      userId: targetUserId,
      group,
      firstPlaceTeamId,
      secondPlaceTeamId,
      thirdPlaceTeamId,
    },
    update: { firstPlaceTeamId, secondPlaceTeamId, thirdPlaceTeamId },
  });

  revalidatePath(`/hraci/${targetUserId}`);
  return { ok: true };
}

export async function saveTournamentPrediction(data: {
  czechPlacement?: string;
  topScorer?: string;
  goldTeamId?: string;
  silverTeamId?: string;
  bronzeTeamId?: string;
  totalGoals?: number | null;
  targetUserId: string;
}) {
  const session = await auth();
  if (!session) throw new Error("Nepřihlášen");

  const canEdit =
    session.user.id === data.targetUserId || session.user.role === "ADMIN";
  if (!canEdit) throw new Error("Nemáš oprávnění");

  const payload = {
    czechPlacement: (data.czechPlacement || null) as never,
    topScorer: data.topScorer || null,
    goldTeamId: data.goldTeamId || null,
    silverTeamId: data.silverTeamId || null,
    bronzeTeamId: data.bronzeTeamId || null,
    totalGoals: data.totalGoals ?? null,
  };

  const existing = await prisma.tournamentPrediction.findUnique({
    where: { userId: data.targetUserId },
  });

  if (existing) {
    await prisma.tournamentPrediction.update({
      where: { id: existing.id },
      data: payload,
    });
  } else {
    await prisma.tournamentPrediction.create({
      data: { userId: data.targetUserId, ...payload },
    });
  }

  revalidatePath(`/hraci/${data.targetUserId}`);
  return { ok: true };
}
