import { useEffect, useState } from "react";
import {
  deleteStoredCredentials,
  getAutostart,
  setAutostart,
  storeCredentials,
} from "@/tauri/commands";
import { THEMES, applyTheme, getThemeById } from "./themes";
import { BACKGROUND_POSITIONS } from "./preferences";
import type { UserPreferences } from "./preferences";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (username: string, token: string) => void;
  initialUsername?: string;
  initialToken?: string;
  isInitialOnboarding?: boolean;
  preferences: UserPreferences;
  onPreferencesChange: (newPrefs: UserPreferences) => void;
}

type TabType = "conta" | "temas" | "fundo" | "sistema";

export function SettingsModal({
  isOpen,
  onClose,
  onSaved,
  initialUsername = "",
  initialToken = "",
  isInitialOnboarding = false,
  preferences,
  onPreferencesChange,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(
    isInitialOnboarding ? "conta" : "temas",
  );
  const [username, setUsername] = useState(initialUsername);
  const [token, setToken] = useState(initialToken);
  const [autostartEnabled, setAutostartEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUsername(initialUsername);
      setToken(initialToken);
      setError(null);
      if (isInitialOnboarding) {
        setActiveTab("conta");
      }
      getAutostart()
        .then(setAutostartEnabled)
        .catch(() => setAutostartEnabled(false));
    }
  }, [isOpen, initialUsername, initialToken, isInitialOnboarding]);

  if (!isOpen) return null;

  async function handleSaveAccount() {
    const trimmedUser = username.trim();
    const trimmedToken = token.trim();

    if (!trimmedUser) {
      setError("Por favor, informe seu nome de usuário do GitHub.");
      return;
    }

    if (!trimmedToken) {
      setError("Por favor, informe um Personal Access Token do GitHub.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await storeCredentials(trimmedUser, trimmedToken);
      await setAutostart(autostartEnabled).catch(() => {});
      onSaved(trimmedUser, trimmedToken);
      onClose();
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : "Falha ao salvar credenciais no Windows Credential Manager.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Deseja realmente desconectar e remover as credenciais salvas?")) {
      return;
    }
    try {
      await deleteStoredCredentials();
      setUsername("");
      setToken("");
      onSaved("", "");
      onClose();
    } catch (err) {
      setError("Falha ao remover credenciais: " + String(err));
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Por favor, selecione uma imagem com menos de 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onPreferencesChange({
        ...preferences,
        backgroundImage: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveBackground() {
    onPreferencesChange({
      ...preferences,
      backgroundImage: null,
    });
  }

  function handleSelectTheme(themeId: string) {
    const theme = getThemeById(themeId);
    applyTheme(theme);
    onPreferencesChange({
      ...preferences,
      themeId,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div
        className="w-full max-w-lg rounded-xl border border-hairline bg-[#0f1319] p-6 shadow-2xl flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header com título e botão fechar */}
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h2 className="font-serif text-2xl font-normal text-text-primary">
              {isInitialOnboarding ? "Bem-vindo ao GitWall" : "Configurações"}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {isInitialOnboarding
                ? "Conecte sua conta do GitHub para começar."
                : "Personalize tema, papel de parede e credenciais."}
            </p>
          </div>
          {!isInitialOnboarding && (
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors text-lg px-2 cursor-pointer"
              aria-label="Fechar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Abas de Navegação */}
        {!isInitialOnboarding && (
          <div className="flex gap-1 border-b border-hairline pt-2 pb-2">
            <TabButton
              active={activeTab === "temas"}
              onClick={() => setActiveTab("temas")}
              label="Temas"
            />
            <TabButton
              active={activeTab === "fundo"}
              onClick={() => setActiveTab("fundo")}
              label="Papel de Parede"
            />
            <TabButton
              active={activeTab === "conta"}
              onClick={() => setActiveTab("conta")}
              label="Conta GitHub"
            />
            <TabButton
              active={activeTab === "sistema"}
              onClick={() => setActiveTab("sistema")}
              label="Sistema"
            />
          </div>
        )}

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {error && (
            <div className="rounded border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* TAB 1: TEMAS */}
          {activeTab === "temas" && !isInitialOnboarding && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-semibold text-text-primary">
                  Paleta de Cores do Heatmap
                </h3>
                <p className="text-[11px] text-text-muted">
                  A cor do grid de contribuições e do destaque muda instantaneamente.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {THEMES.map((theme) => {
                  const isSelected = preferences.themeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`flex flex-col gap-2 rounded-lg border p-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-accent bg-white/5 ring-1 ring-accent"
                          : "border-hairline bg-[#141a22]/50 hover:border-text-muted hover:bg-[#141a22]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-text-primary">
                          {theme.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-accent font-mono font-bold">
                            ATIVO
                          </span>
                        )}
                      </div>

                      {/* Preview dos níveis de contribuição */}
                      <div className="flex items-center gap-1.5">
                        {theme.heatLevels.map((color, i) => (
                          <div
                            key={i}
                            className="h-3.5 w-3.5 rounded-xs"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <div
                          className="h-3.5 w-3.5 rounded-full ml-1"
                          style={{ backgroundColor: theme.accent }}
                          title="Cor de destaque"
                        />
                      </div>

                      <p className="text-[10px] text-text-muted leading-tight">
                        {theme.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PAPEL DE PAREDE DE FUNDO */}
          {activeTab === "fundo" && !isInitialOnboarding && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-text-primary">
                  Tipo de Fundo
                </h3>
                <p className="text-[11px] text-text-muted">
                  Escolha entre um fundo sólido, imagem personalizada ou translúcido.
                </p>
              </div>

              {/* Seletor de tipo de fundo */}
              <div className="flex gap-2">
                {(["solid", "image", "translucent"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      onPreferencesChange({
                        ...preferences,
                        backgroundType: type,
                        backgroundImage: type !== "image" ? null : preferences.backgroundImage,
                      })
                    }
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-center text-xs font-medium transition-all cursor-pointer ${
                      preferences.backgroundType === type
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-hairline bg-[#141a22]/50 text-text-secondary hover:border-text-muted hover:bg-[#141a22]"
                    }`}
                  >
                    {type === "solid" && "Sólido"}
                    {type === "image" && "Imagem"}
                    {type === "translucent" && "Translúcido"}
                  </button>
                ))}
              </div>

              {/* Seletor de posição do background */}
              <div className="space-y-2">
                <div>
                  <h3 className="text-xs font-semibold text-text-primary">
                    Posição do Conteúdo
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Onde o conteúdo ficará posicionado na tela.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 w-fit">
                  {BACKGROUND_POSITIONS.map((pos) => {
                    const isSelected = preferences.backgroundPosition === pos.value;
                    return (
                      <button
                        key={pos.value}
                        type="button"
                        onClick={() =>
                          onPreferencesChange({
                            ...preferences,
                            backgroundPosition: pos.value,
                          })
                        }
                        title={pos.label}
                        className={`relative h-10 w-14 rounded border transition-all cursor-pointer ${
                          isSelected
                            ? "border-accent bg-accent/15 ring-1 ring-accent"
                            : "border-hairline bg-[#141a22]/50 hover:border-text-muted hover:bg-[#141a22]"
                        }`}
                      >
                        <div
                          className={`absolute h-2 w-2 rounded-full transition-colors ${
                            isSelected ? "bg-accent" : "bg-text-muted/50"
                          }`}
                          style={{
                            top: pos.value.startsWith("top") ? "6px" : pos.value.startsWith("bottom") ? "calc(100% - 14px)" : "calc(50% - 4px)",
                            left: pos.value.endsWith("left") ? "6px" : pos.value.endsWith("right") ? "calc(100% - 14px)" : "calc(50% - 4px)",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-text-muted">
                  {BACKGROUND_POSITIONS.find((p) => p.value === preferences.backgroundPosition)?.label}
                </p>
              </div>

              {/* Modo Sólido */}
              {preferences.backgroundType === "solid" && (
                <div className="rounded-lg border border-hairline bg-[#141a22]/50 p-4">
                  <p className="text-xs text-text-secondary">
                    Fundo escuro using a cor do tema selecionado.
                  </p>
                </div>
              )}

              {/* Modo Translúcido */}
              {preferences.backgroundType === "translucent" && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-hairline bg-[#141a22]/50 p-4">
                    <p className="text-xs text-text-secondary mb-3">
                      Efeito de vidro fosco com blur e overlay escuro sobre o fundo do tema.
                    </p>
                    <div className="h-16 w-full rounded bg-gradient-to-br from-accent/20 to-heat-2/30 backdrop-blur-md border border-white/5" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">
                        Intensidade do Blur
                      </span>
                      <span className="text-text-muted font-mono text-[11px]">
                        {preferences.backgroundBlur || 8}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="16"
                      step="1"
                      value={preferences.backgroundBlur || 8}
                      onChange={(e) =>
                        onPreferencesChange({
                          ...preferences,
                          backgroundBlur: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-[#e3a857] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">
                        Opacidade do Overlay
                      </span>
                      <span className="text-text-muted font-mono text-[11px]">
                        {Math.round(preferences.backgroundOverlay * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.30"
                      max="0.95"
                      step="0.05"
                      value={preferences.backgroundOverlay}
                      onChange={(e) =>
                        onPreferencesChange({
                          ...preferences,
                          backgroundOverlay: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-[#e3a857] cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Modo Imagem */}
              {preferences.backgroundType === "image" && (
                <div className="space-y-4">
                  {preferences.backgroundImage ? (
                    <div className="space-y-3">
                      <div className="relative h-32 w-full overflow-hidden rounded-lg border border-hairline bg-[#141a22]">
                        <img
                          src={preferences.backgroundImage}
                          alt="Preview do wallpaper"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                          <label className="cursor-pointer rounded bg-accent px-3 py-1.5 text-xs font-medium text-[#0a0d12] hover:bg-[#ebd28b] transition-colors">
                            Trocar imagem
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleRemoveBackground}
                            className="rounded border border-red-800 bg-red-950/80 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900 transition-colors cursor-pointer"
                          >
                            Remover imagem
                          </button>
                        </div>
                      </div>

                      {/* Sliders de Contraste e Desfoque */}
                      <div className="space-y-3 pt-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-secondary">
                              Escurecimento / Contraste
                            </span>
                            <span className="text-text-muted font-mono text-[11px]">
                              {Math.round(preferences.backgroundOverlay * 100)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.30"
                            max="0.95"
                            step="0.05"
                            value={preferences.backgroundOverlay}
                            onChange={(e) =>
                              onPreferencesChange({
                                ...preferences,
                                backgroundOverlay: parseFloat(e.target.value),
                              })
                            }
                            className="w-full accent-[#e3a857] cursor-pointer"
                          />
                          <p className="text-[10px] text-text-muted">
                            Escurece a imagem para manter o texto e o calendário sempre legíveis.
                          </p>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-secondary">
                              Desfoque Suave (Blur)
                            </span>
                            <span className="text-text-muted font-mono text-[11px]">
                              {preferences.backgroundBlur}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="16"
                            step="1"
                            value={preferences.backgroundBlur}
                            onChange={(e) =>
                              onPreferencesChange({
                                ...preferences,
                                backgroundBlur: parseInt(e.target.value, 10),
                              })
                            }
                            className="w-full accent-[#e3a857] cursor-pointer"
                          />
                          <p className="text-[10px] text-text-muted">
                            Cria um efeito acrílico e suave no fundo.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-hairline p-6 text-center">
                      <div className="text-text-muted mb-2">
                        <svg
                          className="mx-auto h-8 w-8 stroke-1 text-text-muted"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-xs text-text-secondary mb-3">
                        Nenhuma imagem selecionada. Selecione uma imagem do seu computador.
                      </p>
                      <label className="inline-block cursor-pointer rounded bg-accent px-4 py-2 text-xs font-medium text-[#0a0d12] hover:bg-[#ebd28b] transition-colors">
                        Selecionar imagem do computador
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTA GITHUB */}
          {(activeTab === "conta" || isInitialOnboarding) && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Usuário do GitHub
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: vtzada"
                  className="w-full rounded border border-hairline bg-[#141a22] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-text-secondary">
                    Personal Access Token (classic ou fine-grained)
                  </label>
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-accent hover:underline"
                  >
                    Gerar token no GitHub ↗
                  </a>
                </div>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full rounded border border-hairline bg-[#141a22] px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
                />
                <p className="mt-1 text-[11px] text-text-muted">
                  Criptografado com segurança pelo Windows Credential Manager nativo.
                </p>
              </div>

              {!isInitialOnboarding && initialUsername && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    Desconectar conta e apagar credenciais
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SISTEMA */}
          {activeTab === "sistema" && !isInitialOnboarding && (
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none rounded-lg border border-hairline bg-[#141a22]/50 p-4">
                <input
                  type="checkbox"
                  checked={autostartEnabled}
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    setAutostartEnabled(checked);
                    await setAutostart(checked).catch(() => {});
                  }}
                  className="h-4 w-4 rounded border-hairline bg-[#141a22] accent-[#e3a857]"
                />
                <div>
                  <span className="text-xs font-medium text-text-primary">
                    Iniciar automaticamente com o Windows
                  </span>
                  <p className="text-[11px] text-text-muted">
                    Abre o GitWall em segundo plano ao ligar o computador.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer com botões */}
        <div className="border-t border-hairline pt-4 flex items-center justify-end gap-2">
          {!isInitialOnboarding && (
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-hairline bg-transparent px-3.5 py-1.5 text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors cursor-pointer"
            >
              Fechar
            </button>
          )}
          {(activeTab === "conta" || isInitialOnboarding) && (
            <button
              type="button"
              onClick={handleSaveAccount}
              disabled={saving}
              className="rounded bg-accent px-4 py-1.5 text-xs font-medium text-[#0a0d12] hover:bg-[#ebd28b] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? "Salvando..." : "Salvar Credenciais"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
        active
          ? "bg-accent/15 text-accent border border-accent/30"
          : "text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent"
      }`}
    >
      {label}
    </button>
  );
}
