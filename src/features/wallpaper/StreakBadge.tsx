interface StreakBadgeProps {
  current: number;
  caption?: string;
}

export function StreakBadge({
  current,
  caption = "dias seguidos",
}: StreakBadgeProps) {
  return (
    <div className="flex animate-fade-in flex-col gap-[clamp(0.5rem,1.2vmin,1rem)]">
      <div className="font-serif leading-[0.9] tabular-nums text-accent text-[clamp(7rem,18vmin,14rem)]">
        {current}
      </div>
      <div className="text-[clamp(0.9rem,1.6vmin,1.25rem)] text-text-secondary">
        {caption}
      </div>
    </div>
  );
}