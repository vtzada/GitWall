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
    <div className="flex flex-col gap-[clamp(1.5rem,3vmin,3rem)]">
      <header>{header}</header>

      <div className="flex items-end gap-[clamp(2.5rem,5vmin,5rem)]">
        <div className="shrink-0">{streak}</div>
        <div className="min-w-0 max-w-[min(80vw,1400px)] flex-1">{calendar}</div>
      </div>

      <div className="max-w-[min(80vw,1400px)]">{footer}</div>
    </div>
  );
}