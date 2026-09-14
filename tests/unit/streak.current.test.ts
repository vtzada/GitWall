import { describe, it, expect } from "vitest";
import { calculateCurrentStreak } from "@/domain/streak/calculateCurrentStreak";
import type { ContributionDay } from "@/domain/streak/types";

function day(date: string, count: number): ContributionDay {
  return { date, count, level: count > 0 ? 1 : 0 };
}

// now fixo: 2026-09-13 (domingo)
const NOW = new Date(2026, 8, 13, 12, 0, 0);

describe("calculateCurrentStreak", () => {
  it("retorna 0 para lista vazia", () => {
    expect(calculateCurrentStreak([], NOW)).toBe(0);
  });

  it("retorna 0 quando nenhum dia tem contribuição", () => {
    expect(
      calculateCurrentStreak(
        [day("2026-09-13", 0), day("2026-09-12", 0)],
        NOW,
      ),
    ).toBe(0);
  });

  it("conta a partir de hoje quando hoje tem contribuição", () => {
    const days = [
      day("2026-09-13", 3),
      day("2026-09-12", 1),
      day("2026-09-11", 2),
      day("2026-09-10", 0),
    ];
    expect(calculateCurrentStreak(days, NOW)).toBe(3);
  });

  it("conta a partir de ontem quando hoje não tem, mas ontem tem", () => {
    const days = [
      day("2026-09-13", 0),
      day("2026-09-12", 2),
      day("2026-09-11", 1),
    ];
    expect(calculateCurrentStreak(days, NOW)).toBe(2);
  });

  it("retorna 0 quando hoje e ontem não têm contribuição", () => {
    const days = [
      day("2026-09-13", 0),
      day("2026-09-12", 0),
      day("2026-09-11", 5),
    ];
    expect(calculateCurrentStreak(days, NOW)).toBe(0);
  });

  it("quebra na primeira lacuna", () => {
    const days = [
      day("2026-09-13", 1),
      day("2026-09-12", 1),
      day("2026-09-11", 0),
      day("2026-09-10", 1),
    ];
    expect(calculateCurrentStreak(days, NOW)).toBe(2);
  });

  it("ignora dias futuros", () => {
    const days = [
      day("2026-09-14", 100), // futuro
      day("2026-09-13", 1),
      day("2026-09-12", 1),
    ];
    expect(calculateCurrentStreak(days, NOW)).toBe(2);
  });

  it("atravessa virada de ano", () => {
    const now = new Date(2026, 0, 2, 12); // 2026-01-02
    const days = [
      day("2026-01-02", 1),
      day("2026-01-01", 1),
      day("2025-12-31", 1),
      day("2025-12-30", 1),
      day("2025-12-29", 0),
    ];
    expect(calculateCurrentStreak(days, now)).toBe(4);
  });

  it("funciona com entrada fora de ordem", () => {
    const days = [
      day("2026-09-11", 1),
      day("2026-09-13", 1),
      day("2026-09-12", 1),
    ];
    expect(calculateCurrentStreak(days, NOW)).toBe(3);
  });

  it("apenas ontem com contribuição conta streak de 1", () => {
    const days = [day("2026-09-12", 1)];
    expect(calculateCurrentStreak(days, NOW)).toBe(1);
  });
});