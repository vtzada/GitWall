import type { ReactNode } from "react";
import type { BackgroundType } from "@/features/settings/preferences";

interface ScreenProps {
  children: ReactNode;
  backgroundType?: BackgroundType;
  backgroundImage?: string | null;
  backgroundOverlay?: number;
  backgroundBlur?: number;
}

export function Screen({
  children,
  backgroundType = "solid",
  backgroundImage,
  backgroundOverlay = 0.65,
  backgroundBlur = 0,
}: ScreenProps) {
  const showImage = backgroundType === "image" && backgroundImage;
  const showTranslucent = backgroundType === "translucent";

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

      {/* Conteúdo do Dashboard */}
      <div className="relative z-10 absolute bottom-0 left-0 w-full pl-[clamp(3.5rem,6vmin,6rem)] pr-[clamp(2.5rem,5vmin,5rem)] pb-[clamp(6.5rem,11vmin,9rem)] pt-[clamp(2.5rem,5vmin,5rem)]">
        <div className="max-w-[min(92vw,1500px)]">{children}</div>
      </div>
    </div>
  );
}
