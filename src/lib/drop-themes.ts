import { asset } from "./asset";

export interface DropTheme {
  id: string;
  model: string;
  name: string;
  edition: string;
  price: number;
  tagline: string;
  colors: {
    bg: string;
    fg: string;
    muted: string;
    accent: string;
    btn: string;
    btnText: string;
    selectionBg: string;
    selectionFg: string;
  };
  lighting: {
    ambient: number;
    keyIntensity: number;
    keyPosition: [number, number, number];
    fillIntensity: number;
    fillPosition: [number, number, number];
    bg?: string;
  };
  toolbarVariant: "light" | "dark";
  modelScale: number;
  cameraZ: number;
}

export const DROP_THEMES: DropTheme[] = [
  {
    id: "heart",
    model: asset("/models/gallery/heart.glb"),
    name: "PULSE HEART",
    edition: "Valentine Drop",
    price: 420_000,
    tagline: "Бьётся в такт",
    colors: {
      bg: "#1a0a12",
      fg: "#ffe8ef",
      muted: "#c9a0b0",
      accent: "#ff4d7a",
      btn: "#ff4d7a",
      btnText: "#1a0a12",
      selectionBg: "#ff4d7a",
      selectionFg: "#1a0a12",
    },
    lighting: {
      ambient: 0.45,
      keyIntensity: 1.2,
      keyPosition: [3, 5, 6],
      fillIntensity: 0.5,
      fillPosition: [-4, 1, -3],
      bg: "#1a0a12",
    },
    toolbarVariant: "dark",
    modelScale: 2.4,
    cameraZ: 4.2,
  },
  {
    id: "plant",
    model: asset("/models/gallery/plant.glb"),
    name: "TINY PLANET",
    edition: "Botanical",
    price: 380_000,
    tagline: "Живёт на полке",
    colors: {
      bg: "#e8f3e6",
      fg: "#1a2e1a",
      muted: "#5a7a5a",
      accent: "#2d8a4e",
      btn: "#1a4d32",
      btnText: "#e8f3e6",
      selectionBg: "#1a4d32",
      selectionFg: "#e8f3e6",
    },
    lighting: {
      ambient: 0.65,
      keyIntensity: 1,
      keyPosition: [5, 8, 4],
      fillIntensity: 0.4,
      fillPosition: [-3, 2, -2],
      bg: "#e8f3e6",
    },
    toolbarVariant: "light",
    modelScale: 2.2,
    cameraZ: 4.5,
  },
  {
    id: "toilet-paper",
    model: asset("/models/gallery/toilet-paper.glb"),
    name: "ROLL CLASSIC",
    edition: "Essential",
    price: 99_000,
    tagline: "Никогда не подведёт",
    colors: {
      bg: "#f4f8fc",
      fg: "#1a2a3a",
      muted: "#7a8fa0",
      accent: "#3b8beb",
      btn: "#2563eb",
      btnText: "#ffffff",
      selectionBg: "#2563eb",
      selectionFg: "#ffffff",
    },
    lighting: {
      ambient: 0.75,
      keyIntensity: 0.9,
      keyPosition: [2, 4, 5],
      fillIntensity: 0.35,
      fillPosition: [-2, 1, -3],
      bg: "#f4f8fc",
    },
    toolbarVariant: "light",
    modelScale: 3,
    cameraZ: 3.8,
  },
  {
    id: "zombie",
    model: asset("/models/gallery/zombie.glb"),
    name: "DEAD RISE",
    edition: "Horror Pack",
    price: 666_000,
    tagline: "Уже идёт за тобой",
    colors: {
      bg: "#0d120d",
      fg: "#c8e6c0",
      muted: "#6a8a62",
      accent: "#7cfc00",
      btn: "#3d5c2e",
      btnText: "#c8e6c0",
      selectionBg: "#7cfc00",
      selectionFg: "#0d120d",
    },
    lighting: {
      ambient: 0.35,
      keyIntensity: 0.8,
      keyPosition: [2, 3, 4],
      fillIntensity: 0.25,
      fillPosition: [-5, 0, -4],
      bg: "#0d120d",
    },
    toolbarVariant: "dark",
    modelScale: 2,
    cameraZ: 5,
  },
  {
    id: "pixel-figure",
    model: asset("/models/gallery/pixel-figure.glb"),
    name: "PIXEL BUDDY",
    edition: "8-Bit",
    price: 256_000,
    tagline: "Ретро, но объёмный",
    colors: {
      bg: "#1a1030",
      fg: "#f0e6ff",
      muted: "#a080d0",
      accent: "#b44dff",
      btn: "#7c3aed",
      btnText: "#f0e6ff",
      selectionBg: "#b44dff",
      selectionFg: "#1a1030",
    },
    lighting: {
      ambient: 0.5,
      keyIntensity: 1.1,
      keyPosition: [4, 6, 5],
      fillIntensity: 0.45,
      fillPosition: [-3, 2, -4],
      bg: "#1a1030",
    },
    toolbarVariant: "dark",
    modelScale: 2.1,
    cameraZ: 4.4,
  },
  {
    id: "raccoon",
    model: asset("/models/gallery/raccoon.glb"),
    name: "TRASH PANDA",
    edition: "Cute Chaos",
    price: 450_000,
    tagline: "Милый, но опасный",
    colors: {
      bg: "#f5ebe0",
      fg: "#2c1810",
      muted: "#8a6a52",
      accent: "#e07a2f",
      btn: "#5c3d2e",
      btnText: "#f5ebe0",
      selectionBg: "#5c3d2e",
      selectionFg: "#f5ebe0",
    },
    lighting: {
      ambient: 0.6,
      keyIntensity: 1,
      keyPosition: [3, 5, 6],
      fillIntensity: 0.4,
      fillPosition: [-4, 2, -3],
      bg: "#f5ebe0",
    },
    toolbarVariant: "light",
    modelScale: 2,
    cameraZ: 4.6,
  },
  {
    id: "dance",
    model: asset("/models/gallery/dance.glb"),
    name: "MOTION STUDY",
    edition: "Kinetic",
    price: 520_000,
    tagline: "Движение — всё",
    colors: {
      bg: "#0a0a14",
      fg: "#e0f4ff",
      muted: "#7090b0",
      accent: "#00d4ff",
      btn: "#0099cc",
      btnText: "#0a0a14",
      selectionBg: "#00d4ff",
      selectionFg: "#0a0a14",
    },
    lighting: {
      ambient: 0.4,
      keyIntensity: 1.3,
      keyPosition: [5, 4, 6],
      fillIntensity: 0.55,
      fillPosition: [-5, 3, -2],
      bg: "#0a0a14",
    },
    toolbarVariant: "dark",
    modelScale: 2.3,
    cameraZ: 4.3,
  },
  {
    id: "bomb",
    model: asset("/models/gallery/bomb.glb"),
    name: "FUSE LIT",
    edition: "High Risk",
    price: 999_000,
    tagline: "Тик-так",
    colors: {
      bg: "#141010",
      fg: "#fff0e0",
      muted: "#a08060",
      accent: "#ff6b1a",
      btn: "#cc3300",
      btnText: "#fff0e0",
      selectionBg: "#ff6b1a",
      selectionFg: "#141010",
    },
    lighting: {
      ambient: 0.38,
      keyIntensity: 1.15,
      keyPosition: [4, 5, 5],
      fillIntensity: 0.3,
      fillPosition: [-3, 1, -5],
      bg: "#141010",
    },
    toolbarVariant: "dark",
    modelScale: 2.5,
    cameraZ: 4,
  },
  {
    id: "light",
    model: asset("/models/gallery/light.glb"),
    name: "LUMEN",
    edition: "Glow",
    price: 750_000,
    tagline: "Свет в темноте",
    colors: {
      bg: "#faf6ee",
      fg: "#2a2210",
      muted: "#9a8a6a",
      accent: "#f5c518",
      btn: "#c9a000",
      btnText: "#1a1508",
      selectionBg: "#f5c518",
      selectionFg: "#1a1508",
    },
    lighting: {
      ambient: 0.8,
      keyIntensity: 1.4,
      keyPosition: [2, 6, 4],
      fillIntensity: 0.6,
      fillPosition: [-2, 3, -3],
      bg: "#faf6ee",
    },
    toolbarVariant: "light",
    modelScale: 2.2,
    cameraZ: 4.5,
  },
];

export function getThemeById(id: string) {
  return DROP_THEMES.find(t => t.id === id) ?? DROP_THEMES[0];
}

export function applyTheme(theme: DropTheme) {
  const root = document.documentElement;
  const c = theme.colors;
  root.style.setProperty("--bg", c.bg);
  root.style.setProperty("--fg", c.fg);
  root.style.setProperty("--muted", c.muted);
  root.style.setProperty("--accent", c.accent);
  root.style.setProperty("--btn", c.btn);
  root.style.setProperty("--btn-text", c.btnText);
  root.style.setProperty("--selection-bg", c.selectionBg);
  root.style.setProperty("--selection-fg", c.selectionFg);
  root.style.setProperty("--theme-transition", "background-color 0.45s ease, color 0.45s ease");
  root.style.backgroundColor = c.bg;
}
