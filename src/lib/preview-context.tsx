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
  nextPreview,
  readPreviewParams,
  type DropPreview,
} from "@/lib/preview";

interface PreviewContextValue {
  preview: DropPreview | null;
  cyclePreview: () => void;
}

const PreviewContext = createContext<PreviewContextValue | null>(null);

export function PreviewProvider({
  children,
  initialPreview = null,
}: {
  children: ReactNode;
  initialPreview?: DropPreview | null;
}) {
  const [preview, setPreview] = useState<DropPreview | null>(initialPreview);

  useEffect(() => {
    setPreview(readPreviewParams().preview);

    const sync = () => setPreview(readPreviewParams().preview);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const cyclePreview = useCallback(() => {
    const next = nextPreview(preview);
    const params = new URLSearchParams(window.location.search);
    params.set("preview", next);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
    setPreview(next);
  }, [preview]);

  const value = useMemo(() => ({ preview, cyclePreview }), [preview, cyclePreview]);

  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
}

export function usePreview() {
  const ctx = useContext(PreviewContext);
  if (!ctx) {
    return {
      preview: null as DropPreview | null,
      cyclePreview: () => {},
    };
  }
  return ctx;
}
