import type { ReactNode } from "react";
import type { BackgroundType, BackgroundPosition } from "@/features/settings/preferences";
import { POSITION_CLASSES } from "@/features/settings/preferences";

interface ScreenProps {
  children: ReactNode;
  backgroundType?: BackgroundType;
  backgroundPosition?: BackgroundPosition;
  backgroundImage?: string | null;
  backgroundOverlay?: number;
  backgroundBlur?: number;
}

export function Screen({
  children,
  backgroundType = "solid",
  backgroundPosition = "top-left",
  backgroundImage,
  backgroundOverlay = 0.65,
  backgroundBlur = 0,
}: ScreenProps) {
  const showImage = backgroundType === "image" && backgroundImage;
  const showTranslucent = backgroundType === "translucent";
  const positionClasses = POSITION_CLASSES[backgroundPosition];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg">
      {/* Camada de Imagem de Fundo Personalizada */}
      {showImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out"
          style={{
            backgroundImage: `url("${backgroundImage}")`,
            filter: backgroundBlur > 0 ? `blur(${backgroundBlur}px)` : undefined,
            transform: backgroundBlur > 0 ? "scale(1.04)" : undefined,
          }}
        />
      )}

      {/* Camada Translúcida (blur do fundo do tema + overlay) */}
      {showTranslucent && (
        <div
          className="absolute inset-0 transition-all duration-500 ease-out"
          style={{
            backgroundColor: "var(--color-bg)",
            filter: `blur(${backgroundBlur || 8}px)`,
            transform: "scale(1.04)",
          }}
        />
      )}

      {/* Camada de Overlay Escuro para Legibilidade */}
      {(showImage || showTranslucent) && (
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundColor: "#000000",
            opacity: backgroundOverlay,
          }}
        />
      )}

      {/* Conteúdo do Dashboard — posicionado via flexbox */}
      <div className={`relative z-10 h-full w-full flex flex-col p-[clamp(2.5rem,5vmin,5rem)] ${positionClasses}`}>
        <div className="max-w-[min(94vw,1800px)]">{children}</div>
      </div>
    </div>
  );
}
