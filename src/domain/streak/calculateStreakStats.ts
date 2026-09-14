import type { ContributionDay, StreakStats } from "./types";
import { calculateCurrentStreak } from "./calculateCurrentStreak";
import { calculateLongestStreak } from "./calculateLongestStreak";
import { aggregateStats } from "../stats/aggregate";

export function calculateStreakStats(
  days: ReadonlyArray<ContributionDay>,
  now: Date = new Date(),
): StreakStats {
  const current = calculateCurrentStreak(days, now);
  const longest = calculateLongestStreak(days);
  const { total, last30Days, lastContributionDate } = aggregateStats(
    { days },
    now,
  );

  return { current, longest, total, last30Days, lastContributionDate };
}