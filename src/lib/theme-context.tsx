"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DROP_THEMES,
  applyTheme,
  getThemeById,
  type DropTheme,
} from "@/lib/drop-themes";

interface ThemeContextValue {
  theme: DropTheme;
  setTheme: (theme: DropTheme) => void;
  setThemeById: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialThemeId,
}: {
  children: ReactNode;
  initialThemeId?: string;
}) {
  const [theme, setTheme] = useState(() => getThemeById(initialThemeId ?? DROP_THEMES[0].id));

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      setThemeById: (id: string) => setTheme(getThemeById(id)),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: DROP_THEMES[0],
      setTheme: () => {},
      setThemeById: () => {},
    };
  }
  return ctx;
}
