import { useMemo } from "react";
import type { ContributionDayDto } from "@/tauri/commands";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const LEVEL_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-heat-0",
  1: "bg-heat-1",
  2: "bg-heat-2",
  3: "bg-heat-3",
  4: "bg-heat-4",
};

interface ContributionCalendarProps {
  days: ContributionDayDto[];
  year: number;
}

interface CalendarWeek {
  days: (ContributionDayDto | null)[];
}

interface MonthLabel {
  label: string;
  column: number;
}

interface CalendarData {
  weeks: CalendarWeek[];
  monthLabels: MonthLabel[];
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Organiza os dias em colunas de semana (domingo → sábado), como o GitHub.
 * Dias ausentes antes de 1º de janeiro e depois de 31 de dezembro viram
 * slots nulos, para o grid ficar sempre retangular.
 */
function buildCalendar(days: ContributionDayDto[]): CalendarData {
  if (days.length === 0) return { weeks: [], monthLabels: [] };

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  // 0 = domingo, 6 = sábado
  const firstDayOfWeek = parseISODate(sorted[0].date).getDay();

  const padded: (ContributionDayDto | null)[] =
    Array(firstDayOfWeek).fill(null);
  padded.push(...sorted);
  while (padded.length % 7 !== 0) padded.push(null);

  const weeks: CalendarWeek[] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push({ days: padded.slice(i, i + 7) });
  }

  const monthLabels: MonthLabel[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstReal = week.days.find(
      (d): d is ContributionDayDto => d !== null,
    );
    if (!firstReal) return;
    const month = parseISODate(firstReal.date).getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTHS[month], column: wi });
      lastMonth = month;
    }
  });

  return { weeks, monthLabels };
}

function formatTooltipDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ContributionCalendar({
  days,
  year,
}: ContributionCalendarProps) {
  const { weeks, monthLabels } = useMemo(() => buildCalendar(days), [days]);

  if (weeks.length === 0) {
    return (
      <div className="flex w-full items-center justify-center py-16 text-sm text-text-muted">
        Nenhuma contribuição encontrada
      </div>
    );
  }

  return (
    <div
      className="flex w-full animate-fade-in flex-col gap-4"
      role="region"
      aria-label={`Calendário de contribuições de ${year}`}
    >
      <div className="flex w-full flex-col gap-[4px]">
        {/* Rótulos de mês */}
        <div className="flex gap-[4px]">
          {weeks.map((_, wi) => {
            const label = monthLabels.find((m) => m.column === wi);
            return (
              <div
                key={wi}
                className="flex-1 text-[11px] leading-none text-text-muted"
              >
                {label?.label ?? ""}
              </div>
            );
          })}
        </div>

        {/* Grid de células */}
        <div className="flex gap-[4px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-1 flex-col gap-[4px]">
              {week.days.map((day, di) => (
                <div
                  key={di}
                  title={
                    day
                      ? `${day.count} ${
                          day.count === 1 ? "contribuição" : "contribuições"
                        } em ${formatTooltipDate(day.date)}`
                      : undefined
                  }
                  className={[
                    "aspect-square w-full min-w-[min(1.6vmin,14px)] min-h-[min(1.6vmin,14px)] flex-none rounded-[3px] transition-transform hover:scale-125",
                    day ? `${LEVEL_CLASSES[day.level]} cursor-pointer` : "bg-transparent",
                  ].join(" ")}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
