import { applyTheme, getThemeById } from "./themes";

export type BackgroundType = "solid" | "image" | "translucent";

export type BackgroundPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export const BACKGROUND_POSITIONS: { value: BackgroundPosition; label: string }[] = [
  { value: "top-left", label: "Superior esquerdo" },
  { value: "top-center", label: "Superior centro" },
  { value: "top-right", label: "Superior direito" },
  { value: "center-left", label: "Centro esquerdo" },
  { value: "center", label: "Centro" },
  { value: "center-right", label: "Centro direito" },
  { value: "bottom-left", label: "Inferior esquerdo" },
  { value: "bottom-center", label: "Inferior centro" },
  { value: "bottom-right", label: "Inferior direito" },
];

export const POSITION_CLASSES: Record<BackgroundPosition, string> = {
  "top-left": "justify-start items-start",
  "top-center": "justify-start items-center",
  "top-right": "justify-start items-end",
  "center-left": "justify-center items-start",
  "center": "justify-center items-center",
  "center-right": "justify-center items-end",
  "bottom-left": "justify-end items-start",
  "bottom-center": "justify-end items-center",
  "bottom-right": "justify-end items-end",
};

export interface UserPreferences {
  themeId: string;
  backgroundType: BackgroundType;
  backgroundPosition: BackgroundPosition;
  backgroundImage: string | null;
  backgroundOverlay: number; // 0..1
  backgroundBlur: number;    // 0..20 px
}

const PREFERENCES_KEY = "gitwall_user_preferences";

export const DEFAULT_PREFERENCES: UserPreferences = {
  themeId: "slate",
  backgroundType: "solid",
  backgroundPosition: "top-left",
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
