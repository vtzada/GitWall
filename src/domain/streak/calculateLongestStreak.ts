import type { ContributionDay } from "./types";
import { addDaysISO, compareISO } from "./helpers";

export function calculateLongestStreak(
  days: ReadonlyArray<ContributionDay>,
): number {
  const positiveDates = days
    .filter((d) => d.count > 0)
    .map((d) => d.date)
    .sort(compareISO);

  if (positiveDates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < positiveDates.length; i++) {
    const prev = positiveDates[i - 1];
    const curr = positiveDates[i];
    const expected = addDaysISO(prev, 1);

    if (curr === expected) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}
