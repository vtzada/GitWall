import { describe, it, expect } from "vitest";
import { calculateLongestStreak } from "@/domain/streak/calculateLongestStreak";
import type { ContributionDay } from "@/domain/streak/types";

function day(date: string, count: number): ContributionDay {
  return { date, count, level: count > 0 ? 1 : 0 };
}

describe("calculateLongestStreak", () => {
  it("retorna 0 para lista vazia", () => {
    expect(calculateLongestStreak([])).toBe(0);
  });

  it("retorna 0 quando nenhum dia tem contribuição", () => {
    expect(
      calculateLongestStreak([day("2026-09-13", 0), day("2026-09-12", 0)]),
    ).toBe(0);
  });

  it("encontra a maior sequência entre várias", () => {
    const days = [
      day("2026-09-01", 1),
      day("2026-09-02", 1),
      day("2026-09-03", 0),
      day("2026-09-04", 1),
      day("2026-09-05", 1),
      day("2026-09-06", 1),
      day("2026-09-07", 1),
      day("2026-09-08", 0),
      day("2026-09-09", 1),
    ];
    expect(calculateLongestStreak(days)).toBe(4);
  });

  it("maior sequência no começo", () => {
    const days = [
      day("2026-09-01", 1),
      day("2026-09-02", 1),
      day("2026-09-03", 1),
      day("2026-09-04", 0),
      day("2026-09-05", 1),
    ];
    expect(calculateLongestStreak(days)).toBe(3);
  });

  it("atravessa virada de ano", () => {
    const days = [
      day("2025-12-30", 1),
      day("2025-12-31", 1),
      day("2026-01-01", 1),
      day("2026-01-02", 1),
    ];
    expect(calculateLongestStreak(days)).toBe(4);
  });

  it("funciona com entrada fora de ordem", () => {
    const days = [
      day("2026-09-05", 1),
      day("2026-09-03", 1),
      day("2026-09-04", 1),
      day("2026-09-06", 1),
    ];
    expect(calculateLongestStreak(days)).toBe(4);
  });

  it("dias ausentes contam como lacuna", () => {
    const days = [
      day("2026-09-01", 1),
      // 09-02 ausente
      day("2026-09-03", 1),
      day("2026-09-04", 1),
    ];
    expect(calculateLongestStreak(days)).toBe(2);
  });
});