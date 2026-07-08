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
    id: "cream-tube",
    model: asset("/models/gallery/cream-tube.glb"),
    name: "SILK REPAIR",
    edition: "Face Cream",
    price: 320_000,
    tagline: "Питание без веса",
    colors: {
      bg: "#faf7f2",
      fg: "#2a2218",
      muted: "#9a8a78",
      accent: "#d4a574",
      btn: "#3d2e22",
      btnText: "#faf7f2",
      selectionBg: "#3d2e22",
      selectionFg: "#faf7f2",
    },
    lighting: {
      ambient: 0.72,
      keyIntensity: 1.05,
      keyPosition: [4, 6, 5],
      fillIntensity: 0.42,
      fillPosition: [-3, 2, -3],
      bg: "#faf7f2",
    },
    toolbarVariant: "light",
    modelScale: 2.6,
    cameraZ: 4.2,
  },
  {
    id: "cosmetic-mirror",
    model: asset("/models/gallery/cosmetic-mirror.glb"),
    name: "TRUE REFLECT",
    edition: "Compact Mirror",
    price: 185_000,
    tagline: "Смотри честно",
    colors: {
      bg: "#f0ece8",
      fg: "#1c1816",
      muted: "#8a8078",
      accent: "#c9a88a",
      btn: "#2a2420",
      btnText: "#f0ece8",
      selectionBg: "#2a2420",
      selectionFg: "#f0ece8",
    },
    lighting: {
      ambient: 0.78,
      keyIntensity: 1.1,
      keyPosition: [3, 5, 6],
      fillIntensity: 0.5,
      fillPosition: [-4, 2, -2],
      bg: "#f0ece8",
    },
    toolbarVariant: "light",
    modelScale: 3.2,
    cameraZ: 3.6,
  },
  {
    id: "pixel-compact",
    model: asset("/models/gallery/pixel-compact.glb"),
    name: "PIXEL GLOW",
    edition: "Cushion Compact",
    price: 290_000,
    tagline: "Тон — в один тап",
    colors: {
      bg: "#1a1030",
      fg: "#f0e6ff",
      muted: "#a080d0",
      accent: "#e879f9",
      btn: "#a21caf",
      btnText: "#fdf4ff",
      selectionBg: "#e879f9",
      selectionFg: "#1a1030",
    },
    lighting: {
      ambient: 0.5,
      keyIntensity: 1.15,
      keyPosition: [4, 6, 5],
      fillIntensity: 0.48,
      fillPosition: [-3, 2, -4],
      bg: "#1a1030",
    },
    toolbarVariant: "dark",
    modelScale: 2.1,
    cameraZ: 4.5,
  },
  {
    id: "velvet-wings",
    model: asset("/models/gallery/velvet-wings.glb"),
    name: "WINGS OF SCENT",
    edition: "Eau de Parfum",
    price: 680_000,
    tagline: "Аромат, который летит",
    colors: {
      bg: "#120a18",
      fg: "#f5e8ff",
      muted: "#b090c8",
      accent: "#d946ef",
      btn: "#86198f",
      btnText: "#fdf4ff",
      selectionBg: "#d946ef",
      selectionFg: "#120a18",
    },
    lighting: {
      ambient: 0.42,
      keyIntensity: 1.25,
      keyPosition: [3, 5, 6],
      fillIntensity: 0.55,
      fillPosition: [-5, 2, -3],
      bg: "#120a18",
    },
    toolbarVariant: "dark",
    modelScale: 1.9,
    cameraZ: 5.2,
  },
  {
    id: "heart",
    model: asset("/models/gallery/heart.glb"),
    name: "PULSE TINT",
    edition: "Lip Oil",
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
    name: "BOTANICA",
    edition: "Botanical Serum",
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
    name: "CLOUD SOFT",
    edition: "Cleansing Pads",
    price: 99_000,
    tagline: "Нежность в рулоне",
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
    name: "MIDNIGHT PEEL",
    edition: "Exfoliating Mask",
    price: 666_000,
    tagline: "Снимает всё лишнее",
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
    name: "8-BIT PALETTE",
    edition: "Eyeshadow",
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
    name: "NIGHT FIX",
    edition: "Eye Cream",
    price: 450_000,
    tagline: "После бессонной ночи",
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
    name: "KINETIC MIST",
    edition: "Setting Spray",
    price: 520_000,
    tagline: "Макияж не сдвинется",
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
    name: "VITAMIN POP",
    edition: "C Serum",
    price: 999_000,
    tagline: "Заряд для кожи",
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
    name: "LUMEN GLOW",
    edition: "Highlighter",
    price: 750_000,
    tagline: "Свет с кожи",
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

export function mergeLiveProduct(base: DropTheme, product?: {
  id?: string;
  name?: string;
  edition?: string;
  price?: number;
  tagline?: string;
  modelUrl?: string;
  colors?: Partial<DropTheme["colors"]>;
  toolbarVariant?: DropTheme["toolbarVariant"];
  modelScale?: number;
  cameraZ?: number;
}): DropTheme {
  if (!product) return base;
  return {
    ...base,
    id: product.id || base.id,
    name: product.name || base.name,
    edition: product.edition || base.edition,
    price: product.price ?? base.price,
    tagline: product.tagline || base.tagline,
    model: product.modelUrl || base.model,
    colors: product.colors ? { ...base.colors, ...product.colors } : base.colors,
    toolbarVariant: product.toolbarVariant || base.toolbarVariant,
    modelScale: product.modelScale ?? base.modelScale,
    cameraZ: product.cameraZ ?? base.cameraZ,
  };
}

export function applyTheme(theme: DropTheme) {
  const root = document.documentElement;
  const c = theme.colors;
  const dark = theme.toolbarVariant === "dark";

  root.style.setProperty("--bg", c.bg);
  root.style.setProperty("--fg", c.fg);
  root.style.setProperty("--muted", c.muted);
  root.style.setProperty("--accent", c.accent);
  root.style.setProperty("--btn", c.btn);
  root.style.setProperty("--btn-text", c.btnText);
  root.style.setProperty("--selection-bg", c.selectionBg);
  root.style.setProperty("--selection-fg", c.selectionFg);

  root.style.setProperty("--stock-pill-bg", `color-mix(in srgb, ${c.accent} 16%, ${c.bg})`);
  root.style.setProperty("--stock-pill-text", `color-mix(in srgb, ${c.accent} 70%, ${c.fg})`);
  root.style.setProperty("--stock-sold-text", c.muted);

  root.style.setProperty("--sheet-bg", dark ? `color-mix(in srgb, ${c.fg} 6%, ${c.bg})` : "#f5f4f0");
  root.style.setProperty("--sheet-fg", c.fg);
  root.style.setProperty("--sheet-muted", c.muted);
  root.style.setProperty("--sheet-border", dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)");

  root.style.setProperty("--state-success", dark ? "#6ee7a8" : "#15803d");
  root.style.setProperty("--state-warning", dark ? "#fbbf24" : "#b45309");
  root.style.setProperty("--state-error", c.accent);
  root.style.setProperty("--state-error-bg", `color-mix(in srgb, ${c.accent} 12%, ${c.bg})`);

  root.style.setProperty("--overlay-scrim", dark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.4)");
  root.style.setProperty("--soldout-stamp", c.fg);

  root.style.backgroundColor = c.bg;
}
