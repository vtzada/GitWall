import { applyTheme, getThemeById } from "./themes";

export type BackgroundType = "solid" | "image" | "translucent";

export interface UserPreferences {
  themeId: string;
  backgroundType: BackgroundType;
  backgroundImage: string | null;
  backgroundOverlay: number; // 0..1
  backgroundBlur: number;    // 0..20 px
}

const PREFERENCES_KEY = "gitwall_user_preferences";

export const DEFAULT_PREFERENCES: UserPreferences = {
  themeId: "slate",
  backgroundType: "solid",
  backgroundImage: null,
  backgroundOverlay: 0.65,
  backgroundBlur: 0,
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences) {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.warn("Falha ao salvar preferências no localStorage:", err);
  }
}

export function initPreferences(): UserPreferences {
  const prefs = loadPreferences();
  const theme = getThemeById(prefs.themeId);
  applyTheme(theme);
  return prefs;
}
