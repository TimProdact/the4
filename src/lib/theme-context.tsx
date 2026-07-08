"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DROP_THEMES,
  applyTheme,
  getThemeById,
  mergeLiveProduct,
  type DropTheme,
} from "@/lib/drop-themes";
import type { LiveProduct } from "@/lib/types";

interface ThemeContextValue {
  theme: DropTheme;
  themeIndex: number;
  setTheme: (theme: DropTheme) => void;
  setThemeById: (id: string) => void;
  setThemeIndex: (index: number) => void;
  nextTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function indexOfTheme(id: string) {
  const idx = DROP_THEMES.findIndex(t => t.id === id);
  return idx >= 0 ? idx : 0;
}

export function ThemeProvider({
  children,
  initialThemeId,
  liveProduct,
}: {
  children: ReactNode;
  initialThemeId?: string;
  liveProduct?: LiveProduct;
}) {
  const [themeIndex, setThemeIndex] = useState(() =>
    initialThemeId ? indexOfTheme(initialThemeId) : 0,
  );

  const theme = useMemo(
    () => mergeLiveProduct(DROP_THEMES[themeIndex], liveProduct),
    [themeIndex, liveProduct],
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: DropTheme) => {
    setThemeIndex(indexOfTheme(next.id));
  }, []);

  const setThemeById = useCallback((id: string) => {
    setThemeIndex(indexOfTheme(id));
  }, []);

  const nextTheme = useCallback(() => {
    setThemeIndex(i => (i + 1) % DROP_THEMES.length);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      themeIndex,
      setTheme,
      setThemeById,
      setThemeIndex,
      nextTheme,
    }),
    [theme, themeIndex, setTheme, setThemeById, nextTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: DROP_THEMES[0],
      themeIndex: 0,
      setTheme: () => {},
      setThemeById: () => {},
      setThemeIndex: () => {},
      nextTheme: () => {},
    };
  }
  return ctx;
}
