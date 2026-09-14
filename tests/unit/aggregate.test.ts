import { describe, it, expect } from "vitest";
import { aggregateStats } from "@/domain/stats/aggregate";

const NOW = new Date(2026, 8, 13, 12); // 2026-09-13

describe("aggregateStats", () => {
  it("retorna tudo zerado para lista vazia", () => {
    expect(aggregateStats({ days: [] }, NOW)).toEqual({
      total: 0,
      last30Days: 0,
      lastContributionDate: null,
    });
  });

  it("soma total e encontra última contribuição", () => {
    const out = aggregateStats(
      {
        days: [
          { date: "2026-09-01", count: 2 },
          { date: "2026-09-10", count: 5 },
          { date: "2026-09-05", count: 0 },
        ],
      },
      NOW,
    );
    expect(out.total).toBe(7);
    expect(out.lastContributionDate).toBe("2026-09-10");
  });

  it("conta últimos 30 dias incluindo hoje", () => {
    const out = aggregateStats(
      {
        days: [
          { date: "2026-08-14", count: 1 }, // fora (31 dias atrás)
          { date: "2026-08-15", count: 1 }, // dentro (29 dias atrás)
          { date: "2026-09-13", count: 2 }, // hoje
        ],
      },
      NOW,
    );
    expect(out.last30Days).toBe(3);
  });

  it("ignora dias futuros na janela de 30 dias", () => {
    const out = aggregateStats(
      {
        days: [
          { date: "2026-09-13", count: 1 },
          { date: "2026-09-14", count: 100 },
        ],
      },
      NOW,
    );
    expect(out.last30Days).toBe(1);
  });

  it("lastContributionDate é null quando não há contribuições", () => {
    const out = aggregateStats(
      {
        days: [
          { date: "2026-09-10", count: 0 },
          { date: "2026-09-11", count: 0 },
        ],
      },
      NOW,
    );
    expect(out.lastContributionDate).toBeNull();
  });
});