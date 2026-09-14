import { getCurrentWindow } from "@tauri-apps/api/window";

interface WindowChromeProps {
  /** Esconde a chrome inteira (usado no modo wallpaper). */
  hidden?: boolean;
  onOpenSettings?: () => void;
  onToggleWallpaper?: () => void;
}

/**
 * Barra de título customizada. Substitui as decorações nativas
 * (desabilitadas em tauri.conf.json).
 *
 * - `data-tauri-drag-region` torna a área arrastável pelo Windows.
 * - Botões são discretos: configurações, wallpaper, minimizar e fechar.
 * - Sempre alinhado à estética do GitWall (flat, sem bordas).
 */
export function WindowChrome({
  hidden = false,
  onOpenSettings,
  onToggleWallpaper,
}: WindowChromeProps) {
  if (hidden) return null;

  const win = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="fixed inset-x-0 top-0 z-50 flex h-9 select-none items-center justify-between px-3 bg-bg/80 backdrop-blur-xs"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Título minimalista */}
      <div data-tauri-drag-region className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold tracking-wider text-text-muted">
          GITWALL
        </span>
      </div>

      {/* Espaço vazio arrastável */}
      <div data-tauri-drag-region className="flex-1" />

      {/* Botões */}
      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {onToggleWallpaper && (
          <ChromeButton
            onClick={onToggleWallpaper}
            label="Fixar como Wallpaper"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </ChromeButton>
        )}

        {onOpenSettings && (
          <ChromeButton onClick={onOpenSettings} label="Configurações">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </ChromeButton>
        )}

        <ChromeButton onClick={() => win.minimize()} label="Minimizar">
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <line
              x1="1"
              y1="5"
              x2="9"
              y2="5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </ChromeButton>
        <ChromeButton onClick={() => win.close()} label="Fechar" danger>
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <line
              x1="1.5"
              y1="1.5"
              x2="8.5"
              y2="8.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="8.5"
              y1="1.5"
              x2="1.5"
              y2="8.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </ChromeButton>
      </div>
    </div>
  );
}

function ChromeButton({
  onClick,
  label,
  danger,
  children,
}: {
  onClick: () => void;
  label: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={[
        "flex h-6 w-6 items-center justify-center rounded-sm transition-colors",
        danger
          ? "text-text-muted hover:bg-red-900/40 hover:text-red-300"
          : "text-text-muted hover:bg-surface hover:text-text-primary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}