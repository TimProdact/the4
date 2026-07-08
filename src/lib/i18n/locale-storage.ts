import type { Locale } from "./types";

const KEY = "the4_locale_v1";

export function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === "ru" || raw === "uz" || raw === "en") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function setStoredLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, locale);
  window.dispatchEvent(new CustomEvent("the4:locale"));
}
