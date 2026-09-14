import type { ReactNode } from "react";

interface WallpaperGridProps {
  header: ReactNode;
  streak: ReactNode;
  calendar: ReactNode;
  footer: ReactNode;
}

export function WallpaperGrid({
  header,
  streak,
  calendar,
  footer,
}: WallpaperGridProps) {
  return (
    <div className="flex flex-col gap-[clamp(1.25rem,2.5vmin,2.5rem)]">
      <header>{header}</header>

      <div className="flex items-end gap-[clamp(2rem,4vmin,4rem)]">
        <div className="shrink-0">{streak}</div>
        <div className="min-w-0 max-w-[1100px] flex-1">{calendar}</div>
      </div>

      <div className="max-w-[1100px]">{footer}</div>
    </div>
  );
}