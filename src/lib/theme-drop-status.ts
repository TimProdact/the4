import type { DropBadgePhase } from "./preview";
import { resolvePreDropStartsAt } from "./pre-drop";
import { t, type Locale } from "./i18n";

export interface ThemeDropStatus {
  phase: DropBadgePhase;
  stock: number;
  totalStock: number;
  /** Optional per-product drop time (ISO). Falls back to global drop startsAt. */
  startsAt?: string;
}

const PRE_DROP_OFFSET_MS: Record<string, number> = {
  "pixel-compact": 22 * 3_600_000 + 35 * 60_000 + 45 * 1000,
  "velvet-wings": 48 * 3_600_000,
  "pixel-figure": 96 * 3_600_000,
};

/** Per-product availability shown in the gallery slider. */
export const THEME_DROP_STATUS: Record<string, ThemeDropStatus> = {
  "cream-tube": { phase: "active", stock: 42, totalStock: 100 },
  "cosmetic-mirror": { phase: "sold_out", stock: 0, totalStock: 100 },
  "pixel-compact": { phase: "pre_drop", stock: 0, totalStock: 100 },
  "velvet-wings": { phase: "pre_drop", stock: 0, totalStock: 50 },
  heart: { phase: "active", stock: 17, totalStock: 200 },
  plant: { phase: "sold_out", stock: 0, totalStock: 100 },
  "toilet-paper": { phase: "active", stock: 88, totalStock: 100 },
  zombie: { phase: "active", stock: 6, totalStock: 666 },
  "pixel-figure": { phase: "pre_drop", stock: 0, totalStock: 256 },
  raccoon: { phase: "active", stock: 25, totalStock: 100 },
  dance: { phase: "sold_out", stock: 0, totalStock: 100 },
  bomb: { phase: "active", stock: 1, totalStock: 50 },
  light: { phase: "active", stock: 63, totalStock: 100 },
};

const DEFAULT_STATUS: ThemeDropStatus = {
  phase: "active",
  stock: 14,
  totalStock: 100,
};

const THEME_STOCK_KEY = "the4_theme_stock_v1";
const THEME_STARTS_AT_KEY = "the4_theme_starts_at_v1";

type ThemeStockOverrides = Record<string, { stock: number; phase?: DropBadgePhase }>;
type ThemeStartsAtOverrides = Record<string, string>;

function loadThemeStartsAtOverrides(): ThemeStartsAtOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(THEME_STARTS_AT_KEY);
    return raw ? (JSON.parse(raw) as ThemeStartsAtOverrides) : {};
  } catch {
    return {};
  }
}

function saveThemeStartsAtOverrides(data: ThemeStartsAtOverrides) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STARTS_AT_KEY, JSON.stringify(data));
}

/** Stable future ISO for per-theme pre-drop countdown (does not shift on every render). */
function getOrCreateThemeStartsAt(themeId: string, offsetMs: number): string {
  const overrides = loadThemeStartsAtOverrides();
  const existing = overrides[themeId];
  if (existing && new Date(existing).getTime() > Date.now()) {
    return existing;
  }

  const iso = new Date(Date.now() + offsetMs).toISOString();
  overrides[themeId] = iso;
  saveThemeStartsAtOverrides(overrides);
  return iso;
}

function loadThemeStockOverrides(): ThemeStockOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(THEME_STOCK_KEY);
    return raw ? (JSON.parse(raw) as ThemeStockOverrides) : {};
  } catch {
    return {};
  }
}

function saveThemeStockOverrides(data: ThemeStockOverrides) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STOCK_KEY, JSON.stringify(data));
}

function notifyThemeStockChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("the4:theme-stock"));
}

export function getThemeDropStatus(themeId: string): ThemeDropStatus {
  const base = THEME_DROP_STATUS[themeId] ?? DEFAULT_STATUS;
  const override = loadThemeStockOverrides()[themeId];
  if (!override) return base;

  const stock = override.stock;
  const phase =
    override.phase ??
    (base.phase === "active" && stock <= 0 ? "sold_out" : base.phase);

  return { ...base, stock, phase };
}

export function reserveThemeStock(themeId: string) {
  const status = getThemeDropStatus(themeId);
  const nextStock = Math.max(0, status.stock - 1);
  const overrides = loadThemeStockOverrides();
  overrides[themeId] = {
    stock: nextStock,
    phase:
      status.phase === "active" && nextStock <= 0
        ? "sold_out"
        : status.phase,
  };
  saveThemeStockOverrides(overrides);
  notifyThemeStockChange();
}

export function assertThemePurchasable(themeId: string, locale: Locale = "ru") {
  const { phase, stock } = getThemeDropStatus(themeId);
  if (phase === "pre_drop") {
    const err = new Error(t(locale, "errors.preDrop")) as Error & { code?: string };
    err.code = "PRE_DROP";
    throw err;
  }
  if (phase === "sold_out" || stock <= 0) {
    const err = new Error(t(locale, "drop.soldOut")) as Error & { code?: string };
    err.code = "SOLD_OUT";
    throw err;
  }
}

export function getThemeBadge(themeId: string) {
  const status = getThemeDropStatus(themeId);
  return {
    phase: status.phase,
    stock: status.stock,
    totalStock: status.totalStock,
  };
}

export function getThemeStartsAt(
  themeId: string,
  globalStartsAt: string,
  previewMode = false,
): string {
  const status = THEME_DROP_STATUS[themeId];
  if (status?.startsAt) {
    return previewMode
      ? resolvePreDropStartsAt(status.startsAt, true)
      : status.startsAt;
  }

  const offset = PRE_DROP_OFFSET_MS[themeId];
  if (status?.phase === "pre_drop" && offset !== undefined) {
    const iso = getOrCreateThemeStartsAt(themeId, offset);
    return previewMode ? resolvePreDropStartsAt(iso, true) : iso;
  }

  return previewMode
    ? resolvePreDropStartsAt(globalStartsAt, true)
    : globalStartsAt;
}

export function isPreDropTheme(themeId: string) {
  return getThemeDropStatus(themeId).phase === "pre_drop";
}

export function canBuyTheme(themeId: string) {
  const { phase, stock } = getThemeDropStatus(themeId);
  return phase === "active" && stock > 0;
}

export function themeBuyLabel(themeId: string, locale: Locale = "ru") {
  const { phase } = getThemeDropStatus(themeId);
  if (phase === "sold_out") return t(locale, "drop.soldOut");
  return t(locale, "drop.buyNow");
}
