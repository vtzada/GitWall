interface StreakBadgeProps {
  current: number;
  caption?: string;
}

export function StreakBadge({
  current,
  caption = "dias seguidos",
}: StreakBadgeProps) {
  return (
    <div className="flex animate-fade-in flex-col gap-[clamp(0.5rem,1vmin,0.9rem)]">
      <div className="font-serif leading-[0.95] tabular-nums text-accent text-[clamp(6rem,15vmin,11rem)]">
        {current}
      </div>
      <div className="text-[clamp(0.8rem,1.3vmin,1rem)] text-text-secondary">
        {caption}
      </div>
    </div>
  );
}