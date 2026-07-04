"use client";

import { useEffect } from "react";

type MatchLike = { id: string; date: Date | string };

function findScrollTargetMatchId(matches: MatchLike[]): string | null {
  if (!matches.length) return null;

  const now = new Date();
  const todayKey = now.toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague" });
  const withDates = matches.map((m) => ({ id: m.id, date: new Date(m.date) }));

  const todayMatch = withDates.find(
    (m) => m.date.toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague" }) === todayKey
  );
  if (todayMatch) return todayMatch.id;

  const future = withDates
    .filter((m) => m.date.getTime() > now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  if (future.length) return future[0].id;

  const past = withDates
    .filter((m) => m.date.getTime() <= now.getTime())
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  if (past.length) return past[0].id;

  return null;
}

export function useScrollToTodayMatch(matches: MatchLike[]) {
  useEffect(() => {
    const targetId = findScrollTargetMatchId(matches);
    if (!targetId) return;

    const el = document.getElementById(`match-${targetId}`);
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
