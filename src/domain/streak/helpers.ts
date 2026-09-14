export function toLocalISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function todayLocalISO(now: Date = new Date()): string {
    return toLocalISODate(now);
}

export function yesterdayLocalISO(now: Date = new Date()): string {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return toLocalISODate(d);
}

export function addDaysISO(iso: string, days: number): string {
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    return toLocalISODate(date);
}

export function compareISO(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}