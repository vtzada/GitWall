interface StatsFooterProps {
  total: number;
  longest: number;
  lastContributionDate: string | null;
}

/**
 * Divisor hairline + frase em prosa. Sem bullets, sem uppercase.
 */
export function StatsFooter({
  total,
  longest,
  lastContributionDate,
}: StatsFooterProps) {
  const lastPhrase = lastContributionDate
    ? formatRelativeDate(lastContributionDate)
    : null;

  return (
    <footer className="flex animate-fade-in flex-col gap-[clamp(1rem,2.5vmin,2rem)]">
      <div className="h-px w-full bg-hairline" />

      <p className="text-[clamp(0.9rem,1.6vmin,1.25rem)] text-text-secondary tabular-nums">
        <span className="text-text-primary/90">{total}</span> contribuições no
        último ano, maior sequência de{" "}
        <span className="text-text-primary/90">{longest}</span>{" "}
        {longest === 1 ? "dia" : "dias"}
        {lastPhrase && (
          <>
            , última contribuição {lastPhrase}
          </>
        )}
        .
      </p>
    </footer>
  );
}

function formatRelativeDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today.getTime() - date.getTime()) / 86_400_000);

  if (diffDays <= 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) {
    const w = Math.floor(diffDays / 7);
    return w === 1 ? "há 1 semana" : `há ${w} semanas`;
  }
  if (diffDays < 365) {
    const mo = Math.floor(diffDays / 30);
    return mo === 1 ? "há 1 mês" : `há ${mo} meses`;
  }
  return `em ${date.getFullYear()}`;
}