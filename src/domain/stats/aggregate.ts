import type { AggregateInput, AggregateOutput } from "./types";
import { addDaysISO, compareISO, todayLocalISO } from "../streak/helpers";

export function aggregateStats(
  input: AggregateInput,
  now: Date = new Date(),
): AggregateOutput {
  const { days } = input;

  if (days.length === 0) {
    return { total: 0, last30Days: 0, lastContributionDate: null };
  }
    const today = todayLocalISO(now);
    const cutoff = addDaysISO(today, -29);

    let total = 0;
    let last30Days = 0;
    let lastContributionDate: string | null = null;

    for (const d of days) {
        total += d.count;

        if (d.count > 0) {
            if (
                lastContributionDate === null ||
                compareISO(d.date, lastContributionDate) > 0
            ) {
                lastContributionDate = d.date;
            }
        }
        if (compareISO(d.date, cutoff) >= 0 && compareISO(d.date, today) <= 0) {
            last30Days += d.count;
        }
    }
    return { total, last30Days: last30Days, lastContributionDate };
}