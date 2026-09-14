export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  accent: string;
  accentDim: string;
  heatLevels: [string, string, string, string, string]; // level 0..4
  bg: string;
  bgElevated: string;
  previewColors: string[];
}

export const THEMES: ThemeConfig[] = [
  {
    id: "slate",
    name: "Minimal Slate",
    description: "Paleta editorial padrão com heatmap em tons de ardósia e ciano.",
    accent: "#e3a857",
    accentDim: "#8b6a3f",
    heatLevels: ["#141a22", "#1e3a4c", "#2d5f7a", "#3e8da8", "#5cc8d4"],
    bg: "#0a0d12",
    bgElevated: "#0f1319",
    previewColors: ["#e3a857", "#1e3a4c", "#3e8da8", "#5cc8d4"],
  },
  {
    id: "github",
    name: "GitHub Classic",
    description: "O clássico verde esmeralda icônico da história do GitHub.",
    accent: "#39d353",
    accentDim: "#1f6f3a",
    heatLevels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
    bg: "#0d1117",
    bgElevated: "#161b22",
    previewColors: ["#39d353", "#0e4429", "#006d32", "#26a641"],
  },
  {
    id: "dracula",
    name: "Dracula",
    description: "Cores frias e místicas com roxo, lilás e rosa neon.",
    accent: "#ff79c6",
    accentDim: "#bd93f9",
    heatLevels: ["#21222c", "#3d3f52", "#6272a4", "#bd93f9", "#ff79c6"],
    bg: "#181920",
    bgElevated: "#21222c",
    previewColors: ["#ff79c6", "#bd93f9", "#6272a4", "#3d3f52"],
  },
  {
    id: "tokyo",
    name: "Tokyo Night",
    description: "Estética cyberpunk inspirada nas luzes noturnas de Tóquio.",
    accent: "#f7768e",
    accentDim: "#9d4b68",
    heatLevels: ["#16161e", "#223249", "#3d59a1", "#7aa2f7", "#bb9af7"],
    bg: "#101017",
    bgElevated: "#16161e",
    previewColors: ["#f7768e", "#7aa2f7", "#3d59a1", "#bb9af7"],
  },
  {
    id: "flame",
    name: "Amber Flame",
    description: "Tons de fogo e pôr do sol combinando com o contador de streaks.",
    accent: "#fb923c",
    accentDim: "#9a3412",
    heatLevels: ["#1c1410", "#451a03", "#7c2d12", "#c2410c", "#f97316"],
    bg: "#0f0b09",
    bgElevated: "#1c1410",
    previewColors: ["#fb923c", "#f97316", "#c2410c", "#7c2d12"],
  },
  {
    id: "monochrome",
    name: "Monochrome Silver",
    description: "Minimalismo extremo em tons de prata, grafite e branco puro.",
    accent: "#ffffff",
    accentDim: "#a1a1aa",
    heatLevels: ["#18181b", "#27272a", "#52525b", "#a1a1aa", "#f4f4f5"],
    bg: "#09090b",
    bgElevated: "#18181b",
    previewColors: ["#ffffff", "#f4f4f5", "#a1a1aa", "#52525b"],
  },
];

export function getThemeById(id: string): ThemeConfig {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty("--color-bg", theme.bg);
  root.style.setProperty("--color-bg-elevated", theme.bgElevated);
  root.style.setProperty("--color-accent", theme.accent);
  root.style.setProperty("--color-accent-dim", theme.accentDim);

  theme.heatLevels.forEach((color, idx) => {
    root.style.setProperty(`--color-heat-${idx}`, color);
  });
}
