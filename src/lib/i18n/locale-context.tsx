"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProfile } from "@/lib/profile-store";
import { getStoredLocale, setStoredLocale } from "./locale-storage";
import { localeToBcp47, t, translateError } from "./messages";
import type { Locale } from "./types";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  translateError: (message: string) => string;
  bcp47: string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function resolveLocale(): Locale {
  const userLocale = getProfile()?.locale;
  if (userLocale) return userLocale;
  return getStoredLocale() ?? "ru";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");

  const syncLocale = useCallback(() => {
    setLocaleState(resolveLocale());
  }, []);

  useEffect(() => {
    syncLocale();
    const onLocale = () => syncLocale();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "the4_profile_v1" || e.key === "the4_locale_v1") syncLocale();
    };
    window.addEventListener("the4:locale", onLocale);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("the4:locale", onLocale);
      window.removeEventListener("storage", onStorage);
    };
  }, [syncLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setStoredLocale(next);
    setLocaleState(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => t(locale, key, vars),
      translateError: (message) => translateError(locale, message),
      bcp47: localeToBcp47(locale),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useT() {
  const { t: translate, locale, setLocale, translateError: err, bcp47 } = useLocale();
  return { t: translate, locale, setLocale, translateError: err, bcp47 };
}
