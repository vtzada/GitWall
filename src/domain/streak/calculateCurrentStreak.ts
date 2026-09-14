import type { ContributionDay } from "./types";
import { addDaysISO, todayLocalISO, yesterdayLocalISO } from "./helpers";

export function calculateCurrentStreak(
  days: ReadonlyArray<ContributionDay>,
  now: Date = new Date(),
): number {
  if (days.length === 0) return 0;
  
  // Indexa por data. Se houver duplicatas, a última vence.
  const countByDate = new Map<string, number>();
  for (const d of days) {
    countByDate.set(d.date, d.count);
  }

  const today = todayLocalISO(now);
  const yesterday = yesterdayLocalISO(now);

 // Descobre o dia-âncora.
  let cursor: string;
  const todayCount = countByDate.get(today) ?? 0;
  const yesterdayCount = countByDate.get(yesterday) ?? 0;

  if (todayCount > 0) {
    cursor = today;
  } else if (yesterdayCount > 0) {
    cursor = yesterday;
  } else {
    return 0;
  }

// Conta para trás, dia a dia, até encontrar uma lacuna.
  let streak = 0;

  while (true) {
    const count = countByDate.get(cursor) ?? 0;
    if (count <= 0) break;
    streak++;
    cursor = addDaysISO(cursor, -1);
  }

  return streak;
}
