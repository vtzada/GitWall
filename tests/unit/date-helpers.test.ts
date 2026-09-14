import { describe, it, expect } from "vitest";
import {
  toLocalISODate,
  addDaysISO,
  todayLocalISO,
  yesterdayLocalISO,
  compareISO,
} from "@/domain/streak/helpers";

describe("date helpers", () => {
  it("toLocalISODate usa componentes locais, não UTC", () => {
    // 23:30 local — em UTC pode já ser o dia seguinte.
    const d = new Date(2026, 8, 13, 23, 30, 0);
    expect(toLocalISODate(d)).toBe("2026-09-13");
  });

  it("addDaysISO volta corretamente na virada de mês", () => {
    expect(addDaysISO("2026-09-01", -1)).toBe("2026-08-31");
  });

  it("addDaysISO atravessa virada de ano", () => {
    expect(addDaysISO("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("addDaysISO com 0 retorna o mesmo dia", () => {
    expect(addDaysISO("2026-09-13", 0)).toBe("2026-09-13");
  });

  it("addDaysISO para frente", () => {
    expect(addDaysISO("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("addDaysISO lida com ano bissexto", () => {
    expect(addDaysISO("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDaysISO("2028-02-29", 1)).toBe("2028-03-01");
  });

  it("todayLocalISO devolve formato YYYY-MM-DD", () => {
    expect(todayLocalISO(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("yesterdayLocalISO atravessa virada de mês", () => {
    expect(yesterdayLocalISO(new Date(2026, 8, 1, 12))).toBe("2026-08-31");
  });

  it("compareISO ordena corretamente", () => {
    expect(compareISO("2026-01-01", "2026-01-02")).toBeLessThan(0);
    expect(compareISO("2026-01-02", "2026-01-01")).toBeGreaterThan(0);
    expect(compareISO("2026-01-01", "2026-01-01")).toBe(0);
  });
});