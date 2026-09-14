import { useCallback, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import { Screen } from "./shared/ui/Screen";
import { WindowChrome } from "./shared/ui/WindowChrome";
import { WallpaperSkeleton } from "./shared/ui/WallpaperSkeleton";
import { WallpaperError } from "./shared/ui/WallpaperError";
import { WallpaperGrid } from "./features/wallpaper/layout/WallpaperGrid";
import { StreakBadge } from "./features/wallpaper/StreakBadge";
import { ContributionCalendar } from "./features/wallpaper/ContributionCalendar";
import { ProfileHeader } from "./features/wallpaper/ProfileHeader";
import { StatsFooter } from "./features/wallpaper/StatsFooter";
import { SettingsModal } from "./features/settings/SettingsModal";
import {
  initPreferences,
  savePreferences,
  type UserPreferences,
} from "./features/settings/preferences";
import {
  attachWallpaper,
  detachWallpaper,
  fetchContributions,
  getCachedContributions,
  getStoredCredentials,
  saveCachedContributions,
  type ContributionPayload,
  type CredentialsPayload,
  type GithubError,
} from "./tauri/commands";
import { calculateStreakStats } from "./domain/streak/calculateStreakStats";

function getMsUntilMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    10,
  );
  return tomorrow.getTime() - now.getTime();
}

function App() {
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    initPreferences(),
  );
  const [credentials, setCredentials] = useState<CredentialsPayload | null>(null);
  const [data, setData] = useState<ContributionPayload | null>(null);
  const [error, setError] = useState<GithubError | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wallpaperMode, setWallpaperMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Busca dados na API e persiste em cache
  const loadData = useCallback(async (creds: CredentialsPayload, silent = false) => {
    if (!silent) {
      setError(null);
    }
    try {
      const year = new Date().getFullYear();
      const result = await fetchContributions({
        username: creds.username,
        year,
        token: creds.token,
      });
      setData(result);
      setError(null);
      setIsOffline(false);
      await saveCachedContributions(result).catch(() => {});
    } catch (err) {
      console.warn("Falha na consulta do GitHub:", err);
      // Se já temos dados carregados (ex: do cache local), não quebramos a tela
      setData((prev) => {
        if (prev) {
          setIsOffline(true);
          return prev;
        }
        setError(err as GithubError);
        return null;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicialização: carrega credenciais e cache
  useEffect(() => {
    let mounted = true;

    async function init() {
      // 1. Tenta carregar cache primeiro para renderização imediata
      try {
        const cached = await getCachedContributions();
        if (cached && mounted) {
          setData(cached);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Falha ao ler cache local:", err);
      }

      // 2. Busca credenciais salvas no Windows Credential Manager
      try {
        const stored = await getStoredCredentials();
        if (!mounted) return;

        if (!stored || !stored.username || !stored.token) {
          // Sem credenciais salvas -> abre onboarding
          setIsOnboarding(true);
          setIsSettingsOpen(true);
          setLoading(false);
        } else {
          setCredentials(stored);
          await loadData(stored);
        }
      } catch (err) {
        console.error("Erro ao ler credenciais salvas:", err);
        if (mounted) {
          setIsOnboarding(true);
          setIsSettingsOpen(true);
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [loadData]);

  // Escuta eventos vindos do Rust (tray e IPC)
  useEffect(() => {
    const unlistenMode = listen<boolean>("wallpaper-mode", (event) => {
      setWallpaperMode(event.payload);
    });

    const unlistenSettings = listen("open-settings", () => {
      setIsSettingsOpen(true);
    });

    return () => {
      unlistenMode.then((fn) => fn());
      unlistenSettings.then((fn) => fn());
    };
  }, []);

  // Atualização periódica (a cada 60 minutos) e na virada da meia-noite
  useEffect(() => {
    if (!credentials) return;

    // Intervalo de 60 minutos
    const interval = setInterval(() => {
      loadData(credentials, true);
    }, 60 * 60 * 1000);

    // Timeout para meia-noite
    const msUntilMidnight = getMsUntilMidnight();
    const midnightTimeout = setTimeout(() => {
      loadData(credentials, true);
    }, msUntilMidnight);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
    };
  }, [credentials, loadData]);

  async function handleToggleWallpaper() {
    try {
      if (wallpaperMode) {
        await detachWallpaper();
      } else {
        await attachWallpaper();
      }
    } catch (err) {
      console.error("Falha ao alternar modo wallpaper:", err);
    }
  }

  function handleCredentialsSaved(username: string, token: string) {
    if (username && token) {
      const creds = { username, token };
      setCredentials(creds);
      setIsOnboarding(false);
      setLoading(true);
      loadData(creds);
    } else {
      setCredentials(null);
      setData(null);
      setIsOnboarding(true);
      setIsSettingsOpen(true);
    }
  }

  function handlePreferencesChange(newPrefs: UserPreferences) {
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  }

  const currentYear = new Date().getFullYear();
  const stats = data ? calculateStreakStats(data.days) : null;

  return (
    <>
      <WindowChrome
        hidden={wallpaperMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleWallpaper={handleToggleWallpaper}
      />

      <Screen
        backgroundType={preferences.backgroundType}
        backgroundPosition={preferences.backgroundPosition}
        backgroundImage={preferences.backgroundImage}
        backgroundOverlay={preferences.backgroundOverlay}
        backgroundBlur={preferences.backgroundBlur}
      >
        {loading && !data && <WallpaperSkeleton />}

        {error && !data && (
          <WallpaperError
            error={error}
            onRetry={() => credentials && loadData(credentials)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {data && stats && (
          <div className="relative">
            <WallpaperGrid
              header={
                <ProfileHeader name={data.user.name} login={data.user.login} />
              }
              streak={<StreakBadge current={stats.current} />}
              calendar={
                <ContributionCalendar days={data.days} year={currentYear} />
              }
              footer={
                <div className="flex flex-col gap-2">
                  <StatsFooter
                    total={stats.total}
                    longest={stats.longest}
                    lastContributionDate={stats.lastContributionDate}
                  />
                  {isOffline && (
                    <p className="text-[11px] text-accent-dim">
                      ● Exibindo dados locais em cache (offline)
                    </p>
                  )}
                </div>
              }
            />
          </div>
        )}
      </Screen>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialUsername={credentials?.username ?? ""}
        initialToken={credentials?.token ?? ""}
        isInitialOnboarding={isOnboarding}
        preferences={preferences}
        onPreferencesChange={handlePreferencesChange}
        onSaved={handleCredentialsSaved}
      />
    </>
  );
}

export default App;