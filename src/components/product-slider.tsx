"use client";

import dynamic from "next/dynamic";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { DROP_THEMES, type DropTheme } from "@/lib/drop-themes";
import { useTheme } from "@/lib/theme-context";
import { formatPrice } from "@/lib/format";
import { getThemeTagline, useT } from "@/lib/i18n";
import { ErrorBoundary } from "./error-boundary";
import { ThemeModelPlaceholder } from "./theme-model-placeholder";

const GlbViewer = dynamic(() => import("./glb-viewer").then(m => m.GlbViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--fg)]/15 border-t-[var(--fg)]" />
    </div>
  ),
});

interface ProductSliderProps {
  onThemeChange?: (theme: DropTheme) => void;
}

export function ProductSlider({ onThemeChange }: ProductSliderProps) {
  const { themeIndex, setThemeIndex } = useTheme();
  const { locale } = useT();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center", duration: 28 });
  const [activeIndex, setActiveIndex] = useState(themeIndex);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();
    setActiveIndex(idx);
    setThemeIndex(idx);
    onThemeChange?.(DROP_THEMES[idx]);
  }, [emblaApi, onThemeChange, setThemeIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    if (emblaApi.selectedScrollSnap() !== themeIndex) {
      emblaApi.scrollTo(themeIndex);
    }
    setActiveIndex(themeIndex);
  }, [emblaApi, themeIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const theme = DROP_THEMES[activeIndex];

  return (
    <div className="flex w-full max-w-xl flex-col items-center px-2">
      <div className="relative h-[min(52dvh,26rem)] w-full shrink-0 sm:h-[min(56dvh,28rem)]">
        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {DROP_THEMES.map((t, i) => (
              <div key={t.id} className="h-full min-w-0 shrink-0 grow-0 basis-full">
                <ErrorBoundary
                  fallback={<ThemeModelPlaceholder theme={t} />}
                >
                  <GlbViewer theme={t} active={i === activeIndex} />
                </ErrorBoundary>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 shrink-0 text-center text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[var(--muted)] transition-colors duration-300">
        {theme.name}
        <span className="mx-1.5 text-[var(--fg)]/20">—</span>
        {theme.edition}
      </p>

      <p className="mt-1.5 shrink-0 text-center text-base font-medium tracking-wide text-[var(--fg)] transition-colors duration-300">
        {formatPrice(theme.price, "UZS", locale)}
      </p>

      <p className="mt-1 shrink-0 text-center text-[0.65rem] uppercase tracking-[0.18em] text-[var(--accent)] transition-colors duration-300">
        {getThemeTagline(theme.id, locale, theme.tagline)}
      </p>
    </div>
  );
}
