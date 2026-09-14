export function WallpaperSkeleton() {
  const weeks = Array.from({ length: 52 });
  const days = Array.from({ length: 7 });

  return (
    <div className="flex animate-pulse flex-col gap-[clamp(1.25rem,2.5vmin,2.5rem)]">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-8 w-64 rounded bg-[#141a22]" />
        <div className="h-4 w-32 rounded bg-[#141a22]/60" />
      </div>

      {/* Streak + Calendar Grid Skeleton */}
      <div className="flex items-end gap-[clamp(2rem,4vmin,4rem)]">
        <div className="shrink-0 flex flex-col gap-2">
          <div className="h-28 w-24 rounded bg-[#141a22]" />
          <div className="h-3 w-20 rounded bg-[#141a22]/60" />
        </div>

        <div className="min-w-0 max-w-[1100px] flex-1">
          <div className="flex w-full flex-col gap-3">
            <div className="flex gap-[3px]">
              {weeks.map((_, wi) => (
                <div key={wi} className="flex flex-1 flex-col gap-[3px]">
                  {days.map((_, di) => (
                    <div
                      key={di}
                      className="aspect-square w-full rounded-sm bg-[#141a22]"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="max-w-[1100px] flex flex-col gap-4">
        <div className="h-px w-full bg-hairline" />
        <div className="h-4 w-96 rounded bg-[#141a22]" />
      </div>
    </div>
  );
}
