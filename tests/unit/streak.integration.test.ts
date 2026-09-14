import { describe, it, expect } from "vitest";
import { calculateStreakStats } from "@/domain/streak/calculateStreakStats";
import type { ContributionDay } from "@/domain/streak/types";

function day(date: string, count: number): ContributionDay {
  return { date, count, level: count > 0 ? 1 : 0 };
}

const NOW = new Date(2026, 8, 13, 12); // 2026-09-13

describe("calculateStreakStats (integração)", () => {
  it("perfil sem contribuições", () => {
    const stats = calculateStreakStats([], NOW);
    expect(stats).toEqual({
      current: 0,
      longest: 0,
      total: 0,
      last30Days: 0,
      lastContributionDate: null,
    });
  });

  it("caso realista: sequência atual menor que a maior", () => {
    const days: ContributionDay[] = [
      // Sequência antiga de 5 dias
      day("2026-08-01", 1),
      day("2026-08-02", 1),
      day("2026-08-03", 1),
      day("2026-08-04", 1),
      day("2026-08-05", 1),
      // Lacuna
      day("2026-08-06", 0),
      // Sequência recente de 3 dias
      day("2026-09-11", 1),
      day("2026-09-12", 2),
      day("2026-09-13", 3),
    ];
    const stats = calculateStreakStats(days, NOW);
    expect(stats.current).toBe(3);
    expect(stats.longest).toBe(5);
    expect(stats.total).toBe(11);
    expect(stats.lastContributionDate).toBe("2026-09-13");
  });
});